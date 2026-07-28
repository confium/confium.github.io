---
name: PKCS#11 server
description: "PKCS#11 v3.0 server — exposes Confium as a virtual HSM to existing PKCS#11 consumers."
install_command: "cargo install confium-pkcs11-server"
weight: 6
---

The PKCS#11 server is the drop-in adapter for existing HSM-backed
applications. Connect OpenSSL `ENGINE_pkcs11`, Java `SunPKCS11`,
or nginx with `ssl_engine pkcs11` — they see a normal PKCS#11
token, but every signing call dispatches into a Confium threshold
session. See the
[PKCS#11 server docs](/docs/tooling/pkcs11-server/).

```sh
cargo install confium-pkcs11-server --locked
confium-pkcs11-server --config /etc/confium/pkcs11.toml
```
