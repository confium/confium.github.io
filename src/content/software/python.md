---
name: Python
description: "Native Python extension (PyO3) wrapping the Confium engine. Composite sign + verify, transparency log, PKI + CMS build, attributes DSL, OTS anchor, ERS archival, XMLDSig, deployment manifest."
install_command: "pip install confium"
docs_repo: "github.com/confium/confium"
docs_ref: "main"
docs_subtree: "docs/bindings"
weight: 3
---

The Python binding ships as a native wheel built with PyO3 0.22.
Targets Python 3.9+. Source lives at `crates/confium-python/`
inside the main Rust workspace.

## What's covered

Python now matches Ruby's coverage row-for-row on the
[parity matrix](https://github.com/confium/confium/blob/main/docs/bindings/parity.mdx).
Every row that was Python ❌ has been flipped to ✅.

| Subsystem | Python surface |
| --- | --- |
| **Composite signatures** | `CompositeSignature.sign_ed25519`, `sign_p256`, `verify`, `verify_with` — Ed25519 + ECDSA-P256 composite sign + verify. |
| **Transparency log** | `MerkleTree`, `InclusionProof`, `verify_inclusion_with_head`, `verify_inclusion_with_leaf` — RFC 6962 inclusion proofs. |
| **PKI** | `Certificate.from_pem` / `from_der`, `CSR.from_pem`, fingerprint + validity + serial accessors. |
| **CMS SignedData** | `SignedData.from_json`, `build_detached`, `to_der`, `verify`, `verify_with_builtin` — build + verify detached CMS envelopes. |
| **XMLDSig** | Canonicalize XML prior to signature (newly shipped). |
| **Attributes DSL** | `Predicate.parse`, `SignerAttributes`, evaluation against a signer set. |
| **Identity + Config** | `Identity.Actor`, `Config.Manifest` (deployment manifest TOML validation, newly shipped). |
| **Threshold sessions** | `TC.FrostP256` (Shamir + ECDSA), `ElGamalP256`, `CMP20`, `GG18` — full threshold protocol surface. |
| **OTS anchoring** | `OTS` client — anchor transparency roots in Bitcoin (newly shipped). |
| **Long-term archival** | `ERS.EvidenceRecord` — RFC 4998 Evidence Record Syntax (newly shipped). |
| **Versioning** | `version()`, `core_version()` — binding + engine version introspection. |

## Install

```sh
pip install confium
```

The wheel bundles the Rust engine, so no separate `libconfium`
setup is required. Pre-built wheels are published for CPython
3.9+ on Linux x86_64 / arm64, macOS x86_64 / arm64, and
Windows x86_64.

## Sign + verify a composite signature

```python
import confium

sig = confium.CompositeSignature.sign_ed25519(
    message=b"hello",
    secret_key=ed25519_secret_key_bytes,
)
print(sig.signature.hex())

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

inbound = cfpki.SignedData.from_der(raw)
result = inbound.verify_with_builtin(trust_roots=[root_cert])
```

## Long-term archival via RFC 4998 ERS

```python
from confium import ers

record = ers.EvidenceRecord()
record.add_archival_timestamp(timestamp_token_der)
record.add_otss_root(transparency_root_hash, ots_stamp)
archive_record = record.to_der()  # RFC 4998 ERS envelope
```

## What Python does NOT cover (yet)

- **PKCS#11 / OpenSSL / JCE adapters**. Those are Rust-side
  server processes; Python verifies what they produce.
- **Browser-side verification**. Use `@confium/confium-wasm` for
  in-browser composite / transparency / attributes verification.

## See also

- [Architecture](/docs/architecture/) — how the engine, coordinator,
  and transparency log fit together.
- [Ruby binding](/software/ruby/) — covers the same surface plus
  hard-bundled OpenPGP via `rnp-rs`.
- [Python signing service use case](/use-cases/python-signing-service/)
  — embedding composite signing in Django / Flask / FastAPI.
- [`confium-python` source](https://github.com/confium/confium/tree/main/crates/confium-python).
