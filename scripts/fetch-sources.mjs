/**
 * Sparse-checkout vendor sources for per-repo docs and specs.
 *
 * Reads `src/content/software/*.md` for `docs_repo`, `docs_ref`,
 * `docs_subtree`, and clones each into `vendor/<id>/` using a sparse
 * checkout limited to `README*` and `/<docs_subtree>/`.
 *
 * Reads `src/content/specs/*.md` and clones the specs repo into
 * `vendor/specs/` with a sparse checkout of the `specs/` directory.
 *
 * Failures degrade gracefully: a missing repo or unreachable ref
 * logs a warning and the site builds without those docs. A real
 * build failure (corrupt content) is left for Astro to surface.
 */

import { existsSync, readFileSync, mkdirSync, readdirSync, writeFileSync, rmSync, statSync, cpSync } from 'node:fs';
import { relative, resolve as resolvePath } from 'node:path';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VENDOR = join(ROOT, 'vendor');

const SPECS_REPO = 'https://github.com/confium/specs.git';

// Vendored doc files the public site must not render. cnml-profile
// documents the institutional certificate format the site's
// neutrality policy keeps off www.confium.org (the OIML quality
// gate enforces it); the page stays in the upstream repo.
const BLOCKED_DOCS = ['cnml-profile.mdx'];
// Spec sources kept out of the central site for the same reason:
// the institutional CNML deployment spec stays in the specs repo.
const BLOCKED_SPECS = ['80-cnml-deployment.adoc'];
const SPECS_REF = process.env.CONFIUM_SPECS_REF || 'main';
const SPECS_RAW_BASE =
  'https://raw.githubusercontent.com/confium/specs/main';

/**
 * @param {string} repo
 * @param {string} ref
 * @param {string} targetDir
 * @param {string[]} sparsePaths
 */
function sparseClone(repo, ref, targetDir, sparsePaths) {
  if (existsSync(targetDir)) {
    console.log(`[fetch-sources] reusing ${targetDir}`);
    return;
  }
  mkdirSync(VENDOR, { recursive: true });
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
 * The specs repo is AsciiDoc; the site renders Markdown. Emit one
 * `.md` per vendored `.adoc` (the AsciiDoc sources stay untouched in
 * the vendor tree) with generated frontmatter, then the `specDocs`
 * content collection picks them up. Not a general converter — the
 * specs corpus is the contract.
 */
function convertSpecs(target, skippedImages) {
  const specsDir = join(target, 'specs');
  if (!existsSync(specsDir)) return;
  for (const entry of readdirSync(specsDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.adoc')) continue;
    if (BLOCKED_SPECS.includes(entry.name)) {
      console.log(`[fetch-sources] skipping blocked spec ${entry.name}`);
      continue;
    }
    const text = readFileSync(join(specsDir, entry.name), 'utf8');
    const { frontmatter, body } = adocToMarkdown(text, entry.name, specsDir, skippedImages);
    const out = `---\n${frontmatter}\n---\n\n${body}`;
    writeFileSync(join(specsDir, entry.name.replace(/\.adoc$/, '.md')), out);
  }
}

/**
 * Spec diagrams live at the specs repo root; serve them from the
 * site itself rather than hotlinking raw.githubusercontent.com.
 * Diagrams whose text trips the OIML neutrality gate stay on
 * GitHub — they are returned as the skipped set so the converter
 * can link out instead of embedding.
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
    if (/oiml/i.test(readFileSync(s, 'utf8'))) {
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

function specCategory(id, product) {
  if (product) return product;
  if (id === 'PRODUCTS') return 'index';
  const n = parseInt(id, 10);
  if (!Number.isNaN(n)) {
    if (n <= 9) return 'architecture';
    if (n <= 19) return 'modes';
  }
  return 'security';
}

function extractDescription(body) {
  const prose = body
    .split('\n')
    .map((l) => l.trim())
    .find(
      (l) =>
        l &&
        !/^[#>|!`={]/.test(l) &&
        !l.startsWith('['),
    );
  if (!prose) return '';
  const flat = prose.replace(/\s+/g, ' ');
  const cut = flat.search(/[.!?](\s|$)/);
  return (cut === -1 ? flat : flat.slice(0, cut + 1)).slice(0, 240);
}

function yamlQuote(value) {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function emitTable(rows) {
  const cells = rows
    .filter((r) => r.trim() !== '')
    .map((r) =>
      r
        .replace(/^\|/, '')
        .split('|')
        .map((c) => c.trim()),
    );
  if (!cells.length) return [];
  const width = Math.max(...cells.map((c) => c.length));
  const norm = cells.map((c) => {
    while (c.length < width) c.push('');
    return c;
  });
  const md = [`| ${norm[0].join(' | ')} |`, `|${' --- |'.repeat(width)}`];
  for (const r of norm.slice(1)) md.push(`| ${r.join(' | ')} |`);
  return md;
}

/**
 * Rewrite `link:` and `image::` macros inline. Relative spec links
 * become site URLs (GitHub blob for specs that do not exist as
 * pages, e.g. unwritten drafts or blocked files); `../images/x.svg`
 * points at the copied `/specs/images/x.svg`.
 */
function specInline(text, specsDir, skippedImages) {
  text = text.replace(
    /link:\+\+(.+?)\+\+\[([^\]]*)\]/g,
    (_, url, label) => `[${label || url}](${url})`,
  );
  text = text.replace(
    /link:((?:https?:|mailto:)[^\s[]+)\[([^\]]*)\]/g,
    (_, url, label) => `[${label || url}](${url})`,
  );
  text = text.replace(
    /link:([\w./-]+?\.adoc)\[([^\]]*)\]/g,
    (_m, target, label) => {
      const leaf = target.replace(/\.adoc$/, '').split('/').pop();
      const label2 = label || leaf;
      // Resolve against the AsciiDoc source, not the generated .md —
      // conversion order must not decide where a link points.
      if (BLOCKED_SPECS.includes(`${leaf}.adoc`)) {
        return `[${label2}](https://github.com/confium/specs/blob/main/specs/${target})`;
      }
      if (existsSync(join(specsDir, `${leaf}.adoc`))) {
        return `[${label2}](/specs/${leaf}/)`;
      }
      // Unwritten spec: keep the cross-reference as plain text rather
      // than linking to a GitHub page that does not exist either.
      return label2;
    },
  );
  // Bare AsciiDoc URL macro: `https://host/path[label]`.
  text = text.replace(
    /(^|[\s(])((?:https?:\/\/)[^\s[]+)\[([^\]\n]{1,80})\]/g,
    (_m, pre, url, label) => `${pre}[${label}](${url})`,
  );
  text = text.replace(/image::([\w./-]+\.\w+)\[([^\]]*)\]/g, (_m, path, alt) => {
    const file = path.split('/').pop();
    if (skippedImages.includes(file)) {
      return `[${alt || 'View diagram'} (SVG)](https://github.com/confium/specs/blob/main/images/${file})`;
    }
    const rel = path.replace(/^(\.\.\/)+/, '');
    return `![${alt}](${rel.startsWith('images/') ? `/specs/${rel}` : `${SPECS_RAW_BASE}/${rel}`})`;
  });
  return text;
}

/**
 * @param {string} text
 * @param {string} adocName
 * @param {string} specsDir
 * @param {string[]} skippedImages
 * @returns {{ frontmatter: string, body: string }}
 */
function adocToMarkdown(text, adocName, specsDir, skippedImages) {
  const lines = text.split('\n');
  const attrs = {};
  let title = adocName.replace(/\.adoc$/, '');
  let i = 0;
  if (lines[0] && /^= /.test(lines[0])) {
    title = lines[0].replace(/^= +/, '').trim();
    i = 1;
  }
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line === '') break;
    const attr = line.match(/^:([\w-]+):\s*(.*)$/);
    if (attr) {
      attrs[attr[1]] = attr[2].trim();
      continue;
    }
    if (/ <[^>]+>$/.test(line)) continue; // author line
  }
  const out = [];
  let inFence = false;
  let inListing = false;
  let pendingLang = null;
  let table = null;
  for (; i < lines.length; i++) {
    let line = lines[i];
    if (line.startsWith('```')) {
      out.push(line);
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (line === '----') {
      if (inListing) {
        out.push('```');
        inListing = false;
      } else {
        out.push('```' + (pendingLang ?? ''));
        inListing = true;
      }
      pendingLang = null;
      continue;
    }
    if (inListing) {
      out.push(line);
      continue;
    }
    const src = line.match(/^\[source(?:,\s*([\w+.-]+))?\]\s*$/);
    if (src) {
      pendingLang = src[1] ?? '';
      continue;
    }
    if (line.trim() === '|===') {
      if (table) {
        out.push(...emitTable(table));
        table = null;
      } else {
        table = [];
      }
      continue;
    }
    if (table) {
      if (/^\[(cols|frame|grid)/i.test(line.trim())) continue;
      table.push(line);
      continue;
    }
    line = specInline(line, specsDir, skippedImages);
    line = line.replace(/^(={1,6}) +(.+?)(?:\s*=*)$/, (_m, eq, txt) => '#'.repeat(eq.length) + ' ' + txt);
    out.push(line);
  }
  if (table) out.push(...emitTable(table));

  const id = adocName.replace(/\.adoc$/, '');
  const description = extractDescription(out.join('\n'));
  const fm = [
    `title: ${yamlQuote(title)}`,
    description ? `description: ${yamlQuote(description)}` : null,
    `upstream_path: ${yamlQuote(`specs/${adocName}`)}`,
    `category: ${specCategory(id, attrs.product)}`,
    /^\d/.test(id) ? `spec_id: ${parseInt(id, 10)}` : null,
    attrs.status ? `status: ${yamlQuote(attrs.status)}` : null,
    attrs.implementation ? `implementation: ${yamlQuote(attrs.implementation)}` : null,
    attrs.product ? `product: ${yamlQuote(attrs.product)}` : null,
  ].filter(Boolean);
  return { frontmatter: fm.join('\n'), body: out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n' };
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
fetchSoftwareDocs();
fetchSpecs();
console.log('[fetch-sources] done');
