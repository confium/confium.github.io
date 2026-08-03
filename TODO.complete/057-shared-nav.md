# 057 — Extract shared nav config

**Category**: Architecture (DRY, OCP)
**Severity**: Medium
**Effort**: Small
**Status**: ✅ done (commit e51437a)

## Problem

Sidebar nav configuration is inlined per page in `src/pages/`:
- `src/pages/docs/index.astro` builds the docs sidebar from the
  `docs` collection.
- `src/pages/concepts/index.astro` builds the concepts sidebar.
- `src/pages/use-cases/index.astro` builds the use-cases sidebar.
- `src/pages/audiences/index.astro` builds the audience cards.

This is DRY violation: the same "build a sidebar from a collection
sorted by frontmatter order" pattern is repeated in each.

## Plan

- Create `src/lib/nav.ts` exporting:
  - `buildSidebar(collection: Collection, current?: string)` —
    takes a content collection and an optional current ID,
    returns a typed sidebar entry array with `current` flags set.
  - `buildAudienceCards()` — returns the audience grid data.
  - `buildBlogCards()` — returns the blog post data sorted by date.
- Update each index page to use the shared helpers.
- Add a `NavItem` type for full type safety.

## Acceptance criteria

- [ ] `src/lib/nav.ts` exists with typed helpers.
- [ ] All four index pages use the shared helpers.
- [ ] No code duplication between index pages.
- [ ] Types are MECE: every page that needs sidebar nav uses
  the same return type.

## Related

- [056-architecture-review.md] — parent review.
