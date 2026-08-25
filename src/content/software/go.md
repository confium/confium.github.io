---
name: Go
description: "Go bindings for Confium. Cloud-native threshold cryptography for Kubernetes operators, Terraform providers, Docker plugins, and every CNCF project. Currently a scaffold — API surface stable, C bridge in progress."
install_command: "go get github.com/confium/confium-go"
docs_repo: "github.com/confium/confium"
docs_ref: "main"
docs_subtree: "docs/bindings"
weight: 6
---

`confium-go` brings Confium to the cloud-native ecosystem.
Kubernetes operators, Terraform providers, Docker plugins, and
every major CNCF project are written in Go. A Go binding lets
Confium plug into all of them.

## Status: scaffold

This package is a **scaffold** — the Go API surface and cgo
plumbing are defined, but the C bridge that translates Go calls
into Rust calls (via `extern "C"` shims in
`crates/confium-go-bridge/`) is not yet implemented. The
scaffold lets Go consumers design integrations against a stable
API before the bridge ships.

When the bridge lands, every Go program that imports this
package will get a working binding with no API changes.

## Why Go?

- **Cloud-native**: Kubernetes, Docker, Istio, Linkerd, Terraform,
  Pulumi — all the major cloud-native projects are Go. A Go
  binding lets Confium plug into all of them.
- **Single static binary**: Go compiles to a single static
  binary, including the Rust crates via cgo. No runtime
  dependencies.
- **Stdlib crypto**: Go's `crypto/ecdsa` is widely deployed.
  Confium signatures verify under stdlib with zero glue code.

## Install

```sh
go get github.com/confium/confium-go
```

## API surface (target)

```go
package confium

import (
    "context"
    "github.com/confium/confium-go"
)

func SignRelease(ctx context.Context, artifact []byte) ([]byte, error) {
    sig, err := confium.CompositeSignEd25519(ctx, &confium.SignParams{
        Message:   artifact,
        SecretKey: loadMyShare(),
    })
    if err != nil {
        return nil, err
    }
    return sig.Signature, nil
}
```

## What to use today

Until the C bridge ships, Go consumers have two paths:

1. **JSON-RPC daemon** — install `confiumd` as a sidecar
   container and call via HTTP over a Unix socket. See
   [Polyglot verification](/use-cases/polyglot-verification/)
   for the pattern.
2. **OpenSSL provider** — for Go services that already use
   `crypto/tls`, Confium's OpenSSL 3.0 provider slots in
   without Go-side changes. See
   [the PKI product](/pki/).

## See also

- [Polyglot verification use case](/use-cases/polyglot-verification/)
  — the recommended path for Go today.
- [Helm chart deployment](/docs/deployment/) — running
  `confiumd` alongside your Go services in Kubernetes.
- [`confium-go` source](https://github.com/confium/confium/tree/main/crates/confium-go).
