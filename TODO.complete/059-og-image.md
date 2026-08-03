# 059 — Open Graph image generation

**Category**: UX, Sharing
**Severity**: Medium
**Effort**: Small
**Status**: ✅ done (commit e51437a)

## Problem

When the site is shared on Twitter, LinkedIn, Slack, etc., the
preview shows only the logo (no OG image). The current meta tags
reference `/assets/symbol.svg` which is the small icon — most
social platforms want a 1200×630 (or similar) image.

## Plan

- Create `public/assets/og-image.png` (1200×630) showing the
  Confium three-circles mark + tagline + "Threshold-native
  trust infrastructure" text.
- Update `src/layouts/BaseLayout.astro` og:image meta to point
  at the new image.
- Add an `og:image:alt` for accessibility.

## Acceptance criteria

- [ ] `public/assets/og-image.png` exists (1200×630).
- [ ] Twitter / LinkedIn preview shows the OG image when sharing
  `https://www.confium.org/`.
- [ ] `<meta property="og:image">` references the new image.
- [ ] Visual content: three-circles mark + tagline + "Threshold
  cryptography · Post-quantum ready · Open source".

## Related

- [054-rnp-identity-adoption.md] — broader identity work.
