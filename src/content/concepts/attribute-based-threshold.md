---
title: Attribute-based threshold
description: Attribute-based threshold predicates. "5-of-9 directors from 3 distinct regions." The DSL that makes quorum policy expressive.
audience: developer
order: 5
---

# Attribute-based threshold

A T-of-N quorum is the simplest useful threshold policy: any T of
the N authorized signers can act. But real institutions have
richer requirements. They don't just want "any 5 of 9 directors" —
they want "5 of 9 directors from 3 distinct regions" or "3 of 5
labs from 2 distinct jurisdictions".

Attribute-based threshold predicates express these richer policies.

## Why attributes matter

Consider a hypothetical sovereign PKI deployment with 9 authorized
issuers spanning 3 regions (NA, EU, APAC), 3 per region:

| Region | Issuers |
| --- | --- |
| NA | NA-1, NA-2, NA-3 |
| EU | EU-1, EU-2, EU-3 |
| APAC | APAC-1, APAC-2, APAC-3 |

A naive 5-of-9 policy is insufficient. If all 5 issuers in regions
NA and EU collude (or are compromised), they can sign without any
APAC participation. The policy author probably wanted
*cross-region diversity*.

The right policy: **5-of-9 from at least 3 distinct regions**.

## The DSL

Confium ships an attribute-based threshold DSL. Predicates compose
two dimensions:

1. **Quorum**: how many signers must participate.
2. **Group constraints**: which groups must be represented.

Example:

```
5-of-9 directors
from 3 distinct regions
```

This compiles to a predicate that the coordinator checks at signing
time. The coordinator receives each signer's attributes (region,
role, jurisdiction, etc.) and only counts a quorum as satisfied if
both the count threshold *and* the diversity constraint are met.

## More examples

```
3-of-5 labs
from 2 distinct jurisdictions

7-of-12 board members
including the chair
excluding conflicted parties

2-of-3 admins
between 09:00 and 17:00 UTC
```

Predicates can reference any attribute attached to a signer
(jurisdiction, role, business hours, conflict-of-interest flags).

## How it's enforced

At session start, the coordinator receives:

- The list of signers attempting to participate.
- Each signer's attribute set (signed by an authority the
  coordinator trusts).
- The policy predicate.

The coordinator evaluates the predicate against the participating
signers' attributes. If the predicate is satisfied, the session
proceeds. Otherwise, the session waits for additional signers or
fails with `Confium::PolicyViolationError`.

The predicate evaluation is deterministic and auditable — every
signing event records the predicate, the participating signers,
and the per-attribute values that satisfied it.

## Composability

Predicates compose with the rest of Confium:

- **Transparency log** records every predicate evaluation.
- **Audit trail** includes the predicate as a structured field.
- **Policy API** lets you swap predicates at runtime without
  restarting the coordinator.
- **Jurisdictional policy** can layer additional algorithm
  allow-lists on top.

## See also

- [Threshold crypto 101](./threshold-crypto-101/)
- [Architecture](/docs/architecture/)
- [Mode 3 — Sovereign PKI](/docs/mode3-sovereign-pki/)
- [Glossary: Attribute-based threshold](/glossary/#attribute-based-threshold-signing)
