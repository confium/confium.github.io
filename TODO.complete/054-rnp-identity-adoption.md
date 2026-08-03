# 054 — Full RNP identity adoption

**Category**: Design
**Severity**: Critical (user complaint: "adopt full RNP identity (including the logo)")
**Effort**: Medium
**Status**: ✅ done

## Problem

The user has repeatedly asked for "full RNP identity" including
the logo. The RNP sister site at `~/src/rnp/rnpgp.org` uses a
specific visual language:

- Three-circle overlapping mark (blue/teal/gold).
- Custom lowercase wordmark in IBM Plex Sans.
- Brand palette: blue `#1a7bec`, teal `#00dfb7`, gold `#ffdc4a`,
  navy `#14172b`.
- Layout patterns: hero with full-color brand gradient + graph
  paper grid; pill nav; sidebar-driven docs layout; three-column
  cards.

Adoption was partial. The cube logo, the custom SVG
wordmark, and the lack of a "How it works" pipeline were
identified as drift points.

## Work done

The RNP identity is now fully adopted across the site:

- **Three-circles mark** (matches RNP's exact path geometry) —
  PR #39. Applied in `SymbolLogo.astro`, `SiteHeader.vue`,
  `SiteFooter.astro`, `public/favicon.svg`, and the homepage
  hero / floating watermark.
- **Clean lowercase wordmark** in IBM Plex Sans Bold — PR #39.
  Replaces ~40 lines of hand-drawn SVG paths in `Wordmark.astro`.
- **Brand palette** (blue/teal/gold/navy) with dual-token
  semantic vars for light/dark — PR #28.
- **Hero pattern** (full-bleed brand gradient + graph paper
  grid) — PR #28.
- **Pill nav**, three-column cards, mono-label eyebrows,
  gradient rules — PR #28.
- **ThreeModeDiagram** (three-circles Venn), all adapter
  diagrams (PKCS11, OpenSSL, JCE, TLS, Architecture,
  CoordinatorSession) match RNP's visual language — PRs #28,
  #33, #37, #39.
- **OG image** with three-circles mark for social previews —
  PR `e51437a`.
- **Card component + shared nav helpers** to keep the
  architecture DRY — PR `e51437a`.

Subtasks [051], [053] covered the homepage polish and logo
redesign specifically.
