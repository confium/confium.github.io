---
title: Transparency logs
description: RFC 6962 Merkle transparency logs. Inclusion proofs, consistency proofs, split-view attacks, witness gossip, OTS anchoring.
audience: developer
order: 4
---

# Transparency logs

A transparency log is an append-only public record of every
operation a system performs. The point: anyone can audit the log
to see what happened, and the log operator cannot undetectably
rewrite history.

Confium's transparency log implements RFC 6962 — the same standard
Certificate Transparency is built on.

## Why transparency matters

A certificate proves "this was signed by the issuer". It doesn't
prove:

- "This is the only certificate the issuer ever signed for this
  subject."
- "This is the same certificate every other verifier sees."

Without transparency, a compromised CA can issue certificates
silently. Verisign did this in 2015; Symantec did it repeatedly
between 2015 and 2018. The affected parties had no way to know.

With transparency, every issuance lands in a public log. Anyone
can monitor the log and see what's being issued. A verifier can
demand an inclusion proof that the certificate it's verifying is
in the log.

## Merkle trees

The log is a Merkle tree built from SHA-256 hashes:

- Each leaf is `SHA-256(0x01 || entry_hash)`.
- Each internal node is `SHA-256(0x02 || left_child || right_child)`.
- The root hash commits to the entire set of leaves.

Domain separation (`0x01` for leaves, `0x02` for internal nodes)
prevents leaf values from being interpreted as internal nodes and
vice versa.

Changing any leaf, or reordering leaves, changes the root hash.
The root is the cryptographic commitment to the log's full state.

## Inclusion proofs

An inclusion proof demonstrates that a specific entry is in the log
without revealing anything else. The proof is a sequence of
`(sibling_hash, side)` pairs:

```
To prove entry[3] is in the log:
  start with hash(entry[3])
  combine with sibling at level 0 (right side): SHA-256(0x02 || current || sibling0)
  combine with sibling at level 1 (left side):  SHA-256(0x02 || sibling1 || current)
  ...
  final hash should equal the published root
```

The verifier doesn't need the full log — just the proof (~log N
hashes) and the published root.

## Consistency proofs

A consistency proof shows that the tree at size N+1 *extends* the
tree at size N — the first N entries are identical. This is what
makes split-view attacks detectable.

If a log operator presents tree head N to verifier A and a
different tree head N to verifier B, at least one of them will
fail a consistency check against the true history.

## The split-view attack

Without consistency proofs, a log operator can present two
different tree heads to different verifiers, and nobody can
detect it:

1. Verifier A receives tree head N.
2. Verifier B receives a different tree head N' (with a different root).
3. Both verifiers can verify their own inclusion proofs against
   their own heads. Neither knows the other's head exists.
4. The log operator can insert or omit entries selectively per
   audience.

## Defense in depth

Consistency proofs alone are necessary but not sufficient —
verifiers must also communicate (gossip) so they know about each
other's heads. Three layers:

1. **Consistency proofs** — every new tree head extends the
   previous one. Implemented in `confium-transparency`.
2. **Witness gossip** — coordinators share tree heads with each
   other periodically. If two coordinators have different heads
   for the same tree size, the witnesses detect the inconsistency.
3. **OTS anchoring** — tree heads are timestamped in the Bitcoin
   blockchain via OpenTimestamps, providing an irrefutable "what
   head existed at time T" record.

The combination defeats any adversary who doesn't simultaneously
control the log operator, all witnesses, *and* has the ability to
rewrite Bitcoin history.

## See also

- [Transparency logs docs](/docs/transparency-logs/)
- [Security model](/docs/security-model/)
- [Glossary: Merkle tree](/glossary/#merkle-tree)
- [Glossary: RFC 6962](/glossary/#rfc-6962)
