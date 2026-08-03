# 055 — VitePress content audit

**Category**: Documentation
**Severity**: Low
**Effort**: Trivial
**Status**: ✅ done (audited; none found)

## Problem

The user has repeatedly asked to "remove all VitePress content".
The user might have conflated the per-repo `docs/` pattern
(which is plain MDX, not VitePress) with VitePress itself.

## Audit

Searched for:
- `vitepress` / `VitePress` references in all source files.
- `.vitepress/` config directories.
- `vitepress build` invocations in `package.json` / `Cargo.toml`.

**Result: none found.** The site uses:
- Astro 7 + Vue 3 + Tailwind 4 (no VitePress).
- MDX content collections (Astro's `@astrojs/mdx` integration was
  removed in TODO #050 because it didn't interoperate with
  Astro 7's rolldown-vite; plain Markdown is used now).
- The per-repo `docs/` trees in confium-rs and confium-ruby are
  plain MDX files (not VitePress) consumed by the central Astro
  site via `scripts/fetch-sources.mjs`.

The "VitePress-style" perception likely comes from the
sidebar-driven docs layout (left sidebar with section links +
center prose + right TOC) which is common to both VitePress and
Astro docs layouts. The layout itself is not VitePress.

## Verification

- `grep -rn vitepress /Users/mulgogi/src/confium/` → no matches.
- `ls .vitepress/` in any repo → no such directory.
- All content is plain `.md` / `.mdx` consumed by Astro
  content collections.

## Related

- [054-rnp-identity-adoption.md]
