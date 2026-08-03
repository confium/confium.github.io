# 068 — Specs: Vitest setup + quorum math tests

**Category**: Quality / Testing
**Severity**: Medium
**Effort**: Small
**Status**: pending
**Depends on**: 061

## Problem

The project has no test infrastructure. The user's quality bar
requires "good specs throughout". The most logic-heavy code is
`lib/quorum.ts` (after 061) — pure functions, easy to test, high
value to verify (the playground is the hero).

## Plan

### Add Vitest

```json
// package.json
"devDependencies": {
  "vitest": "^2.0.0"
},
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

### Specs for `lib/quorum.ts`

`src/lib/quorum.test.ts` — covers:

- **Boundary cases**: T=2, N=2 (minimum valid quorum)
- **Status transitions**: idle → insufficient → ready
- **Invariants**: T ≤ N always; participating ≤ N always
- **Status text**: `describeStatus()` returns correct copy for each state
- **Parties array**: signed boolean array matches participating count

```ts
import { describe, it, expect } from 'vitest';
import { quorumState, describeStatus } from './quorum';

describe('quorumState', () => {
  it('marks idle when no parties participate', () => {
    expect(quorumState(5, 3, 0).status).toBe('idle');
  });

  it('marks insufficient below threshold', () => {
    expect(quorumState(5, 3, 2).status).toBe('insufficient');
  });

  it('marks ready at threshold', () => {
    expect(quorumState(5, 3, 3).status).toBe('ready');
  });

  it('marks ready above threshold', () => {
    expect(quorumState(5, 3, 5).status).toBe('ready');
  });

  it('parties array reflects participation', () => {
    const s = quorumState(5, 3, 2);
    expect(s.parties.filter(p => p.signed)).toHaveLength(2);
  });
});
```

### What NOT to test

- Vue components (DOM testing adds complexity without much value here)
- Astro components (server-rendered, verified by build + screenshot)
- Visual styling (verified manually)

## Verification

- `npm test` passes all quorum specs
- CI doesn't break (no existing tests to conflict with)
- Coverage of `lib/quorum.ts` is 100% (it's small + pure)
