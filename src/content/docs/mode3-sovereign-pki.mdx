---
title: Mode 3 — Sovereign PKI
description: Custom certificate formats for institutions where no single party can be trusted. Sovereign over formats, delegation, archival, quorum.
audience: developer
order: 5
---

# Mode 3 — Sovereign PKI

Sovereign PKI is institutional certificate infrastructure where no
single party can be trusted. Confium's Mode 3 gives institutions
sovereignty over four dimensions that conventional PKI locks down:

1. **Certificate formats** — define your own certificate structure,
   extensions, and encoding. CMS, X.509, custom ASN.1, or JSON.
2. **Delegation rules** — express scoped delegation ("this issuer
   can issue measuring-instrument certificates, but only for
   category C, and only until 2027-04-01").
3. **Archival cadence** — define how often tree heads are anchored
   in external media (Bitcoin via OTS, RFC 4998 ERS archival).
4. **Quorum composition** — express attribute-based threshold
   policies: "5-of-9 directors from 3 distinct regions".

## When to choose Mode 3

- You're an institution that issues certificates and no single
  stakeholder can hold the signing key alone.
- Conventional CA software doesn't model your delegation,
  jurisdiction, or quorum rules.
- You need a public, verifiable record of every certificate ever
  issued (transparency log).
- You operate across jurisdictions with different algorithm
  requirements.

## Reference deployments

Sovereign PKI is the right shape for:

- **Calibration registries** — BIPM-style metrology chains where
  measurements must be traceable to a sovereign reference.
- **Pharma regulator approvals** — multi-jurisdiction sign-off on
  clinical trial data and drug approvals.
- **Academic accreditation** — cross-institutional degree and
  credential verification without a single trusted authority.
- **Supply-chain provenance** — manufacturing step attestation
  anchored in a public transparency log.
- **Treaty organizations** — multi-state cooperative instruments
  requiring concurrent sovereign approval.
- **CNML** — certified measuring instruments list, a reference Mode 3
  deployment.

## Architecture

A Mode 3 deployment typically includes:

- **Custom certificate profile** — declared via the `confium-cert`
  crate's profile mechanism.
- **Delegation templates** — `confium-cert-delegation` for scoped
  delegation chains.
- **Attribute-based threshold predicates** — `confium-attributes`
  for quorum policies ("T-of-N from K distinct groups").
- **Transparency log** — `confium-transparency` (RFC 6962 Merkle
  tree) anchoring every certificate issuance.
- **OpenTimestamps anchoring** — `confium-ots` for Bitcoin-anchored
  tree heads (defense in depth).
- **Archival** — `confium-ers` (RFC 4998 Evidence Record Syntax) for
  long-term evidence retention.
- **Coordinator** — `confium-tc-coordinator` orchestrating signing
  sessions across the institutional signers.

## Defense in depth

Mode 3 deployments should layer:

1. **Consistency proofs** (RFC 6962 §2.1.2) — every new tree head
   extends the previous one.
2. **Witness gossip** — coordinators share tree heads periodically
   so split-view attacks are detectable.
3. **OTS anchoring** — tree heads are timestamped in Bitcoin for an
   irrefutable "what head existed at time T" record.

See [the transparency logs security analysis](https://github.com/confium/confium/tree/main/docs/security/transparency-logs.mdx)
for details.

## See also

- [Architecture](./architecture.mdx)
- [Transparency logs](./transparency-logs.mdx)
- [Security model](./security-model.mdx)
- [Use case: Sovereign PKI](/use-cases/sovereign-pki/)
