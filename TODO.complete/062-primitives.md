# 062 — Primitives: Section, CtaLink, Timeline, ModeVenn, Card fixes

**Category**: UI primitives
**Severity**: High
**Effort**: Medium
**Status**: pending
**Depends on**: 061

## Problem

Every section in `index.astro` duplicates the same wrapper pattern
(`mono-label` eyebrow → bold h2 → optional lead → grid). Every CTA link
duplicates `text-accent hover:text-accent-deep` + `→`. The "How it
works" steps render as a 5-card grid when they're actually a sequence
with order-encoded meaning. The three-circle logo motif (the brand's
most distinctive asset) has no reusable form.

## Plan

### `Section.astro`

Section wrapper that takes `eyebrow?`, `title?`, `lead?`, `tone?`
(`'default' | 'blue' | 'teal' | 'gold'`), `class?`. Renders the standard
section chrome. Used everywhere section chrome is needed.

### `CtaLink.astro`

Single arrow-link primitive. `> Read the X →` pattern, repeated ~8
times across the homepage today. Takes `href`, `label`, optional
`tone`.

### `Timeline.astro`

Horizontal step sequence with connector lines. Takes `steps: { step,
title, body, tone }[]`. Renders the 5-stage "Generate → Distribute →
Sign → Refresh → Anchor" flow with order encoded visually (numbered
circles + connecting hairlines), not as a generic card grid.

### `ModeVenn.astro`

Reusable three-circle motif (blue + teal + gold overlapping). The
brand identity device. Variants: `compact` (logo-sized), `feature`
(hero-sized backdrop), `divider` (hairline section divider).

### Card fixes

Existing `Card.astro` has color-token bugs (`text-gold` → should be
`text-gold-ink`; `text-brand-700` → should be `text-accent`). Also
add a `tone: BrandTone` prop that maps to the three-mode identity
colors. Keep the existing prop API stable to avoid breaking callers.

## Architecture

All primitives go in `src/components/astro/primitives/`. The directory
name encodes their role: atomic, composable, no domain logic.

OCP: a new card variant = new file, not a new branch in `Card.astro`.
DRY: each repeated pattern extracted exactly once.
MECE: Section = layout, Card = atomic UI, Timeline = sequence,
ModeVenn = brand motif.

## Verification

- All existing pages still render identically (this phase is purely
  additive — primitives introduced but not yet swapped into callers)
- Type-check passes
