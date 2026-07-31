---
title: "Threshold code signing without sharing the key"
description: How to add multi-stakeholder threshold signing to your release pipeline — no HSM, no single point of failure, fully open-source.
date: 2026-07-31
author: Confium Project
---

# Threshold code signing without sharing the key

Every release engineering team hits the same wall: a single signing
key, somewhere, has to sign every artifact. Whoever holds that key
holds the keys to the kingdom. Lose it, and every release is
indefinitely delayed. Leak it, and attackers can ship malware under
your signature.

The conventional answer is an HSM. HSMs are great, but they're
expensive, hard to operate, and put one physical box at the center
of your release pipeline. They solve the "don't lose the key"
problem; they don't solve the "no single party should be able to
sign alone" problem.

**Threshold code signing** solves both. The signing key is split
across N parties — say, the release engineer, the security officer,
and the CI bot — and a quorum of T-of-N must cooperate to produce a
signature. No single party can sign alone. No single compromise
breaks the pipeline.

## What it looks like in practice

We've been building [Confium](https://www.confium.org/) — an
open-source framework for multi-stakeholder threshold cryptography —
and one of the first things we shipped was a Ruby binding that makes
threshold code signing a 5-line snippet:

```ruby
require "confium"

# Generate a 2-of-3 threshold signing key (one-shot DKG).
kg = Confium::TC::Cmp20.keygen(2, 3)
# kg["shares"] holds 3 share blobs; distribute to 3 parties.
# kg["public_key"] is the joint P-256 public key — embed in your X.509 cert.

# Two of the three signers sign the release artifact:
sig = Confium::TC::Cmp20.sign([share_a, share_b], 2, release_tarball)

# The signature is a standard 64-byte ECDSA-P256 (r || s). It verifies
# under any RFC 3279 verifier — OpenSSL, BouncyCastle, the stdlib of
# every major language.
```

On the install side, nobody knows the signing was threshold. The
signature is a regular P-256 signature. OpenSSL verifies it against
the publisher's public key (now a *joint* public key) the same way
it always has.

## Why this matters

Three concrete scenarios where threshold signing beats single-key
signing:

### 1. Insider threat

A rogue release engineer can't ship a backdoored build alone. They
need cooperation from at least one other signer. The transparency
log records every signing ceremony, so post-hoc audits can verify
who signed what.

### 2. Key compromise

If the release engineer's laptop is compromised, the attacker gets
one share — useless without a second. The pipeline doesn't even
need to pause; the remaining signers can rotate the compromised
share via proactive refresh.

### 3. Compliance

SOC 2 and similar frameworks require "separation of duties". Single
key signing can't satisfy this; threshold signing satisfies it by
construction — the protocol itself enforces the quorum.

## What about performance?

For high-volume signers (CI releasing hundreds of packages per
hour), threshold signing adds ~10ms per signature on top of native
ECDSA-P256. The bottleneck is the MtA (multiplicative-to-additive)
sub-protocol; Confium's in-process driver simplifies this for
honest coalitions and is plenty fast for any realistic release
cadence.

For batch signing — say, signing 1000 container images after a
release — Confium ships a `sign_batch` API that amortizes binding
overhead:

```rust
let sigs = confium_tc_cmp20::inprocess::sign_batch(
    &shares, threshold, &[msg1, msg2, msg3, /* ... */]
)?;
```

## Try it

```sh
gem install confium
ruby -e 'require "confium"; kg = Confium::TC::Cmp20.keygen(2, 3); p kg["public_key"].bytesize'
```

Or use the CLI:

```sh
cargo install confium-cli
confium tc keygen --scheme cmp20 --threshold 2 --party-count 3 --out shares.json
echo "release-1.0.0" | confium tc sign --scheme cmp20 --shares shares.json --threshold 2 > sig.bin
```

The full code-signing example walks through end-to-end signing +
OpenSSL verification:
[`examples/code_signing.rb`](https://github.com/confium/confium-ruby/blob/main/examples/code_signing.rb).

## What's next

This post covered the *what* and *why*. Future posts will cover:

- **Production deployment**: how to distribute shares across data
  centers, run the coordinator, and survive share loss.
- **PQ migration**: layering ML-DSA-65 alongside ECDSA-P256 so
  today's threshold signatures remain valid after quantum
  computers arrive.
- **Transparency log anchoring**: every signature gets a Merkle
  inclusion proof, so anyone can verify the complete set of
  signatures ever produced.

Stay tuned.
