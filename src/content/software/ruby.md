---
name: Ruby
description: "Native Ruby extension (magnus + rb-sys) wrapping the Confium engine. Composite sign + verify, transparency log, PKI + CMS, threshold sessions, attributes DSL. Hard-bundles rnp-rs for OpenPGP armor encode/decode."
install_command: "gem install confium"
docs_repo: "github.com/confium/confium-ruby"
docs_ref: "main"
docs_subtree: "docs"
weight: 2
---

The Ruby gem wraps the Rust engine via a native extension built
at `gem install` time. The full Confium API surface is available
to Ruby applications.

## What's covered

| Subsystem | Ruby surface |
| --- | --- |
| **Composite signatures** | `Confium::Composite.sign_ed25519`, `sign_p256`, `verify`, `verify_with` — Ed25519 + ECDSA-P256 composite sign + verify. |
| **Transparency log** | `Confium::Transparency::MerkleTree`, `InclusionProof` with `#verify_with_leaf` for external auditors, `#verify_consistency` per RFC 6962 §2.1.2. |
| **PKI** | `Confium::PKI::Certificate`, `CSR.from_pem` / `from_der`, fingerprint + validity + serial accessors. |
| **CMS SignedData** | `Confium::PKI::SignedData.build_detached`, `#to_der`, `#verify`, `#verify_with_builtin`. |
| **XMLDSig** | Canonicalize XML prior to signature. |
| **Attributes DSL** | `Confium::Attributes::Predicate.parse`, `SignerAttributes`, evaluation against a signer set. |
| **Identity + Config** | `Confium::Identity::Actor`, `Confium::Config::Manifest` (deployment manifest TOML validation). |
| **Threshold sessions** | `Confium::TC::FrostP256` (Shamir + ECDSA), `ElGamalP256`, `CMP20`, `GG18` — the full threshold protocol surface. |
| **Long-term archival** | `Confium::ERS::EvidenceRecord` — RFC 4998 Evidence Record Syntax. |
| **OTS anchoring** | `Confium::OTS` — OpenTimestamps client for anchoring transparency roots in Bitcoin. |
| **OpenPGP (bundled)** | `Confium::OpenPGP.armor`, `.dearmor` — RFC 9580 OpenPGP armor, hard-bundled via `rnp-rs`. |

## Install

```sh
gem install confium
```

The gem compiles a Rust native extension at install time using
`rb_sys` + `magnus`. Prerequisites:

- Ruby ≥ 3.1
- Rust stable 1.85+
- A C toolchain (`cc`, `make`)

The native extension has `rnp-rs` (OpenPGP, RFC 9580) **hard-bundled** —
no separate `ruby-rnp` install needed for armor encode/decode.

## Sign + verify a composite signature

```ruby
require "confium"

# Sign
sig = Confium::Composite.sign_ed25519(
  message: "hello",
  secret_key: ed25519_secret_key_bytes,
)
puts sig.signature.unpack1("H*")

# Verify
result = Confium::Composite.verify(
  message: "hello",
  signature: sig.signature,
  public_key: ed25519_public_key_bytes,
)
puts result.valid?  # => true
```

## Anchor a signature in the transparency log

```ruby
tree = Confium::Transparency::MerkleTree.new
seq = tree.append(
  artifact_type: :threshold_signature,
  artifact_hash: sha256_of_signature,
)
proof = tree.inclusion_proof(seq)

# External auditor verifies with the published leaf hash + root:
proof.verify_with_leaf(leaf_hash, root_hash)  # raises on failure
```

## Long-term archival via RFC 4998 ERS

```ruby
ers = Confium::ERS::EvidenceRecord.new
ers.add_archival_timestamp(timestamp_token_der)
ers.add_otss_root(transparency_root_hash, ots_stamp)
archive_record = ers.to_der  # RFC 4998 ERS envelope
```

The envelope preserves the verifiability of a signature long
after the original signing algorithm's security has degraded.

## OpenPGP armor (hard-bundled)

```ruby
require "confium"

# Standard OpenPGP armor — no separate ruby-rnp install needed
armored = Confium::OpenPGP.armor(raw_bytes, Confium::OpenPGP::PUBLIC_KEY)
decoded = Confium::OpenPGP.dearmor(armored)
```

For full RFC 9580 OpenPGP (key generation, signing, verification,
encryption), install `ruby-rnp` alongside. The two gems coexist
without symbol conflict. See
[Confium and RNP](/concepts/confium-and-rnp/) for the
sibling-project relationship.

## See also

- [OpenPGP integration use case](/use-cases/openpgp-integration/)
  — the dual-world pattern (standard PGP + threshold signing).
- [Long-term archival use case](/use-cases/long-term-archival/)
  — ERS in practice.
- [`confium-ruby` source](https://github.com/confium/confium-ruby).
