/**
 * Repo-relative link rewriting for vendored software docs, as a pure
 * function: the mapping runs against an injected `io.exists`, so
 * tests drive it with an in-memory file map and the fetch script
 * passes the filesystem.
 *
 * Upstream docs are written for GitHub browsing; on the nested site
 * (/software/{id}/docs/…) the same relative links would resolve
 * against the rendered page's URL and 404. Five fallbacks, in order:
 *
 *  1. `/docs/…` prefix → this vendor's own docs tree (mirrors
 *     Astro's github-slugger: lowercase, non-word chars stripped per
 *     segment).
 *  2. Relative `.md`/`.mdx` inside the docs root → site URL.
 *  3. Extensionless siblings → `.mdx` / `.md` / `dir/index.*` forms.
 *  4. Escapes the vendor root → upstream GitHub blob URL.
 *  5. Target missing everywhere → the per-language vendors pull only
 *     the bindings subtree plus the docs root, so try the same
 *     position in the full tree vendored under `rust` before falling
 *     back to GitHub.
 */

import { relative, resolve as resolvePath, dirname } from 'node:path';

function siteSlug(relDocPath) {
  return relDocPath
    .replace(/\.(md|mdx)$/, '')
    .replace(/\/index$/, '')
    .split('/')
    .map((seg) => seg.toLowerCase().replace(/[^\w-]/g, ''))
    .join('/');
}

/**
 * @param {string} text - markdown/MDX source of one vendored doc
 * @param {{
 *   path: string,          // absolute path of the doc being rewritten
 *   docsRoot: string,      // absolute vendor docs root (…/<id>/docs)
 *   repoRoot: string,      // absolute vendor repo root (…/<id>)
 *   id: string,            // vendor id, e.g. "ruby"
 *   repoHttps: string,     // https clone URL (.git allowed)
 *   ref: string,           // upstream ref for blob links
 *   rustDocsRoot: string,  // absolute …/vendor/rust/docs (fallback #5)
 *   io: { exists: (abs: string) => boolean },
 * }} ctx
 * @returns {{ text: string, changed: boolean }}
 */
export function rewriteDocText(text, ctx) {
  const { path, docsRoot, repoRoot, id, repoHttps, ref, rustDocsRoot, io } = ctx;
  const blobBase = repoHttps.replace(/\.git$/, '');
  const re = /\]\(([^)#\s]+?)(#[^)\s]*)?\)/g;
  let changed = false;
  const out = text.replace(re, (m, target, anchor) => {
    // Fallback 1: upstream docs that assume the site's /docs/ IA —
    // map them into this vendor's own docs tree.
    if (target.startsWith('/docs/')) {
      const t = siteSlug(target.slice('/docs/'.length));
      const docsRootSlash = resolvePath(docsRoot) + '/';
      for (const c of [
        resolvePath(docsRoot, `${t}.mdx`),
        resolvePath(docsRoot, `${t}.md`),
        resolvePath(docsRoot, t, 'index.mdx'),
      ]) {
        if (io.exists(c)) {
          changed = true;
          return `](/software/${id}/docs/${t}${anchor ?? ''})`;
        }
      }
      return m;
    }
    // Skip URLs, images, mailto, and site-absolute links.
    if (/^(https?:|mailto:|\/|\.png|\.jpe?g|\.svg|\.gif)/i.test(target)) return m;
    let resolved = resolvePath(dirname(path), target);
    // Fallback 3: extensionless sibling links.
    if (!/\.(md|mdx)$/.test(resolved)) {
      for (const cand of [
        `${resolved}.mdx`,
        `${resolved}.md`,
        resolvePath(resolved, 'index.mdx'),
        resolvePath(resolved, 'index.md'),
      ]) {
        if (io.exists(cand)) {
          resolved = cand;
          break;
        }
      }
    }
    if (!/\.(md|mdx)$/.test(resolved)) {
      // Escapes the docs root (e.g. ../CONTRIBUTING.md): link to the
      // upstream repository. (The original walker did not flag this
      // rewrite as a change; preserved so output stays identical.)
      if (!resolved.startsWith(resolvePath(repoRoot) + '/')) return m;
      const inRepoRoot = relative(repoRoot, resolved);
      return `](${blobBase}/blob/${ref}/${inRepoRoot}${anchor ?? ''})`;
    }
    if (!resolved.startsWith(resolvePath(docsRoot) + '/')) {
      if (!resolved.startsWith(resolvePath(repoRoot) + '/')) return m;
      const inRepoRoot = relative(repoRoot, resolved);
      return `](${blobBase}/blob/${ref}/${inRepoRoot}${anchor ?? ''})`;
    }
    if (io.exists(resolved)) {
      const rel = siteSlug(relative(resolvePath(docsRoot), resolved));
      changed = true;
      return `](/software/${id}/docs/${rel}${anchor ?? ''})`;
    }
    // Fallback 5: try the same position in the full rust docs tree.
    const alt = resolvePath(rustDocsRoot, relative(resolvePath(docsRoot), resolved));
    if (
      io.exists(rustDocsRoot) &&
      alt.startsWith(resolvePath(rustDocsRoot) + '/') &&
      io.exists(alt)
    ) {
      const rel = siteSlug(relative(resolvePath(rustDocsRoot), alt));
      changed = true;
      return `](/software/rust/docs/${rel}${anchor ?? ''})`;
    }
    // Target exists nowhere in the vendored trees: send readers to
    // the upstream repository instead of a dead link.
    const inRepo = relative(repoRoot, resolved);
    changed = true;
    return `](${blobBase}/blob/${ref}/${inRepo}${anchor ?? ''})`;
  });
  return { text: out, changed };
}
