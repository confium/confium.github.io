---
title: Components
description: The 43-crate Confium Rust workspace, grouped by category. Engine, threshold crypto, PKI, storage, network, Mode 2 adapters, transparency.
audience: developer
order: 6
---

# Components

The Confium Rust workspace contains 43 crates organized by concern.
This page maps every crate to its category and role. For full API
details, see the [RustDoc](https://docs.confium.org/).

## Categories

| Category | Role |
| --- | --- |
| **Engine / Core** | The host library, plugin loader, public API, CLI. |
| **Threshold cryptography** | Threshold signing protocols (FROST, CMP20, GG18). |
| **Threshold encryption** | Threshold encryption schemes (ElGamal, ECIES, ML-KEM, FHE). |
| **PKI / Certificates** | X.509, CMS, XMLDSig, composite signatures, attribute predicates. |
| **Storage / Hardware** | Compartmentalized backends: PKCS#11, TPM, cloud KMS, OpenPGP card. |
| **Mode 2 / PKI replacement** | Drop-in adapters for PKCS#11, OpenSSL, JCE, TLS. |
| **Network / Transport** | TCP, QUIC, WebSocket transports and sandbox runtimes. |
| **Thunderbird-inspired** | Threshold key escrow and revocation service patterns. |
| **Identity / Config** | Actor identity and deployment manifest types. |
| **Transparency / Archival** | Merkle transparency logs, OTS, ERS archival. |
| **Research frontier** | Threshold ring signatures and other explorations. |

## Engine / Core

| Crate | Role |
| --- | --- |
| `confium-core` | Engine: plugin loader, registry, FFI entry points (10 interfaces shipped). |
| `confium-api` | Public Rust API + plugin SDK shared types. |
| `confium-macros` | Proc-macros for plugin authors. |
| `confium-cli` | `confium` end-user command. |
| `confium-daemon` | JSON-RPC daemon over Unix socket / TCP. |
| `confium-mock-plugin` | Reference mock plugin for testing. |
| `confium-publish` | Author tool for the plugin registry. |
| `confium-test-harness` | NIST MPTS evaluation bench. |
| `confium-examples` | Standalone example binaries. |
| `confium-patterns` | Cross-cutting architectural patterns and helpers. |
| `confium-registry` | Static plugin / publisher / trust-root catalog. |

## Threshold cryptography

| Crate | Role |
| --- | --- |
| `confium-tc` | TC session primitives (interface). |
| `confium-tc-frost-ed25519` | Real FROST-ed25519 (3-round signing). |
| `confium-tc-frost-p256` | Real P-256 Shamir + ECDSA. |
| `confium-tc-cmp20` | Real CMP20 threshold ECDSA. |
| `confium-tc-gg18` | Real GG18 threshold ECDSA. |
| `confium-tc-bls` | Threshold BLS skeleton. |
| `confium-tc-frost-ml-dsa-65` | Threshold ML-DSA-65 (research). |
| `confium-tc-coordinator` | Async session coordinator service. |
| `confium-tc-reshare` | Share re-sharing + Herzberg refresh. |
| `confium-tc-kem` | Threshold KEM session interface. |

## Threshold encryption

| Crate | Role |
| --- | --- |
| `confium-tc-elgamal-p256` | Real threshold ElGamal-P256. |
| `confium-tc-ecies-p256` | Threshold ECIES skeleton. |
| `confium-tc-ml-kem` | Threshold ML-KEM (FIPS 203) research. |
| `confium-tc-fhe-bfv` | Threshold BFV FHE research. |

## PKI / Certificates

| Crate | Role |
| --- | --- |
| `confium-cert` | X.509 cert + CSR types, path validation. |
| `confium-cert-delegation` | Scoped delegation templates. |
| `confium-cms` | CMS / PKCS#7 SignedData envelope. |
| `confium-xmldsig` | XMLDSig + Exclusive C14N. |
| `confium-composite` | Composite multi-alg signatures for PQC migration. |
| `confium-attributes` | Attribute-based threshold predicates + DSL. |

## Storage / Hardware

| Crate | Role |
| --- | --- |
| `confium-store` | Store pillar with compartmentalized backends. |
| `confium-store-pkcs11` | PKCS#11 wrapping backend. |
| `confium-store-tpm` | TPM 2.0 sealed storage. |
| `confium-store-cloud` | AWS / GCP / Azure KMS REST. |
| `confium-store-openpgp-card` | OpenPGP card backend (YubiKey, Nitrokey). |

## Mode 2 / PKI replacement

| Crate | Role |
| --- | --- |
| `confium-pkcs11-server` | PKCS#11 v3.0 dispatch to threshold protocol. |
| `confium-openssl-provider` | OpenSSL 3.0 provider. |
| `confium-tls-signer` | TLS 1.3 signature callback. |
| `confium-jce-provider` | Java Cryptography Extension provider. |

## Network / Transport

| Crate | Role |
| --- | --- |
| `confium-net` | Network abstraction. |
| `confium-net-tcp` | TCP transport. |
| `confium-net-quic` | QUIC transport. |
| `confium-net-ws` | WebSocket transport. |
| `confium-sandbox-wasm` | WASM sandbox for browser director signing. |
| `confium-sandbox-process` | Out-of-process sandbox. |

## Identity / Config

| Crate | Role |
| --- | --- |
| `confium-identity` | Actor identity (manufacturer, lab, director). |
| `confium-config` | Deployment manifest (TOML) with validation. |

## Transparency / Archival

| Crate | Role |
| --- | --- |
| `confium-transparency` | Append-only Merkle tree + OTS anchoring. |
| `confium-ots` | OpenTimestamps client. |
| `confium-ers` | RFC 4998 Evidence Record Syntax. |

## Choosing a crate

- **As a library**: `confium-core` + interface crates (`composite`,
  `pki`, `attributes`, `transparency`).
- **Plugin author**: `confium-api` + `confium-macros`.
- **Threshold signing**: pick a protocol crate (`frost-ed25519`,
  `frost-p256`, `cmp20`, `gg18`) and use `confium-tc-coordinator`.
- **HSM/PKI replacement**: Mode 2 crates — `confium-pkcs11-server`,
  `confium-openssl-provider`, `confium-jce-provider`.
- **Institutional PKI**: Mode 3 — `confium-cert`,
  `confium-cert-delegation`, `confium-cms`, `confium-attributes`,
  `confium-transparency`.

## See also

- [Architecture](./architecture.mdx)
- [RustDoc](https://docs.confium.org/)
