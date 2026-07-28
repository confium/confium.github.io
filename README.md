# confium.github.io

Public website for **Confium** — open-source threshold-native trust
infrastructure. Deployed to [www.confium.org](https://www.confium.org/).

## Stack

- **Astro 7** static site (no SSR)
- **Vue 3** client islands via `@astrojs/vue`
- **Tailwind 4** loaded as a Vite plugin (`@tailwindcss/vite`)
- **MDX** content collections (no AsciiDoc)
- **Pagefind** static search index
- **GitHub Pages** deploy via `actions/deploy-pages@v4`

## Local development

```sh
npm install
npm run dev      # serves at http://localhost:4321
```

The dev server expects a prior `npm run build` to have populated
`dist/pagefind/`. The `predev` script copies it into `public/pagefind/`
so the dev server can serve search results. First run:

```sh
npm run build && npm run dev
```

## Build

```sh
npm run fetch-sources   # sparse-checkout vendor docs + specs into vendor/
npm run build           # astro build → dist/  (postbuild: pagefind)
npm run preview         # serve the production build at :4321
```

## Architecture

- `src/content/` — hand-written content collections (blog, docs,
  concepts, use_cases, glossary, software, specs).
- `src/pages/` — Astro routes (one `.astro` file per URL).
- `src/layouts/` — `BaseLayout.astro` (root shell) + `DocsLayout.astro`
  (three-column docs layout).
- `src/components/astro/` — server-rendered Astro components.
- `src/components/vue/` — client islands (`SiteHeader`, `SiteSearch`,
  `ThemeToggle`).
- `src/components/brand/` — logo and wordmark.
- `src/styles/global.css` — Tailwind 4 with dual-token CSS variable
  system for theme switching.
- `src/lib/events.ts` — typed event bus for cross-island communication.
- `vendor/` — gitignored; populated at build time by
  `scripts/fetch-sources.mjs` from per-repo `docs/` trees.
- `scripts/fetch-sources.mjs` — reads `src/content/software/*.md` for
  `docs_repo` + `docs_ref` + `docs_subtree`, sparse-clones into
  `vendor/<id>/`.
- `scripts/prepare-dev-search.mjs` — copies `dist/pagefind/` into
  `public/pagefind/` for dev server search.

## Content constraints

CI gates enforce:

- **No "OIML" anywhere** in `dist/`.
- **No "TODO" / "coming soon" / "planned" / "milestone" / "roadmap"**
  language in rendered output.
- **CNML appears as one example among many**, never as the sole reference.
