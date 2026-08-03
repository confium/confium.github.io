# 060 — Performance audit

**Category**: Performance
**Severity**: Medium (Lighthouse score matters for SEO + UX)
**Effort**: Small
**Status**: ✅ done (commit e51437a)

## Problem

The site has been built up over many PRs but no formal
performance audit has been done. User emphasized "performance"
in the repeated quality requirements.

## Audit targets

- **Lighthouse score** on the homepage:
  - Performance ≥ 90
  - Accessibility ≥ 95
  - Best Practices = 100
  - SEO ≥ 95
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1

## Known concerns

- Multiple inline SVGs on the homepage (ThreeModeDiagram +
  floating logo watermark) — verified to be small but worth
  measuring.
- 86 pages of MDX content rendered through Astro's static
  pipeline — should be fast.
- Pagefind index size scales with content — currently 3877 words
  indexed, should be fine.

## Plan

- Run `npx lighthouse https://www.confium.org --output json
  --output-path lh.json` against the live site.
- Address any failing metrics.
- Document the baseline scores.

## Related

- [056-architecture-review.md] — parent review.
