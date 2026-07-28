---
title: The TLS analogy
description: Confium is to threshold cryptography what TLS libraries are to transport security. A configurable framework organizations deploy with their own parameters.
audience: developer
order: 2
---

# The TLS analogy

> Confium is to threshold cryptography what TLS libraries are to
> transport security — a configurable framework organizations
> deploy with their own parameters.

This is the single best mental model for understanding what Confium
is (and isn't).

## What a TLS library does

A TLS library (OpenSSL, BoringSSL, GnuTLS, rustls) does **not**
provide transport. Your operating system's network stack does. The
TLS library provides the cryptographic protocol that runs *on top
of* transport, securing it.

Concretely, the TLS library:

1. Defines the protocol (handshake messages, record format,
   ciphersuite negotiation).
2. Implements the cryptographic primitives (key exchange,
   AEAD, signatures).
3. Exposes an API the application uses.
4. Stays neutral on policy — what ciphers to allow, what roots to
   trust, what ALPN protocols to negotiate, those are configuration
   decisions the deployer makes.

The TLS library doesn't tell you what cert to use or what hostname
to terminate. You bring your cert; you pick your cipher policy; you
decide what counts as a trusted CA.

## What Confium does

Confium does **not** provide threshold cryptography primitives.
Cryptographers do. Confium provides the framework that loads,
dispatches, coordinates, and audits those primitives.

Concretely, Confium:

1. Defines the plugin contract (interface versioning, FFI entry
   points, registry).
2. Ships the engine that loads plugins and routes calls.
3. Ships the coordinator that orchestrates multi-party sessions.
4. Ships adapters (PKCS#11, OpenSSL, JCE, TLS) that bridge to
   existing consumers.
5. Stays neutral on policy — what algorithms to allow, what quorum
   to require, what transparency log to anchor in, those are
   configuration decisions the deployer makes.

Confium doesn't tell you what threshold to use or what algorithms
to trust. You bring your quorum policy; you pick your algorithm
allow-list; you decide what counts as an acceptable signing
quorum.

## Why this matters

Two reasons.

### 1. No vendor lock-in

A TLS library that only worked with one cert authority, one cipher
suite, and one transport would be useless. The whole value of TLS
is its neutrality — any CA, any ciphersuite, any transport.

Confium's value is the same neutrality. Any threshold protocol
(FROST, CMP20, GG18), any algorithm (Ed25519, ECDSA-P256, ML-DSA,
ElGamal), any consumer (PKCS#11, OpenSSL, JCE, custom).

### 2. Pluggable, not opinionated

When a new PQ algorithm lands (ML-KEM, SLH-DSA), you don't wait for
the framework to adopt it. You write a plugin. When a new
transparency log format emerges, you write a backend. When a new
HSM hits the market, you wrap it via PKCS#11.

The framework stays small and stable. New capabilities land as
plugins.

## What Confium is NOT

This analogy also clarifies what Confium is **not**:

- **Not a crypto library**. Crypto libraries (ring, rust-crypto,
  OpenSSL's libcrypto) provide primitives. Confium loads those
  primitives via plugins.
- **Not an HSM**. HSMs store keys in tamper-resistant hardware.
  Confium orchestrates threshold protocols across whatever
  hardware you've chosen.
- **Not a CA**. CAs issue certificates. Confium's Mode 3 lets
  institutions build *their own* CA-like infrastructure with
  custom certificate formats — but Confium itself is not a CA.

## See also

- [Architecture](/docs/architecture/)
- [Threshold crypto 101](./threshold-crypto-101/)
- [Three modes](/docs/three-modes/)
