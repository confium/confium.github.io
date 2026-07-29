# 069 — Build, screenshot, verify

**Category**: Verification
**Severity**: High (don't merge without this)
**Effort**: Small
**Status**: pending
**Depends on**: all

## Plan

### Build

```sh
npm run build
```

Must succeed with no errors. Pagefind postbuild must succeed.

### Type check

```sh
npx astro check
```

Must pass with no errors.

### Tests

```sh
npm test
```

All quorum specs pass.

### Visual verification

Screenshot the homepage at 1440×900 (desktop) and 375×900 (mobile).

Verify:
- Hero shows the playground (interactive), not a flowchart
- Three Modes section has three colored bands (blue/teal/gold)
- How It Works renders as a horizontal timeline, not a card grid
- No "Stats band", no "What Confium is NOT", no "Find your path",
  no duplicate final CTA
- Headlines render in Plex Mono
- Page ends quietly (no second gradient)
- Dark mode and light mode both render correctly
- Mobile layout stacks reasonably

### Lighthouse

```sh
npx lighthouse http://localhost:4321 --only-categories=performance,accessibility
```

Targets:
- Performance ≥ 90
- Accessibility ≥ 95

### Link check

```sh
npm run check:links
```

No new broken links.

## Done criteria

All the above pass. Commit + open PR. Don't merge — the user does
that.
