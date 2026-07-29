---
name: Python
description: Native Python extension (PyO3) wrapping the Confium engine. Composite verify, transparency log, PKI parse, attributes DSL.
install_command: "pip install confium"
docs_repo: "github.com/confium/confium"
docs_ref: "main"
docs_subtree: "docs/bindings"
weight: 3
---

The Python binding ships as a native wheel built with PyO3 0.22.
Targets Python 3.9+. Source lives at `crates/confium-python/` inside
the main Rust workspace.

The binding covers **verification + parsing**: composite signature
verification (Ed25519 + ECDSA-P256), RFC 6962 transparency log with
inclusion proofs, X.509 Certificate + CSR parsing, CMS SignedData
verification, and the attribute-based threshold predicate DSL.

For **signing** workflows (composite sign, CMS build/sign, threshold
sessions), use the Ruby binding today — Python TC bindings land in a
follow-up release.
