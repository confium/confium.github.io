# 053 — Logo redesign to RNP's three-circles visual language

**Category**: Design
**Severity**: Critical (user complaint: "adopt full RNP identity (including the logo)")
**Effort**: Small
**Status**: ✅ done (PR #39)

## Problem

The user repeatedly asked for "full RNP identity (including the
logo)" but the previous SymbolLogo was a **three-face cube** in
brand colors — NOT RNP's actual mark. RNP uses three overlapping
circles in a Venn-diagram-like composition. The cube was
divergent from the user's request and made the site look
inconsistent with the RNP reference design.

## Work done

**PR #39** (commit `2083877`):

1. **`SymbolLogo.astro`** — replaced with three overlapping
   circles using RNP's exact path geometry adapted for Confium's
   brand palette. The intersection at the center represents the
   shared engine that all three deployment modes draw on.

2. **`Wordmark.astro`** — simplified from custom SVG letterforms
   to clean HTML `<span>confium</span>` in IBM Plex Sans Bold.
   Matches RNP's wordmark approach (simple, bold, no decorative
   elements). Eliminated ~40 lines of hand-drawn SVG paths.

3. **`SiteHeader.vue`** — inline SVG updated to three-circles;
   logo container resized from `w-7 h-7` (square) to `w-8 h-5`
   (matching the wider aspect ratio of the new mark). Wordmark
   text is now lowercase "confium".

4. **`SiteFooter.astro`** — same three-circles inline SVG,
   `w-10 h-6` sizing, lowercase wordmark.

5. **`public/favicon.svg`** — updated to the three-circles design.

6. **`src/pages/index.astro`** — hero floating watermark and
   in-hero logo containers resized from square (`w-32 h-32` /
   `w-10 h-10`) to match the wider three-circles aspect
   (`w-48 h-28` / `w-12 h-7`).

## Verification

- Live site: `viewBox="0 0 275.37 167.48"` (RNP's aspect)
  appears 2x in the homepage.
- Three-circles path (`M95.79,83.73...`) renders correctly.
- npm run build: 86 pages, Pagefind OK.

## Related

- [051-homepage-polish.md] — sibling design improvement.
- [054-rnp-identity-adoption.md] — broader identity work.
