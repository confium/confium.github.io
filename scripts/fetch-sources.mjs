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

import { existsSync, readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VENDOR = join(ROOT, 'vendor');

const SPECS_REPO = 'https://github.com/confium/specs.git';
const SPECS_REF = process.env.CONFIUM_SPECS_REF || 'main';

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
  for (const file of readdirSync(softwareDir)) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    const fm = loadFrontmatter(join(softwareDir, file));
    if (!fm || !fm.docs_repo) continue;
    const id = file.replace(/\.(md|mdx)$/, '');
    const bare = fm.docs_repo.replace(/^github\.com\//, '');
    const repoHttps = `https://${bare.replace(/^[\/@]+/, '').replace(':', '/')}.git`;
    const sparsePaths = ['README*', `/${fm.docs_subtree || 'docs'}/`];
    sparseClone(repoHttps, fm.docs_ref || 'main', join(VENDOR, id), sparsePaths);
  }
}

function fetchSpecs() {
  const specsDir = join(ROOT, 'src/content/specs');
  if (!existsSync(specsDir)) {
    console.log('[fetch-sources] no src/content/specs/ — skipping specs');
    return;
  }
  sparseClone(SPECS_REPO, SPECS_REF, join(VENDOR, 'specs'), ['specs/', 'README*']);
}

console.log('[fetch-sources] starting');
fetchSoftwareDocs();
fetchSpecs();
console.log('[fetch-sources] done');
