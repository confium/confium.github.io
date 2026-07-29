---
name: Daemon
description: "The confiumd long-running service — JSON-RPC over Unix socket or TCP for composite verification, attribute evaluation, signing sessions, and PKI operations."
install_command: "cargo install confium-daemon"
weight: 5
---

`confiumd` is the long-running service binary. It exposes a
JSON-RPC 2.0 API over a Unix socket or TCP listener. Use it from
any language to verify signatures, evaluate threshold policies,
run signing sessions, and inspect the loaded engine.

## Install + run

```sh
cargo install confium-daemon --locked
confiumd --listen unix:///var/run/confium.sock
# or: confiumd --listen tcp://127.0.0.1:7443
```

The socket is the only entry point. The CLI and bindings wrap the
same protocol.

## Methods

The daemon's dispatch table is organised by interface. **Shipped**
methods are real implementations backed by the engine; **pending**
methods return a structured `Engine` error until the matching
handler lands.

| Method | Status | Description |
| --- | --- | --- |
| `version` | shipped | Returns engine + binding version. |
| `shutdown` | shipped | Cleanly stops the daemon. |
| `composite_verify` | shipped | Verify an Ed25519 + ECDSA-P256 composite signature against a public key + message. |
| `attributes_evaluate` | shipped | Stateless evaluation of a threshold-policy predicate against a signer-attribute set. |
| `audit_subscribe` | shipped | Subscribe to the audit-event stream (signed events as they happen). |
| `plugin_load` / `plugin_unload` / `plugin_list` | shipped | Hot-load, unload, and enumerate plugins at runtime. |
| `registry_install` / `registry_search` | shipped | Install from the static registry or search by name / interface. |
| `rng_create` / `rng_generate` | shipped | Create an RNG instance and pull bytes. |
| `hash_*`, `cipher_*`, `aead_*`, `kdf_*`, `kem_*`, `keyfmt_*`, `signature_*`, `keystore_*`, `tc_*` | pending | Stubs for the remaining plugin interfaces. Each gets a real handler as the interface matures. |

## Example: verify a composite signature via JSON-RPC

```sh
curl --unix-socket /var/run/confium.sock \
     -H 'content-type: application/json' \
     -d '{
           "jsonrpc": "2.0",
           "id": 1,
           "method": "composite_verify",
           "params": {
             "message": "aGVsbG8=",
             "signature": "base64-encoded composite signature",
             "public_key": "base64-encoded public key"
           }
         }' \
     http://localhost/
```

Response:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": { "valid": true, "components_checked": 2 }
}
```

## Example: evaluate a threshold policy

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "attributes_evaluate",
  "params": {
    "predicate": "region in (EU, US) and role == 'director' and count >= 3",
    "signers": { /* signer-attribute JSON */ }
  }
}
```

The handler is **stateless** — it evaluates the predicate against
the supplied signer set without touching engine state. Safe to
call before committing to a signing session.

## Transport

- **Unix socket**: default, lowest overhead. Use for local
  co-located consumers (the PKCS#11 server, OpenSSL provider,
  CLI).
- **TCP**: for cross-host consumers. Wrap in TLS or use a
  service-mesh sidecar; the daemon doesn't terminate TLS itself.

## Operational hooks

- `audit_subscribe` exposes a stream of signed events as they
  happen. Pipe to SIEM, log shipper, or a witness for split-view
  detection.
- Plugin operations (`plugin_load` / `unload` / `list`) are
  available at runtime — no daemon restart needed to add or
  remove a hash / RNG / cipher backend.

## See also

- [Daemon CLI reference](/docs/cli/daemon/) — flags and config-file options.
- [Architecture](/docs/architecture/) — where the daemon sits in the
  engine + coordinator + adapter stack.
- [Deployment](/docs/deployment/) — Docker Compose + Helm chart for
  running `confiumd` in production.
