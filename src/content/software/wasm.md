---
name: WASM
description: Browser / Node.js verifier (wasm-bindgen). Composite signatures, transparency, attributes, X.509, CMS. Verifier-only — cannot sign.
install_command: "npm install @confium/confium-wasm"
weight: 3
---

The WASM package provides a verifier-only subset of Confium for
browsers and Node.js. It can verify composite signatures, validate
transparency log inclusion proofs, evaluate attribute-based
threshold predicates, and parse X.509 / CMS structures. It cannot
sign — threshold signing requires the full Rust or Ruby stack.
