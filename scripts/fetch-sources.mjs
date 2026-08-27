/**
 * Sparse-checkout vendor sources for per-repo docs and specs.
 *
 * Software docs: reads `src/content/software/*.md` for `docs_repo`,
 * `docs_ref`, `docs_subtree`, clones each into `vendor/<id>/` with a
 * sparse checkout, then rewrites repo-relative links into site URLs.
 *
 * Specs: clones the specs repo into `vendor/specs/`, converts every
 * `specs/*.adoc` to a sibling `.md` (pure conversion lives in
 * scripts/lib/specs-converter.mjs), and copies embeddable diagrams
 * into `public/specs/images/`. What may render is decided by
 * scripts/lib/neutrality.mjs.
 *
 * Failures degrade gracefully: a missing repo or unreachable ref
 * logs a warning and the site builds without those docs. A real
 * build failure (corrupt content) is left for Astro to surface.
 *
 * Set CONFIUM_REFRESH_SOURCES=1 to fast-forward existing vendor
 * clones instead of silently reusing them (the default keeps
 * offline-friendly reuse; CI always fetches fresh).
 */

import { existsSync, readFileSync, mkdirSync, readdirSync, writeFileSync, rmSync, statSync, cpSync } from 'node:fs';
import { relative, resolve as resolvePath } from 'node:path';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

import { convertSpec, serializeSpec } from './lib/specs-converter.mjs';
import { BLOCKED_DOCS, isBlockedSpec, isNeutralitySvg } from './lib/neutrality.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VENDOR = join(ROOT, 'vendor');

const SPECS_REPO = 'https://github.com/confium/specs.git';
const SPECS_REF = process.env.CONFIUM_SPECS_REF || 'main';

const REFRESH = process.env.CONFIUM_REFRESH_SOURCES === '1';

/**
 * @param {string} repo
 * @param {string} ref
 * @param {string} targetDir
 * @param {string[]} sparsePaths
 */
function sparseClone(repo, ref, targetDir, sparsePaths) {
  mkdirSync(VENDOR, { recursive: true });
  if (existsSync(targetDir)) {
    if (!REFRESH) {
      console.log(`[fetch-sources] reusing ${targetDir}`);
      return;
    }
    console.log(`[fetch-sources] refreshing ${targetDir} to ${ref}`);
    try {
      execSync(`git fetch --quiet origin ${ref}`, { cwd: targetDir });
      execSync('git checkout --quiet FETCH_HEAD', { cwd: targetDir });
    } catch (err) {
      console.warn(
        `[fetch-sources] WARNING: refresh failed for ${targetDir} — ${err.message}`,
      );
    }
    return;
  }
  console.log(`[fetch-sources] cloning ${repo}@${ref} → ${targetDir}`);
  try {
    execSync(
      `git clone --depth 1 --filter=blob:none --sparse --branch ${ref} ${repo} ${targetDir}`,
      { stdio: 'inherit', cwd: VENDOR },
    );
    execSync(`git sparse-checkout set ${sparsePaths.join(' ')}`, {
      stdio: 'inherit',
      cwd: targetDir,
    });
  } catch (err) {
    console.warn(
      `[fetch-sources] WARNING: failed to clone ${repo}@${ref} — ${err.message}`,
    );
    console.warn(`[fetch-sources] site will build without these docs`);
  }
}

/**
 * @param {string} filePath
 * @returns {Record<string, string> | null}
 */
function loadFrontmatter(filePath) {
  if (!existsSync(filePath)) return null;
  const text = readFileSync(filePath, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  /** @type {Record<string, string>} */
  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (m) frontmatter[m[1]] = m[2];
  }
  return frontmatter;
}

function fetchSoftwareDocs() {
  const softwareDir = join(ROOT, 'src/content/software');
  if (!existsSync(softwareDir)) {
    console.log('[fetch-sources] no src/content/software/ — skipping');
    return;
  }
  const vendored = [];
  for (const file of readdirSync(softwareDir)) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    const fm = loadFrontmatter(join(softwareDir, file));
    if (!fm || !fm.docs_repo) continue;
    const id = file.replace(/\.(md|mdx)$/, '');
    const repoHttps = normalizeRepoUrl(fm.docs_repo);
    const subtree = (fm.docs_subtree || 'docs').replace(/^\/+|\/+$/g, '');
    const target = join(VENDOR, id);
    sparseClone(repoHttps, fm.docs_ref || 'main', target, [subtree]);
    for (const blocked of BLOCKED_DOCS) {
      const file = join(target, subtree, blocked);
      if (existsSync(file)) rmSync(file);
    }
    vendored.push({ target, subtree, id, repo: repoHttps, ref: fm.docs_ref || 'main' });
  }
  // Second pass: link rewriting needs every vendor present — the
  // per-language docs cross-link into the full tree under `rust`.
  for (const v of vendored) {
    rewriteDocLinks(v.target, v.subtree, v.id, v.repo, v.ref);
    sanitizeMdxHeaders(v.target);
  }
}

function fetchSpecs() {
  const specsDir = join(ROOT, 'src/content/specs');
  if (!existsSync(specsDir)) {
    console.log('[fetch-sources] no src/content/specs/ — skipping specs');
    return;
  }
  const target = join(VENDOR, 'specs');
  sparseClone(SPECS_REPO, SPECS_REF, target, ['specs/', 'images/']);
  const skippedImages = copySpecImages(target);
  convertSpecs(target, skippedImages);
  sanitizeMdxHeaders(target);
}

/**
 * The fs-backed resolve adapter for the specs converter: it answers
 * existence/policy questions so the converter itself stays pure.
 *
 * @param {string} target - vendor/specs
 * @param {string[]} skippedImages - diagrams the neutrality policy keeps off-site
 */
function specsResolve(target, skippedImages) {
  const specsDir = join(target, 'specs');
  const imagesDir = join(target, 'images');
  return {
    specHref(leaf) {
      return existsSync(join(specsDir, `${leaf}.adoc`)) ? `/specs/${leaf}/` : null;
    },
    specStatus(leaf) {
      if (isBlockedSpec(`${leaf}.adoc`)) return 'blocked';
      return existsSync(join(specsDir, `${leaf}.adoc`)) ? 'page' : 'missing';
    },
    imageHref(file) {
      if (skippedImages.includes(file)) return null;
      return existsSync(join(imagesDir, file)) ? `/specs/images/${file}` : null;
    },
    blobUrl(path) {
      return `https://github.com/confium/specs/blob/${SPECS_REF}/${path}`;
    },
  };
}

/**
 * Emit one `.md` per vendored `.adoc`; the AsciiDoc sources stay
 * untouched in the vendor tree. The `specDocs` content collection
 * picks up the generated `.md` files.
 */
function convertSpecs(target, skippedImages) {
  const specsDir = join(target, 'specs');
  if (!existsSync(specsDir)) return;
  const resolve = specsResolve(target, skippedImages);
  for (const entry of readdirSync(specsDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.adoc')) continue;
    if (isBlockedSpec(entry.name)) {
      console.log(`[fetch-sources] skipping blocked spec ${entry.name}`);
      continue;
    }
    const text = readFileSync(join(specsDir, entry.name), 'utf8');
    const converted = convertSpec(text, entry.name, resolve);
    writeFileSync(join(specsDir, entry.name.replace(/\.adoc$/, '.md')), serializeSpec(converted));
  }
  console.log(`[fetch-sources] converted specs to markdown`);
}

/**
 * Spec diagrams live at the specs repo root; serve them from the
 * site itself rather than hotlinking raw.githubusercontent.com.
 * Returns the files the neutrality policy kept off-site so the
 * converter can link out instead of embedding.
 */
function copySpecImages(target) {
  const src = join(target, 'images');
  if (!existsSync(src)) return [];
  const dst = join(ROOT, 'public', 'specs', 'images');
  mkdirSync(dst, { recursive: true });
  const skipped = [];
  for (const f of readdirSync(src)) {
    const s = join(src, f);
    if (!statSync(s).isFile()) continue;
    if (isNeutralitySvg(readFileSync(s, 'utf8'))) {
      skipped.push(f);
      continue;
    }
    cpSync(s, join(dst, f));
  }
  console.log(`[fetch-sources] copied spec diagrams to public/specs/images`);
  if (skipped.length) {
    console.log(`[fetch-sources] kept off-site (neutrality): ${skipped.join(', ')}`);
  }
  return skipped;
}

/**
 * Patches vendored MDX to survive the MDX 3 parser:
 *
 *  - HTML comments at the top of a file (`<!-- ... -->`) are illegal;
 *    the `<!` is parsed as JSX. Rewrite to MDX-style comments.
 *  - Markdown autolinks (`<https://...>`) are not accepted by MDX;
 *    rewrite to explicit `[label](url)` links.
 */
/**
 * Rewrite repo-relative `.md`/`.mdx` links in vendored docs into
 * absolute site URLs (`/software/{id}/docs/...`). Upstream docs are
 * written for GitHub browsing; on the nested site the same relative
 * links would resolve against the rendered page's URL and 404.
 * Only links whose target exists inside the vendored subtree are
 * rewritten; anything else (anchors, images, external) is kept.
 */
function rewriteDocLinks(root, subtree, id, repoHttps, ref) {
  // Cone-mode sparse checkout of a nested subtree (docs/bindings)
  // also pulls the files directly under docs/; walk the whole docs
  // root so those top-level files get rewritten too.
  const docsRoot = join(root, subtree.split('/')[0]);
  const files = readdirSync(docsRoot, { withFileTypes: true, recursive: true });
  for (const entry of files) {
    if (!entry.isFile() || (!entry.name.endsWith('.md') && !entry.name.endsWith('.mdx'))) continue;
    const parent = entry.path ?? entry.parentPath ?? docsRoot;
    const path = join(parent, entry.name);
    const text = readFileSync(path, 'utf8');
    const re = /\]\(([^)#\s]+?)(#[^)\s]*)?\)/g;
    let changed = false;
    const out = text.replace(re, (m, target, anchor) => {
      // Upstream docs sometimes assume the site's /docs/ IA; map
      // those into this vendor's own docs tree.
      if (target.startsWith('/docs/')) {
        const t = target.slice('/docs/'.length)
          .replace(/\.(md|mdx)$/, '')
          .split('/')
          .map((seg) => seg.toLowerCase().replace(/[^\w-]/g, ''))
          .join('/');
        const cands = [join(docsRoot, `${t}.mdx`), join(docsRoot, `${t}.md`),
                       join(docsRoot, t, 'index.mdx')];
        for (const c of cands) {
          if (existsSync(c)) {
            changed = true;
            return `](/software/${id}/docs/${t}${anchor ?? ''})`;
          }
        }
        return m;
      }
      // Only rewrite relative, potentially-doc links: skip URLs,
      // images, mailto, and site-absolute links.
      if (/^(https?:|mailto:|\/|\.png|\.jpe?g|\.svg|\.gif)/i.test(target)) return m;
      let resolved = resolvePath(dirname(path), target);
      // Extensionless sibling links: try the .mdx/.md/index forms.
      if (!/\.(md|mdx)$/.test(resolved)) {
        for (const cand of [`${resolved}.mdx`, `${resolved}.md`,
                            join(resolved, 'index.mdx'), join(resolved, 'index.md')]) {
          if (existsSync(cand)) { resolved = cand; break; }
        }
      }
      if (!/\.(md|mdx)$/.test(resolved)) {
        // Escapes the docs root (e.g. ../CONTRIBUTING.md): link to
        // the upstream repository.
        if (!resolved.startsWith(resolvePath(root) + '/')) return m;
        const inRepoRoot = relative(join(VENDOR, id), resolved);
        return `](${repoHttps.replace(/\.git$/, '')}/blob/${ref}/${inRepoRoot}${anchor ?? ''})`;
      }
      if (!resolved.startsWith(resolvePath(docsRoot) + '/')) {
        if (!resolved.startsWith(resolvePath(root) + '/')) return m;
        const inRepoRoot = relative(join(VENDOR, id), resolved);
        return `](${repoHttps.replace(/\.git$/, '')}/blob/${ref}/${inRepoRoot}${anchor ?? ''})`;
      }
      if (existsSync(resolved)) {
        // Mirror Astro's github-slugger (dots and other
        // non-word chars are stripped per segment).
        const rel = relative(resolvePath(docsRoot), resolved)
          .replace(/\.(md|mdx)$/, '')
          .replace(/\/index$/, '')
          .split('/')
          .map((seg) => seg.toLowerCase().replace(/[^\w-]/g, ''))
          .join('/');
        changed = true;
        return `](/software/${id}/docs/${rel}${anchor ?? ''})`;
      }
      // The per-language vendors pull only the bindings subtree plus
      // the top level of docs/; links into the rest of the confium
      // docs resolve against the full tree vendored under `rust`,
      // mapped by position within the docs root.
      const rustDocs = join(VENDOR, 'rust', 'docs');
      const alt = resolvePath(rustDocs, relative(resolvePath(docsRoot), resolved));
      if (existsSync(rustDocs) && alt.startsWith(resolvePath(rustDocs) + '/') && existsSync(alt)) {
        const rel = relative(resolvePath(rustDocs), alt)
          .replace(/\.(md|mdx)$/, '')
          .replace(/\/index$/, '')
          .split('/')
          .map((seg) => seg.toLowerCase().replace(/[^\w-]/g, ''))
          .join('/');
        changed = true;
        return `](/software/rust/docs/${rel}${anchor ?? ''})`;
      }
      // Target exists nowhere in the vendored trees: send readers to
      // the upstream repository instead of a dead link.
      const inRepo = relative(join(VENDOR, id), resolved);
      changed = true;
      return `](${repoHttps.replace(/\.git$/, '')}/blob/${ref}/${inRepo}${anchor ?? ''})`;
    });
    if (changed) {
      writeFileSync(path, out);
      console.log(`[fetch-sources] rewrote links in ${relative(ROOT, path)}`);
    }
  }
}

function sanitizeMdxHeaders(root) {
  const files = readdirSync(root, { withFileTypes: true, recursive: true });
  for (const entry of files) {
    if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue;
    const parent = entry.path ?? entry.parentPath ?? root;
    const path = join(parent, entry.name);
    const text = readFileSync(path, 'utf8');
    let sanitized = text;
    if (sanitized.match(/^<!--/m)) {
      sanitized = sanitized.replace(/^<!--([\s\S]*?)-->/, '{/*$1*/}');
    }
    sanitized = sanitized.replace(
      /<((?:https?|mailto):[^>\s]+)>/g,
      (_, url) => `[${url}](${url})`,
    );
    // Escape {braces} in prose so upstream template placeholders
    // render literally instead of failing as JSX expressions.
    sanitized = sanitized.replace(/(^|[^`{])\{([a-zA-Z][a-zA-Z0-9_-]*)\}/g, '$1\\{$2\\}');
    if (sanitized !== text) {
      writeFileSync(path, sanitized);
      console.log(`[fetch-sources] sanitized ${path}`);
    }
  }
}

/**
 * Accepts either "github.com/owner/repo" or "owner/repo" and returns
 * the canonical HTTPS clone URL.
 * @param {string} repo
 * @returns {string}
 */
function normalizeRepoUrl(repo) {
  const trimmed = repo.replace(/^\/+|\/+$/g, '');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.endsWith('.git') ? trimmed : `${trimmed}.git`;
  }
  if (trimmed.startsWith('git@')) {
    return trimmed;
  }
  const cleaned = trimmed.replace(/^github\.com\//, '');
  return `https://github.com/${cleaned}${cleaned.endsWith('.git') ? '' : '.git'}`;
}

console.log('[fetch-sources] starting');
// Optional scope arg ("software" or "specs") so CI can pull just the
// corpus the golden converter tests need without cloning every
// software-docs repo.
const scope = process.argv[2];
if (!scope || scope === 'software') fetchSoftwareDocs();
if (!scope || scope === 'specs') fetchSpecs();
console.log('[fetch-sources] done');
