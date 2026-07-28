---
title: Mode 1 — Peer-to-Peer TC
description: Nodes do threshold cryptography directly. Hours to value. The simplest deployment shape.
audience: developer
order: 3
---

# Mode 1 — Peer-to-Peer TC

In Mode 1, participants exchange threshold protocol messages
directly. There's no intermediary CA, no PKCS#11 adapter, no
existing infrastructure to integrate with — just nodes running
Confium and a transport between them.

## When to choose Mode 1

- You're building a new distributed system from scratch.
- Both sides of every signing session are online (or can complete
  sessions across hours via async messaging).
- You want minimal moving parts — no adapter, no translation layer.
- You don't need to interoperate with an existing PKI consumer.

Typical Mode 1 deployments: MPC, distributed custody, BFT consensus,
threshold-key backup, multi-stakeholder signing of any kind where the
participants already have a channel.

## What you need

- A `libconfium` build on each participating node.
- The threshold protocol crate matching your algorithm choice (FROST,
  CMP20, GG18, threshold ElGamal).
- A transport — pick from `confium-net-tcp`, `confium-net-quic`,
  `confium-net-ws`, or supply your own via the `confium-net`
  abstraction.
- A deployment manifest (TOML) describing signers, quorum policy,
  and algorithm allow-list.

## Signing flow

1. **Setup**: Each party generates a key share. The shares
   collectively form the threshold key but no single share reveals
   the secret.
2. **Session start**: One party initiates a signing session with the
   coordinator, specifying the message, threshold, and participant
   list.
3. **Round 1, 2, ...**: Each party commits nonces and partial
   signatures. The coordinator aggregates inputs.
4. **Finalization**: Once T parties have participated, the coordinator
   produces the final signature. The signature is indistinguishable
   from one produced by a single-key signer.
5. **Audit**: The signing event is recorded in the transparency log.

## Async vs synchronous sessions

Mode 1 sessions can be:

- **Synchronous** — all parties online, session completes in seconds.
- **Asynchronous** — parties join and submit over hours or days. The
  coordinator holds state until threshold is reached.

The async mode is what enables globally distributed signers. A
director in Tokyo can submit their share during their workday; a
director in New York submits theirs hours later; the coordinator
combines them when quorum is reached.

## See also

- [Architecture](./architecture.mdx)
- [Components](./components.mdx)
- [Use case: Distributed custody](/use-cases/distributed-custody/)
