---
name: Python
description: Native Python extension (PyO3) wrapping the Confium engine. Composite sign + verify, transparency log, PKI parse + CMS build, attributes DSL.
install_command: "pip install confium"
docs_repo: "github.com/confium/confium"
docs_ref: "main"
docs_subtree: "docs/bindings"
weight: 3
---

The Python binding ships as a native wheel built with PyO3 0.22.
Targets Python 3.9+. Source lives at `crates/confium-python/` inside
the main Rust workspace.

## What's covered

The binding covers **verification, parsing, and signing**:

| Subsystem | What you can do |
| --- | --- |
| **Composite signatures** | `sign_ed25519`, `sign_p256`, `verify`, `verify_with` — produce and check Ed25519 + ECDSA-P256 composite signatures. |
| **PKI** | `Certificate.from_pem` / `from_der`, `CSR.from_pem`, fingerprint + validity + serial accessors. |
| **CMS SignedData** | `SignedData.from_json`, `build_detached`, `verify`, `verify_with_builtin` — build and verify detached CMS envelopes. |
| **Transparency log** | `MerkleTree`, `InclusionProof`, `verify_inclusion_with_head` — RFC 6962 inclusion proofs. |
| **Attributes DSL** | `Predicate.parse`, `SignerAttributes`, evaluation against a signer set — the threshold policy DSL the coordinator enforces. |
| **Versioning** | `version()`, `core_version()` — binding + engine version introspection. |

## Install

```sh
pip install confium
```

The wheel bundles the Rust engine, so no separate `libconfium`
setup is required. Pre-built wheels are published for CPython 3.9+
on Linux x86_64 / arm64, macOS x86_64 / arm64, and Windows x86_64.

## Sign + verify a composite signature

```python
import confium

# Sign (uses the engine's composite signer with the configured
# threshold session — typically run against a remote coordinator
# in production).
sig = confium.CompositeSignature.sign_ed25519(
    message=b"hello",
    secret_key=ed25519_secret_key_bytes,
)
print(sig.signature.hex())

# Verify (pure verification — safe to ship to clients).
result = confium.CompositeSignature.verify(
    message=b"hello",
    signature=sig.signature,
    public_key=ed25519_public_key_bytes,
)
print(result.valid)  # True
```

## Build + verify a CMS envelope

```python
from confium import pki as cfpki

cert = cfpki.Certificate.from_pem(open("signer.pem").read())
envelope = cfpki.SignedData.build_detached(
    payload=b"document bytes",
    certificate=cert,
    signature=cfpki.signed_data_signature(...),
)
raw = envelope.to_der()  # ship this

# On the verifier side:
inbound = cfpki.SignedData.from_der(raw)
result = inbound.verify_with_builtin(trust_roots=[root_cert])
```

## Use the attributes DSL

```python
from confium import attributes as cfa

policy = cfa.Predicate.parse(
    "region in (EU, US) and role == 'director' and count >= 3"
)
signers = cfa.SignerAttributes.from_json(signers_json)
result = policy.evaluate(signers)
print(result.satisfied)   # bool
print(result.matched)     # which signers contributed
```

## What Python does NOT cover (yet)

- **Threshold signing sessions** (the multi-round MPC over a live
  coordinator). Use the Ruby binding or call the JSON-RPC daemon's
  `composite_verify` / `attributes_evaluate` methods for production
  signing today.
- **PKCS#11 / OpenSSL / JCE adapters**. Those are Rust-side server
  processes; Python verifies what they produce.

## See also

- [Architecture](/docs/architecture/) — how the engine, coordinator,
  and transparency log fit together.
- [Ruby binding](/software/ruby/) — covers signing + threshold sessions
  end-to-end.
- [`confium-python` source](https://github.com/confium/confium/tree/main/crates/confium-python).
