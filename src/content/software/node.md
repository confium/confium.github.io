---
name: Node.js
description: "Server-side Node.js bindings for Confium. Composite sign + verify, transparency, PKI + CMS, threshold sessions. Uses NAPI — no CGo, no Python, no separate runtime. The signing surface that WASM (verifier-only) deliberately omits."
install_command: "npm install @confium/confium-node"
docs_repo: "github.com/confium/confium"
docs_ref: "main"
docs_subtree: "docs/bindings"
weight: 4
---

`@confium/confium-node` is the server-side Node.js binding for
Confium. Wraps the same Rust crates as the Ruby and Python
bindings — full parity across all three.

## Why Node.js when WASM exists?

The companion package
[`@confium/confium-wasm`](https://www.npmjs.com/package/@confium/confium-wasm)
is **verifier-only by design** — browsers verify, servers sign.
Node.js is server-side. This binding exposes the *signing*
surface for Node consumers:

- CI / release pipelines (sign artifacts as part of `npm publish`)
- Signing microservices behind a private API
- Scheduled-ceremony workers (cron jobs that re-share or refresh)
- Adapter backends (a PKCS#11 server written in Node)

For in-browser verification, use `@confium/confium-wasm`. For
server-side signing in Node, use `@confium/confium-node`. Same
project, two roles, two packages.

## What's covered

| Subsystem | Surface |
| --- | --- |
| **Composite signatures** | `CompositeSignature.sign_ed25519`, `sign_p256`, `verify`, `verify_with` |
| **Transparency log** | `MerkleTree`, `InclusionProof`, `verify_inclusion_with_head` |
| **PKI** | `Certificate`, `CSR` parse + fingerprint + validity |
| **CMS SignedData** | `SignedData.build_detached`, `to_der`, `verify`, `verify_with_builtin` |
| **Attributes DSL** | `Predicate.parse`, `SignerAttributes`, evaluation |
| **Threshold sessions** | `Cmp20`, `Gg18`, `FrostP256` — the full threshold protocol surface |

## Install

```sh
npm install @confium/confium-node
```

Pre-built wheels ship for:

- Linux x86_64 + aarch64 (glibc 2.28+)
- macOS x86_64 + arm64 (11+)
- Windows x86_64

No toolchain required at install — the Rust native module is
pre-compiled via NAPI.

## Sign a release artifact

```javascript
const { CompositeSignature } = require("@confium/confium-node");
const { readFileSync } = require("node:fs");

const artifact = readFileSync("./dist/package.tgz");
const secret = Buffer.from(process.env.SIGNING_KEY_HEX, "hex");

const sig = CompositeSignature.sign_ed25519({
  message: artifact,
  secretKey: secret,
});

console.log(sig.signature.toString("hex"));
```

## Verify in the same process

```javascript
const result = CompositeSignature.verify({
  message: artifact,
  signature: sig.signature,
  publicKey: Buffer.from(published_pubkey_hex, "hex"),
});
console.log(result.valid); // true
```

## Use the threshold protocols

```javascript
const { Cmp20 } = require("@confium/confium-node");

const session = new Cmp20.Session({
  coordinatorUrl: "tcp://coordinator.internal:7443",
  signerId: "release-bot-1",
  share: load_my_share(),
});

const sig = await session.sign(artifact);
console.log("threshold signature:", sig.toHex());
```

## See also

- [Node.js signing service use case](/use-cases/python-signing-service/)
  — the same pattern in Python; the Node version is the
  analogue for JavaScript stacks.
- [Polyglot verification](/use-cases/polyglot-verification/) —
  for Node consumers that just need to verify, the JSON-RPC
  daemon may be simpler than a native binding.
- [@confium/confium-node on npm](https://www.npmjs.com/package/@confium/confium-node).
