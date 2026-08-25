---
name: Ruby
description: "Native Ruby extension (magnus + rb-sys) wrapping the Confium crates directly. Composite sign + verify, transparency log, PKI + CMS, threshold signing sessions and coordinators, audit sinks, OpenPGP armor + opt-in verification, typed errors, JSON transport."
install_command: "gem install confium"
docs_repo: "github.com/confium/confium-ruby"
docs_ref: "main"
docs_subtree: "docs"
weight: 2
---

The Ruby gem wraps the Rust engine via a pure-Rust native extension
(`rb_sys` + `magnus`, no C dependencies). Pre-compiled gems are
published for seven platforms, so most installs need nothing but
Ruby itself.

## What's covered

| Subsystem | Ruby surface |
| --- | --- |
| **Composite signatures** | `Confium::Composite.sign_ed25519`, `sign_p256`, `Signature.new(components).verify(message)` — Ed25519 + ECDSA-P256 composites with per-component results. |
| **JSON transport** | `Composite::Signature.components_to_json` / `.from_json` — hex-encoded wire format for moving composites between services. |
| **Transparency log** | `Confium::Transparency::MerkleTree`, `InclusionProof#verify(root)` / `#verify_with_leaf(leaf, root)`, `#verify_consistency` per RFC 6962. |
| **PKI** | `Confium::PKI::Certificate.from_pem` / `from_der`, `CSR`, fingerprint + validity + serial accessors, `PathValidator.validate`. |
| **CMS SignedData** | `SignedData.from_json`, `build_detached`, `CMS::SignedDataBuilder` (Ed25519 + ECDSA-P256 signers). |
| **XMLDSig** | Canonicalize XML (RFC 3076 + Exclusive C14N) prior to signature. |
| **Attributes DSL** | `Confium::Attributes.parse`, `Signer`, `Predicate#satisfied_by?` — threshold policy over signer attributes. |
| **Identity + Config** | `Confium::Identity::Actor`, `Confium::Config::Manifest` (deployment manifest TOML validation). |
| **Threshold signing** | `Confium::TC::SigningSession` (the state machine + CMP20/GG18 combine), `Coordinator` (in-process), `NetworkCoordinator` + `SignerClient` (multi-host over TCP), `FrostP256` (Shamir + ECDSA), `ElGamalP256`, `ShareFile` persistence. |
| **Audit sinks** | `Confium::Audit` — every signing/verification op fires a record; `FileSink`, `MemorySink`, `StderrSink`, `OtlpSink` (OTLP/HTTP JSON). |
| **Long-term archival** | `Confium::ERS::EvidenceRecord` — RFC 4998 evidence records with renewal. |
| **Typed errors** | `Confium::ParseError`, `VerificationError`, `ThresholdError`, `CryptoError`, `IndexError`, `PolicyViolationError`, ... — every documented failure path, each with a structured `details` Hash. |
| **OpenPGP** | `Confium::OpenPGP.armor` / `.dearmor` — RFC 9580 ASCII armor with CRC-24 verification, pure Ruby. Signature verification (`verify_detached`, `verify`) is an opt-in build: `Confium::OpenPGP::PGP_AVAILABLE` reports whether the extension was built with the `pgp` cargo feature. |

## Install

```sh
gem install confium
```

Pre-compiled gems ship for `x86_64-linux`, `aarch64-linux`,
`x86_64-linux-musl`, `aarch64-linux-musl`, `x86_64-darwin`,
`arm64-darwin`, and `x64-mingw-ucrt` — each carrying one extension
per Ruby ABI window (3.1, 3.2, 3.3, 3.4, 4.0), so installation on
those platforms needs only Ruby ≥ 3.1.

Source builds (other platforms, or from the repo) additionally need
the Rust stable toolchain — and nothing else: the extension is
pure Rust with no C dependencies.

## Sign + verify a composite signature

```ruby
require "confium"

kp = Confium::Composite.generate_ed25519_keypair
component = Confium::Composite.sign_ed25519(kp["private_key"], "hello")
sig = Confium::Composite::Signature.new([component])

result = sig.verify("hello")
puts result.all_verified?  # => true
result.per_component.each_value do |c|
  puts "#{c['algorithm']}: #{c['verified']}"
end
```

Move the signature to another service as JSON — binary fields are
hex-encoded on the wire:

```ruby
json = Confium::Composite::Signature.components_to_json([component])
# ... transport ...
sig = Confium::Composite::Signature.from_json(json)
sig.verify("hello").all_verified?  # => true
```

## Anchor a hash in the transparency log

```ruby
require "digest"

tree = Confium::Transparency::MerkleTree.new
seq = tree.append(Digest::SHA256.digest(artifact_bytes))

proof = tree.inclusion_proof(seq)
proof.verify(tree.root)  # => true

# External auditor with only the leaf hash + published root:
proof.verify_with_leaf(leaf_hash, root_hash)  # => true | false
```

## Typed errors with structured details

```ruby
begin
  Confium::PKI::Certificate.from_pem(input)
rescue Confium::ParseError => e
  e.details  # => { format: "pem", operation: "Certificate.from_pem", ... }
end

begin
  Confium::PKI::Certificate.from_der(truncated_der)
rescue Confium::ParseError => e
  e.offset   # => 20 — the exact byte where DER decoding ran out
end

begin
  Confium::TC::Cmp20.sign(shares, 3, message)
rescue Confium::ThresholdError => e
  e.have_count  # => 2
  e.need_count  # => 3
end
```

## OpenPGP armor

```ruby
armored = Confium::OpenPGP.armor(raw_bytes, Confium::OpenPGP::PUBLIC_KEY)
decoded = Confium::OpenPGP.dearmor(armored)  # verifies the CRC-24
```

For full RFC 9580 OpenPGP (key generation, signing, verification,
encryption), install `ruby-rnp` alongside — the two coexist without
symbol conflict. See
[Confium and RNP](/concepts/confium-and-rnp/) for the
sibling-project relationship.

## See also

- [OpenPGP integration use case](/use-cases/openpgp-integration/)
  — the dual-world pattern (standard PGP + threshold signing).
- [Long-term archival use case](/use-cases/long-term-archival/)
  — ERS in practice.
- [Full gem documentation](https://github.com/confium/confium-ruby/tree/main/docs)
  — installation, API reference, error handling, and the Sinatra
  verifier quickstart.
