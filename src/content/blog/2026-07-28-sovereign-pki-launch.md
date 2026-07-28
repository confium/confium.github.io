---
title: "Sovereign PKI: institutional trust without a single point of failure"
description: "Mode 3 deep dive. Sovereign PKI gives institutions control over certificate formats, delegation, archival, and quorum composition — without trusting any single party."
date: 2026-07-28
author: Confium Project
tags: [mode-3, sovereign-pki, institutional]
category: deep-dive
order: 2
---

# Sovereign PKI: institutional trust without a single point of failure

Conventional PKI assumes a single trusted Certificate Authority.
For many institutional settings, that assumption doesn't hold.
Multi-stakeholder cooperatives, calibration chains, regulatory
bodies, accreditation networks, treaty organizations — none of
them have a natural single party that everyone else trusts.

**Sovereign PKI** is Confium's Mode 3 deployment shape:
institutional certificate infrastructure where no single party
can be trusted. The institution keeps sovereignty over four
dimensions that conventional PKI locks down:

1. Certificate formats
2. Delegation rules
3. Archival cadence
4. Quorum composition

## What sovereignty means

| Dimension | Conventional PKI | Sovereign PKI |
| --- | --- | --- |
| Certificate format | Fixed (X.509) | Custom profiles, custom extensions |
| Delegation | Fixed hierarchy | Scoped, time-bounded, attribute-based |
| Archival cadence | CA's discretion | Configurable per-deployment |
| Quorum | Single CA key | T-of-N with attribute constraints |
| Audit | Internal records | Public transparency log |

## Reference deployments

Sovereign PKI is the right shape for a wide range of
institutional settings:

- **Calibration registries** — BIPM-style metrology chains where
  measurements must be traceable to a sovereign reference.
- **Pharma regulator approvals** — multi-jurisdiction sign-off
  on clinical trial data and drug approvals.
- **Academic accreditation** — cross-institutional degree and
  credential verification without a single trusted authority.
- **Supply-chain provenance** — manufacturing step attestation
  anchored in a public transparency log.
- **Treaty organizations** — multi-state cooperative instruments
  requiring concurrent sovereign approval.
- **CNML** — certified measuring instruments list, a reference
  Mode 3 deployment.

CNML is one reference deployment among six. Sovereign PKI is a
general framework; CNML is one specific instance that fits the
shape.

## The architecture

A Mode 3 deployment typically includes:

- **Custom certificate profile** via `confium-cert`. The
  institution defines its certificate structure, extensions,
  and encoding (CMS, X.509, custom ASN.1, or JSON).
- **Delegation templates** via `confium-cert-delegation`.
  Scoped delegation: "this issuer can issue
  measuring-instrument certificates, but only for category C,
  and only until 2027-04-01".
- **Attribute-based threshold predicates** via
  `confium-attributes`. Express policies like "5-of-9 directors
  from 3 distinct regions".
- **Transparency log** via `confium-transparency`. Every
  issuance is anchored in an RFC 6962 Merkle tree.
- **OpenTimestamps anchoring** via `confium-ots`. Tree heads
  timestamped in the Bitcoin blockchain for defense in depth.
- **Archival** via `confium-ers`. RFC 4998 Evidence Record
  Syntax for long-term evidence retention.
- **Coordinator** via `confium-tc-coordinator`. Orchestrates
  signing sessions across the institutional signers.

## Defense in depth

Mode 3 deployments should layer three defenses against
split-view attacks:

1. **Consistency proofs** on every new tree head.
2. **Witness gossip** between coordinators (default: hourly).
3. **OTS anchoring** of tree heads in Bitcoin (default: daily).

Together, these defeat any adversary who doesn't simultaneously
control the log operator, all witnesses, *and* has the ability
to rewrite Bitcoin history. See
[the transparency logs concept](/concepts/transparency-logs/)
for the full analysis.

## Attribute-based threshold

Real institutions have richer requirements than "any 5 of 9
directors". They want "5 of 9 directors from 3 distinct regions"
or "3 of 5 labs from 2 distinct jurisdictions".

Confium ships an attribute-based threshold DSL:

```
5-of-9 directors
from 3 distinct regions
```

The coordinator evaluates this predicate at signing time. If
the participating signers don't satisfy both the count threshold
and the diversity constraint, the session waits for additional
signers or fails with `Confium::PolicyViolationError`.

Every predicate evaluation is recorded in the transparency log
— auditable, deterministic, and tamper-evident.

## When to choose Mode 3

- You operate an institutional CA where no single stakeholder
  can be trusted.
- You need custom certificate formats, delegation rules, or
  archival policies.
- You're deploying across multiple jurisdictions with different
  algorithm requirements.
- You need a public, auditable record of every certificate ever
  issued.

## Read more

- [Mode 3 docs](/docs/mode3-sovereign-pki/)
- [Transparency logs concept](/concepts/transparency-logs/)
- [Attribute-based threshold concept](/concepts/attribute-based-threshold/)
- [Security model](/docs/security-model/)
- [Use case: Sovereign PKI](/use-cases/sovereign-pki/)
