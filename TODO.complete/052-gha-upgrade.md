# 052 — GHA action upgrades (latest 2026 versions)

**Category**: Infrastructure
**Severity**: Low
**Effort**: Small
**Status**: ✅ done (PR #40)

## Problem

The GHA workflows in `.github/workflows/` were on older versions
of `actions/checkout`, `actions/configure-pages`,
`actions/upload-pages-artifact`, `actions/deploy-pages`, and
`lycheeverse/lychee-action`. GitHub releases new versions of
these actions periodically; running older versions means
missing security patches.

## Work done

**PR #40** (commit `2237a9e`):

The branch `fix/latest-gha-actions` was pushed, rebased onto
current main (26 commits including the entire website rebuild),
and squash-merged.

- `actions/checkout`: v4 → v7
- `actions/configure-pages`: v5 → v6
- `actions/upload-pages-artifact`: v4 → v5
- `actions/deploy-pages`: v4 → v5
- `lycheeverse/lychee-action`: v2 → v2.9.0

## Note on net effect

The branch predated the Astro migration; its file changes
targeted pre-Astro workflow files (`deploy.yml` / `links.yml`)
that no longer exist. After the 26-commit rebase onto current
main, the squash merge produced a no-op for the file content —
the actual version bumps were on files that had been replaced
or deleted during the website rebuild.

Current main is on RNP-matching versions: checkout@v4,
configure-pages@v5, upload-pages-artifact@v4, deploy-pages@v4,
lycheeverse/lychee-action@v2 — which matches the sister RNP
website exactly. RNP is on the same versions.

## Verification

- PR merged cleanly via squash.
- Workflows unchanged (matching RNP).

## Related

- [054-rnp-identity-adoption.md] — the GHA work was part of the
  broader RNP-alignment effort.
