---
name: Daemon
description: "The confiumd long-running service — JSON-RPC over Unix socket or TCP for signing sessions and PKI operations."
install_command: "cargo install confium-daemon"
weight: 5
---

`confiumd` is the daemon binary for long-running operations:
threshold signing session orchestration, transparency log
interaction, PKI validation. See the
[`confiumd` documentation](/docs/cli/daemon/).

```sh
cargo install confium-daemon --locked
confiumd --listen unix:///var/run/confium.sock
```
