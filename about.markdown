---
layout: page
title: About
permalink: /about/
---

Confium is an open-source framework for **multi-stakeholder threshold cryptography**, supporting three layered deployment modes:

1. **Mode 1 — Peer-to-peer threshold cryptography**: nodes on the internet do threshold cryptography directly (MPC, distributed custody, BFT consensus signing).
2. **Mode 2 — TC PKI replacement**: drop-in for existing PKI consumers via PKCS#11 server, OpenSSL 3.0 provider, JCE provider, and TLS signer. Includes PQC migration path via composite signatures.
3. **Mode 3 — TC Certificate PKI**: custom certificate formats and workflow semantics for institutional deployments (OIML CNML, BIPM calibration, pharmaceutical regulators, accreditation bodies).

## Flagship reference deployment

The **OIML Certificat Numérique de Métrologie Légale (CNML)** project is the Mode 3 flagship. It demonstrates Confium at the highest-stakes end of the spectrum: international treaty organization (OIML, 60+ member states), nation-state adversary (both cyber and political), decades-long archival, sovereignty sensitivity, globally distributed directors, annual ceremony cadence.

Partnerships:
- **Ribose** operates OIML SMART, owns CNML, owns Confium
- **BIML** (OIML secretariat) is the institutional partner
- **NIST** partners on MPTS evaluation and threshold-cryptography standardization

## Project governance

Confium is led by Ribose Inc. under the BSD-2-Clause open-source license. See the [project governance roadmap](https://github.com/confium/confium/blob/main/TODO.roadmap/65-project-governance.md) for decision-making process and roles.

## Funding

This project was funded through the [NGI0 PET Fund](https://nlnet.nl/PET), a fund established by NLnet with financial support from the European Commission's [Next Generation Internet](https://ngi.eu/) programme, under the aegis of DG Communications Networks, Content and Technology under grant agreement No 825310.

## Contact

- Source code: [github.com/confium/confium](https://github.com/confium/confium)
- Documentation: [docs.confium.org](https://docs.confium.org)
- Issues: [GitHub Issues](https://github.com/confium/confium/issues)
- Security reports: see [SECURITY.md](https://github.com/confium/confium/blob/main/SECURITY.md)
