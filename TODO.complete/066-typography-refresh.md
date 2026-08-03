# 066 — Typography refresh: Plex Mono display + rhythm variation

**Category**: Design / Typography
**Severity**: Medium
**Effort**: Small
**Status**: pending
**Depends on**: 065

## Problem

Every heading on the page is `font-sans text-3xl font-bold tracking-tight`.
The eyebrow is `mono-label` on every section. The result: nothing stands
out because everything is the same. Typography is neutral — a delivery
vehicle, not a personality.

## Plan

### Display headlines in Plex Mono

Headlines (`h1`, `h2`) switch to **IBM Plex Mono at display weight**.
This gives the whole page a "technical specification" voice — exactly
the register threshold cryptography deserves. The body stays in Plex
Sans for readability.

```css
.display-mono {
  font-family: var(--font-mono);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.15;
}
```

Apply to `h1` and `h2` site-wide (or scoped to homepage for now —
decide based on visual impact).

### Vary section rhythm

Not every section opens with `mono-label → h2 → grid`. Pick
deliberately:

- **Hero**: opens with interactive (no eyebrow)
- **Three Modes**: opens with the three-circle motif (ModeVenn) —
  the visual *is* the eyebrow
- **How It Works**: opens with the Timeline — the visual *is* the
  section, no eyebrow needed
- **Differences**: opens with a strong pull quote (one of the six
  properties elevated to a hero quote), then the grid below
- **Install**: opens with a code snippet in monospace, then the
  tabs. The code is the eyebrow.
- **Sign-off**: no eyebrow, no heading — just a single line

### Type scale

Document the scale in `global.css`:

```
--text-display: clamp(2.5rem, 5vw, 4rem)   // h1
--text-h2:      clamp(1.75rem, 3vw, 2.25rem)  // h2
--text-h3:      1.25rem                        // card titles
--text-body:    1.03rem                        // body
--text-sm:      0.875rem                       // secondary
--text-xs:      0.75rem                        // mono-label
```

Use `clamp()` for fluid type at the display level only.

## Verification

- Homepage reads as a technical document, not a SaaS landing page
- Each section opens differently — no two adjacent sections share
  the same opening pattern
- Mobile type scale doesn't break (test at 375px)
