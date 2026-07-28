---
title: Code signing
description: Multi-stakeholder code signing. No single maintainer holds the full signing key. Confium orchestrates threshold signing across maintainers.
mode: 2
order: 2
---

# Code signing

Code signing today usually means a single maintainer (or a single
HSM) holds the signing key. A compromise of that maintainer, or of
the HSM's PIN, lets an attacker sign malware that looks legitimate.

Confium's threshold code signing replaces the single-key model with
a multi-maintainer scheme. T-of-N maintainers must participate to
produce a valid release signature.

## What you get

- Every release signature requires quorum (e.g. 2-of-3 lead
  maintainers).
- The signature is a standard PGP, CMS, or Sigstore signature —
  existing verifiers (package managers, OS vendors) accept it
  unchanged.
- The signing key never exists on any single maintainer's machine.
- Every signing event is anchored in the transparency log, so
  silent releases are detectable.

## Deployment shape

Each maintainer runs a Confium signer process. The release pipeline
calls the coordinator with the artifact hash; the coordinator
collects signatures from the participating maintainers; the final
signature is published alongside the release.

```
[ Release pipeline ]
        |
        | submit artifact hash
        v
[ Coordinator ] --------------------+
   |             |             |    |
   v             v             v    v
[Maintainer 1] [Maintainer 2] [Maintainer N]  -> [ Transparency log ]
        ^                                           |
        |                                           |
        +----- final signature published -----------+
```

## Sigstore-style integration

The deployment can mirror [Sigstore](https://sigstore.dev/)'s
architecture: short-lived signing keys, identity-based attestation,
transparency log inclusion. The difference: the signing key isn't
held by a central authority, it's held by a threshold of
maintainers.

## Post-quantum readiness

Code signing is one of the highest-value targets for PQ migration —
signatures embedded in long-lived releases will be verified for
decades. Confium's [composite signatures](/concepts/composite-signatures/)
let you add an ML-DSA-65 component alongside your existing
classical signature today. See [PQ migration](/use-cases/pq-migration/).

## When to choose this use case

- You sign releases for a package manager, OS vendor, or app store.
- A single maintainer holding the key is a recognized operational
  risk.
- You want defense-in-depth against future algorithm breaks.

## See also

- [Mode 2 — PKI Drop-in](/docs/mode2-pki-drop-in/)
- [PQ migration](/use-cases/pq-migration/)
- [Transparency logs](/concepts/transparency-logs/)
