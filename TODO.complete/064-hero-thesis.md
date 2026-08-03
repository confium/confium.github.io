# 064 — Hero transformation: playground as thesis

**Category**: Design / Homepage
**Severity**: High
**Effort**: Medium
**Status**: pending
**Depends on**: 062, 063

## Problem

The current hero is a list — "Threshold-native trust infrastructure
for a post-quantum world" + a `HeroDecrypt` typewriter + a
`ThreeModeDiagram` flowchart. None of it states the thesis. The
thesis is the one thing only Confium can say:

> **No single party can sign alone.**

The interactive `QuorumPlayground` (currently buried at section 7) is
the only element on the page that *demonstrates* the thesis. A
visitor who drags the slider for 20 seconds understands the whole
product. No diagram or copy will do that faster.

## Plan

### Replace hero right column

Current right side: `ThreeModeDiagram` (decorative flowchart that
duplicates the Three Modes section below).

New right side: `QuorumPlayground`. Headline + subhead on the left,
the interactive slider on the right. Below the slider, a single
sentence: "Drag the slider. Watch what happens when fewer than T
parties try to sign."

### Cut the typewriter

`HeroDecrypt` is a character-substitution effect — the same one on
every dev-tools site (Vercel, Linear, Fly.io). It signals "generic
AI-generated". Cut it. The headline renders statically.

Per the global rule (never delete source files), `HeroDecrypt.vue`
stays in the source tree, just unused on the homepage. It may find
use elsewhere later.

### Three-circle motif as hero backdrop

Behind the headline + playground: a large `ModeVenn` in `feature`
variant — three overlapping translucent circles (blue, teal, gold).
This makes the brand identity visible at first glance and ties to
the Three Modes section below.

### Hero copy

```
[eyebrow]  THRESHOLD CRYPTOGRAPHY · POST-QUANTUM READY · OPEN SOURCE

[headline] No single party
           can sign alone.

[subhead]  Confium is the threshold-native trust infrastructure
           for settings where no party can be fully trusted alone.
           A quorum must sign. Every operation is anchored in a
           transparency log.

[CTAs]     [Drag the playground →]   [Read the architecture]
```

## Architecture

The hero is its own component: `src/components/astro/sections/Hero.astro`
(not a primitive — used once, but factored out so `index.astro` reads
as composition).

## Verification

- Lighthouse LCP still < 2.5s (playground is light DOM, no heavy
  assets)
- Keyboard: tab to the playground, slider works with arrow keys
- Mobile: hero stacks (headline + playground), playground remains
  usable at 375px
- Screen reader: hero announces headline + subhead + playground
  label + status
