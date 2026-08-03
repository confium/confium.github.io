# 065 — Index.astro restructure: cuts + composition + color bands

**Category**: Design / Homepage structure
**Severity**: High
**Effort**: Medium
**Status**: pending
**Depends on**: 062, 064

## Problem

`index.astro` is 655 lines, 12 sections in the same rhythm (eyebrow
→ h2 → grid of cards), all in the same dark navy. The hero is the
only bright moment. Three sections duplicate content (hero diagram
vs. three-modes section; "What Confium is NOT" vs. architecture;
"Find your path" vs. /audiences/).

## Cuts

| Section | Why cut |
|---|---|
| Stats band (43 crates / 725+ tests / 3 modes / 10+ protocols) | Vanity metrics. Replace with one inline proof ("0 parties can sign alone" — already implied by the hero). |
| "What Confium is NOT" (3 cards) | Defensive positioning reads as anxiety. If "not a crypto library / not an HSM / not just OpenPGP" matters, it belongs on the architecture page. |
| "Find your path" (6 audience cards) | Directory listing. Belongs on `/audiences/`, not the homepage. The link to `/audiences/` stays in the nav and footer. |
| Final CTA (gradient hero repeated) | A confident product doesn't shout twice. Replaced by a quiet sign-off (TODO 067). |

## Keep (restructured)

1. **Hero** (interactive thesis) — TODO 064
2. **Three Modes** — the actual product structure, color-coded
3. **How It Works** — Timeline primitive, not grid
4. **What Makes Confium Different** — six properties, kept
5. **Install** — kept
6. **Reference Deployments** — kept (gold band)
7. **Latest from the blog** — kept but slimmed (one line + 3 cards)
8. **Sign-off** — new (TODO 067)

## Three-color mode bands

Each of the three modes carries its identity color:
- Mode 1 (Peer-to-Peer): blue tint band
- Mode 2 (PKI Drop-in): teal tint band
- Mode 3 (Sovereign PKI): gold tint band

In the "Three Modes" section, instead of three identical cards on a
neutral background, render three full-width subsections each with
their tint. The mode name in the matching color. Bullets in the
matching color. This makes the three-circle identity structural.

## Composition

`index.astro` becomes ~80 lines of composition:

```astro
<BaseLayout title="Confium" headerOverlay>
  <Hero />
  <ThreeModes />
  <HowItWorks />
  <Differences />
  <Install />
  <Deployments />
  <BlogTeaser />
  <SignOff />
</BaseLayout>
```

Each section is a component in `src/components/astro/sections/`. They
compose primitives (`Section`, `Card`, `CtaLink`, `Timeline`,
`ModeVenn`) with data (`src/data/homepage.ts`).

## Verification

- Total homepage line count drops significantly (655 → ~80 in
  `index.astro`, section components each ~30–60 lines)
- Visual rhythm varies (hero interactive → mode bands → timeline →
  cards → install → cards → quiet sign-off)
- Lighthouse score maintained or improved
