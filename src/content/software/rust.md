---
name: Rust
description: Native Rust workspace — 66 crates spanning the engine, threshold protocols, PKI, storage, adapters, transparency, and the six product facades.
install_command: "cargo add confium-core"
docs_repo: "github.com/confium/confium"
docs_ref: "main"
docs_subtree: "docs"
weight: 1
---

The Rust workspace is the source of truth for the Confium engine and
all cryptographic primitives. Every other binding wraps the cdylib
produced by this workspace.
