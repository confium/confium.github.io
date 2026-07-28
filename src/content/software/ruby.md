---
name: Ruby
description: Native Ruby extension (magnus + rb-sys) wrapping the Confium engine. PKI, transparency, composite signatures, threshold crypto.
install_command: "gem install confium"
docs_repo: "github.com/confium/confium-ruby"
docs_ref: "main"
docs_subtree: "docs"
weight: 2
---

The Ruby gem wraps the Rust engine via a native extension built at
`gem install` time. The full Confium API surface is available to
Ruby applications, including PKI certificate parsing, composite
signature verification, transparency log anchoring, and threshold
signing.
