# 067 — Sign-off section: quiet ending

**Category**: Design / Homepage
**Severity**: Medium
**Effort**: Small
**Status**: pending
**Depends on**: 062

## Problem

The current homepage ends with a duplicate of the hero gradient + a
"Start building with Confium today" CTA. This is the second shout —
the hero already said it. Confident products end quietly.

## Plan

Replace the final CTA with a single-line sign-off:

```
[3-column compact sponsor row, no big cards]

BSD-2-Clause · Sponsored by NLnet + Mozilla MOSS · Built in the open
[Get started]  [Read the docs]
```

No gradient. No big heading. No "Start building today" energy. Just
the facts and two next-step links.

### Component

`src/components/astro/sections/SignOff.astro`. Compact, ~30 lines.

### Merge with Sponsorship

Currently the page has both "Final CTA" (gradient, duplicate hero)
and "Sponsorship" (3 sponsor cards). Merge into one quiet ending
that combines:
- 3 sponsor logos in a compact row (current cards resized down)
- One-line license + funding attribution
- Two next-step links

## Verification

- Page ends on a confident, quiet note
- Sponsorship remains visible (not buried)
- Two clear next steps for the visitor
