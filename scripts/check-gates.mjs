/**
 * The site's quality gates, in one runnable module: the same checks
 * CI enforces on dist/ are available locally via `npm run
 * check:gates`, and the collector is unit-testable.
 *
 * Gates:
 *  1. No OIML reference anywhere in dist/ (any file — the neutrality
 *     policy covers diagram text as well as pages).
 *  2. No TODO / coming-soon / planned / milestone / roadmap language
 *     in built html/md/mdx.
 *  3. Every page under dist/specs renders real content — a spec page
 *     whose converter output silently came out empty would otherwise
 *     ship with only its hero. Specs have multiple sections upstream,
 *     so two or more <h2> headings is the completeness signal.
 *  4. dist/specs carries at least `minSpecPages` pages — an empty or
 *     gutted specs section (failed vendor pull) must fail loudly, not
 *     pass vacuously.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const FORBIDDEN_LANGUAGE = /TODO|coming soon|planned|milestone|roadmap/i;
const LANGUAGE_EXTENSIONS = new Set(['.html', '.md', '.mdx']);
const DEFAULT_MIN_SPEC_PAGES = 30;

function walkFiles(root) {
  const out = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(path));
    else if (entry.isFile()) out.push(path);
  }
  return out;
}

/**
 * @param {string} distDir - absolute or repo-relative dist directory
 * @param {{ minSpecPages?: number }} [options] - floor for gate 4 (tests lower it)
 * @returns {{
 *   oiml: string[],
 *   language: string[],
 *   incompleteSpecs: string[],
 * }} violating files per gate; empty arrays = clean
 */
export function collectGateViolations(distDir, { minSpecPages = DEFAULT_MIN_SPEC_PAGES } = {}) {
  const files = walkFiles(distDir);
  const oiml = [];
  const language = [];
  for (const path of files) {
    const text = readFileSync(path, 'utf8');
    if (/oiml/i.test(text)) oiml.push(path);
    if (LANGUAGE_EXTENSIONS.has(extname(path)) && FORBIDDEN_LANGUAGE.test(text)) {
      language.push(path);
    }
  }
  const incompleteSpecs = [];
  const specsDir = join(distDir, 'specs');
  let specPages = 0;
  for (const entry of readdirSync(specsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const index = join(specsDir, entry.name, 'index.html');
    if (!existsSync(index)) continue;
    specPages += 1;
    const headings = (readFileSync(index, 'utf8').match(/<h2/g) ?? []).length;
    if (headings < 2) incompleteSpecs.push(index);
  }
  if (specPages < minSpecPages) {
    incompleteSpecs.push(
      `${specsDir} — only ${specPages} spec pages (expected >= ${minSpecPages}; did the vendor pull fail?)`,
    );
  }
  return { oiml, language, incompleteSpecs };
}

// CLI: only when executed directly (node scripts/check-gates.mjs dist).
const isEntry = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isEntry) {
  const distDir = process.argv[2];
  if (!distDir) {
    console.error('usage: node scripts/check-gates.mjs <dist-dir>');
    process.exit(2);
  }
  const { oiml, language, incompleteSpecs } = collectGateViolations(distDir);
  if (oiml.length) {
    console.error('ERROR: OIML references found in built site');
    for (const f of oiml) console.error(`  ${f}`);
  }
  if (language.length) {
    console.error('ERROR: forbidden language found in built site');
    for (const f of language) console.error(`  ${f}`);
  }
  if (incompleteSpecs.length) {
    console.error('ERROR: incomplete spec pages (missing content, or too few pages)');
    for (const f of incompleteSpecs) console.error(`  ${f}`);
  }
  const total = oiml.length + language.length + incompleteSpecs.length;
  if (total === 0) {
    console.log(`[check-gates] clean: ${distDir}`);
  }
  process.exit(total === 0 ? 0 : 1);
}
