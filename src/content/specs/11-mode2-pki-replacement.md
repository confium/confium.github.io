---
title: Mode 2 — PKI replacement
description: Authoritative spec for the drop-in PKI replacement mode (PKCS#11, OpenSSL, JCE).
upstream_path: "specs/11-mode2-pki-replacement.adoc"
category: modes
---

Mode 2 specification: drop-in adapters for PKCS#11, OpenSSL 3.0
provider, JCE provider, and TLS signing. Existing PKI consumers
keep working unchanged; every signature is dispatched through a
threshold session.
