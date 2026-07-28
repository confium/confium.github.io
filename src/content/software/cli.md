---
name: CLI
description: "The confium command-line tool — install plugins, manage trust, configure the local store."
install_command: "cargo install confium-cli"
weight: 4
---

The `confium` CLI is the primary end-user interface. It installs
plugins from the registry, manages the trusted-publisher list, and
reads/writes the local configuration. See the
[CLI reference](/docs/cli/) for per-command documentation.

```sh
cargo install confium-cli --locked
confium version
```
