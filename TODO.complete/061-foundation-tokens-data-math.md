# 061 — Foundation: design tokens, data model, quorum math

**Category**: Architecture / Design system
**Severity**: High (foundation for everything else)
**Effort**: Medium
**Status**: pending

## Problem

Three issues block the rest of the refactor:

1. **Color tokens are inconsistent.** `QuorumPlayground.vue` and `Card.astro`
   reference `text-brand-600`, `bg-brand-50/30`, `text-accent2`, `text-gold`
   etc. — but the design system in `global.css` only defines `--color-brand`
   (single shade), `--color-accent`, `--color-accent2`, and
   `--color-gold-ink`. Tailwind 4 silently no-ops unknown color utilities,
   so half the interactive styling is invisible.

2. **Homepage content is hardcoded inline** in `index.astro` (655 lines)
   and partially duplicated in `ModeSelector.vue` (which has its own copy
   of the three-modes data with different fields). DRY violation.

3. **Quorum math is embedded in `QuorumPlayground.vue`** as Vue refs and
   computeds — untestable, coupled to the Vue lifecycle.

## Plan

### Tokens — extend `global.css`

Add brand-teal-gold shade scales (50–900) as static tokens so existing
Tailwind classes (`bg-brand-600`, `text-teal-500`, etc.) resolve. Keep
the semantic `--accent` / `--accent2` / `--gold-ink` tokens for
theme-flipped usage. Static shades are for fixed-identity surfaces
(logo marks, range inputs); semantic tokens for typography that must
adapt to light/dark.

### Data model — `src/data/homepage.ts`

Typed content models for the homepage. Single source of truth for
modes, proof points, deployments, steps. Both `index.astro` and
`ModeSelector.vue` import from here.

```ts
export type ModeId = 'peer-tc' | 'pki-drop-in' | 'sovereign-pki';
export type BrandTone = 'blue' | 'teal' | 'gold';

export interface Mode {
  id: ModeId;
  tone: BrandTone;
  name: string;
  tagline: string;
  description: string;
  bullets: readonly string[];
  href: string;
  ctaLabel: string;
}

export const MODES: readonly Mode[];
export const PROOF_POINTS: readonly ProofPoint[];
export const DEPLOYMENTS: readonly Deployment[];
export const STEPS: readonly Step[];
```

### Quorum math — `src/lib/quorum.ts`

Pure functions for threshold quorum. No Vue, no DOM. Trivially testable.

```ts
export type QuorumStatus = 'idle' | 'insufficient' | 'ready';

export interface QuorumState {
  total: number;
  threshold: number;
  participating: number;
  status: QuorumStatus;
  canSign: boolean;
  parties: readonly { id: number; signed: boolean }[];
}

export function quorumState(
  total: number,
  threshold: number,
  participating: number,
): QuorumState;

export function describeStatus(state: QuorumState): string;
```

## Verification

- `npx astro check` passes
- `npx vitest run` (once added in 068) covers quorum edge cases
- Existing rendered HTML unchanged at this phase (refactor only)
