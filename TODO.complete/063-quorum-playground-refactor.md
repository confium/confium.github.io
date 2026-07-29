# 063 — QuorumPlayground refactor: pure logic + token fixes

**Category**: Code quality / interactivity
**Severity**: Medium
**Effort**: Small
**Status**: pending
**Depends on**: 061

## Problem

`QuorumPlayground.vue` has three concerns tangled together:

1. **Quorum math** (refs + computeds) — should live in `lib/quorum.ts`
2. **Token references that don't resolve** — `bg-brand-600`,
   `accent-brand-600`, `bg-amber-500`, `bg-muted-foreground/40` — most
   are silently no-op
3. **Presentation** — actual Vue template

## Plan

### Extract logic

Move all state computation to `lib/quorum.ts` (added in 061). The Vue
component becomes a thin presentation layer:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { quorumState, describeStatus } from '@lib/quorum';

const total = ref(5);
const threshold = ref(3);
const participating = ref(0);

const state = computed(() =>
  quorumState(total.value, threshold.value, participating.value),
);
</script>
```

### Fix token references

- `bg-brand-600` → `bg-brand` (single-shade static token, or new
  shade scale from 061)
- `accent-brand-600` on `<input type="range">` → use semantic
  `accent-accent` or a CSS custom property on the input
- `bg-amber-500` (warning state) → new `--warning` token (amber, kept
  consistent across light/dark)
- `bg-muted-foreground/40` → `bg-faint/40` (existing token)

### Improve a11y

- Status indicator: add `role="status"` and `aria-live="polite"` so
  screen readers announce state changes
- Range inputs: explicit `<output>` for current value
- Status text: use `describeStatus()` from lib for consistent voice

## Verification

- Drag sliders → status updates correctly
- Screen reader announces status changes
- Visual states (idle/insufficient/ready) clearly distinct
- `lib/quorum` is pure — no Vue imports
