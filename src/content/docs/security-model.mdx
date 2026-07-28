---
title: Security model
description: Confium's threat model, trust assumptions, and defense-in-depth layers. What the framework protects against and what it expects of operators.
audience: evaluator
order: 7
---

# Security model

Confium protects against single-party key compromise by requiring a
threshold of parties to participate in every signing operation. The
broader security model layers additional defenses against
split-view attacks, share compromise over time, and policy
violations.

## Trust model

A Confium deployment with threshold T-of-N tolerates compromise of
up to T−1 parties without losing the ability to produce valid
signatures. Equally important: compromise of up to T−1 parties
**does not** let the attacker produce valid signatures on their own.

The trust assumption is that an attacker cannot compromise T or more
parties simultaneously within a single signing session.

## Threats and defenses

### Single-key compromise

**Threat**: An attacker steals the signing key.
**Defense**: There is no single signing key. The secret is split
across N parties via Shamir secret sharing (or the FROST / CMP20 /
GG18 protocol equivalent). Compromising one party reveals one share,
which is mathematically useless on its own.

### Split-view attack

**Threat**: A transparency log operator presents different tree
heads to different verifiers, allowing selective insertion or
omission of entries per audience.
**Defense**: Three layers, see
[transparency logs](./transparency-logs.mdx):

1. **Consistency proofs** (RFC 6962 §2.1.2) — every new tree head
   extends the previous one.
2. **Witness gossip** — coordinators share tree heads periodically.
3. **OTS anchoring** — tree heads timestamped in Bitcoin.

### Share compromise over time

**Threat**: An attacker compromises one party today and another
next year, eventually collecting T shares.
**Defense**: **Proactive share refresh** (Herzberg refresh) via
`confium-tc-reshare`. Shares are periodically re-randomized so a
compromised share from period 1 is useless in period 2. To compromise
T shares, the attacker must do it within a single refresh window.

### Side-channel attacks

**Threat**: Timing or memory-disclosure side channels leak share
material.
**Defense**: Constant-time scalar arithmetic via the `p256` crate's
`CtOption` API. `SecureBytes` zeroizes on drop. Every crate carries
`#![forbid(unsafe_code)]`.

### Policy violations

**Threat**: A signer or operator attempts to use an algorithm
disallowed by jurisdictional policy (e.g. SHA-1 in a FIPS deployment).
**Defense**: `Confium::Policy` is process-global and enforced on
every signing / verification / hashing call. Violations raise
`Confium::PolicyViolationError`.

### Coordinator compromise

**Threat**: The coordinator is compromised and attempts to forge a
signature or replay a session.
**Defense**: The coordinator cannot produce a valid signature
without T party contributions. Sessions carry unique nonces;
replaying a session produces a detectable hash mismatch.

The coordinator is a trusted *availability* party, not a trusted
*secrecy* party. Compromising it can denial-of-service the
deployment but cannot produce unauthorized signatures.

## What Confium does NOT protect against

- **Out-of-band key generation**: If you generate keys outside
  Confium and import them improperly, that's your problem.
- **Operator error**: A misconfigured quorum policy that allows
  T=1 defeats the threshold property. Audit your deployment manifest.
- **Endpoint compromise**: If a signer's machine is fully
  compromised (kernel-level rootkit), share material can be exfiltrated
  at the moment of use. Use hardware enclaves (TPM, OpenPGP card) for
  the highest-assurance deployments.
- **Social engineering of quorum members**: T directors colluding
  can sign anything. This is by design.

## Reporting a vulnerability

See [/security/](/security/) for disclosure policy, PGP key, and SLA.

## See also

- [Transparency logs](./transparency-logs.mdx)
- [Architecture](./architecture.mdx)
- [Mode 3 — Sovereign PKI](./mode3-sovereign-pki.mdx)
