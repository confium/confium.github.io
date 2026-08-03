# 058 — `<Card>` component to dedupe card markup

**Category**: Architecture (DRY, OCP)
**Severity**: Medium
**Effort**: Small
**Status**: ✅ done (commit e51437a)

## Problem

The `card card-hover h-full p-6` (or similar) class string is
repeated on every card across the homepage and doc pages. The
hover-state styling (translateY(-3px) + border color shift) is
defined once in `src/styles/global.css` but the markup is
duplicated everywhere.

## Plan

- Create `src/components/astro/Card.astro` with a typed Props
  interface (title, href?, body?, accent?).
- The component renders the card markup with the shared classes.
- Migrate all card usage to the new component.
- Keep the existing `.card` / `.card-hover` CSS as the styling
  contract; the component just adds the class.

## Acceptance criteria

- [ ] `src/components/astro/Card.astro` exists with typed props.
- [ ] All homepage cards (8 sections × 2-6 cards each) use the
  new component.
- [ ] All card markup across the site uses the new component.
- [ ] No `card card-hover` class string duplicated in `.astro`
  files (except inside the new Card component itself).
- [ ] Visual regression: site looks identical to before.

## Related

- [056-architecture-review.md] — parent review.
- [057-shared-nav.md] — sibling dedup work.
