<script setup lang="ts">
/**
 * QuorumPlayground — interactive threshold cryptography demo.
 *
 * Presentation layer over `lib/quorum.ts`. The math is pure and
 * unit-tested; this component only renders state and routes slider
 * input to state transitions.
 *
 * Status indicator is `aria-live` so screen-reader users hear
 * state changes as the slider moves.
 */
import { computed, ref, watch } from 'vue';
import {
  MAX_TOTAL,
  MIN_TOTAL,
  describeStatus,
  quorumState,
  type QuorumStatus,
} from '@lib/quorum';

const total = ref(5);
const threshold = ref(3);
const participating = ref(0);

const state = computed(() =>
  quorumState(total.value, threshold.value, participating.value),
);

const statusText = computed(() => describeStatus(state.value));

// Keep threshold ≤ total when total drops.
watch(total, (n) => {
  if (threshold.value > n) threshold.value = n;
  if (participating.value > n) participating.value = n;
});

function setParticipating(value: number) {
  participating.value = Math.max(0, Math.min(value, total.value));
}

const statusDotClass = (status: QuorumStatus) =>
  status === 'ready'
    ? 'bg-accent2'
    : status === 'insufficient'
      ? 'bg-warning'
      : 'bg-faint/40';

const partyClass = (signed: boolean) =>
  signed
    ? 'bg-accent text-white border-accent shadow-card'
    : 'bg-surface text-muted border-line hover:border-accent';
</script>

<template>
  <div class="rounded-2xl border border-line bg-surface p-6 shadow-card">
    <div class="grid sm:grid-cols-2 gap-6 mb-6">
      <div>
        <label
          for="qp-total"
          class="mono-label"
        >
          Total parties (N)
        </label>
        <div class="mt-2 flex items-center gap-3">
          <input
            id="qp-total"
            v-model.number="total"
            type="range"
            :min="MIN_TOTAL"
            :max="MAX_TOTAL"
            class="qp-range w-full"
          />
          <output for="qp-total" class="font-mono text-lg w-8 text-right tabular-nums">
            {{ total }}
          </output>
        </div>
      </div>
      <div>
        <label
          for="qp-threshold"
          class="mono-label"
        >
          Threshold (T)
        </label>
        <div class="mt-2 flex items-center gap-3">
          <input
            id="qp-threshold"
            v-model.number="threshold"
            type="range"
            :min="MIN_TOTAL"
            :max="total"
            class="qp-range w-full"
          />
          <output for="qp-threshold" class="font-mono text-lg w-8 text-right tabular-nums">
            {{ threshold }}
          </output>
        </div>
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-3">
        <label for="qp-signers" class="mono-label">
          Signers participating
        </label>
        <span class="text-xs text-muted font-mono">
          {{ participating }} / {{ total }} (need {{ threshold }})
        </span>
      </div>
      <input
        id="qp-signers"
        :value="participating"
        type="range"
        min="0"
        :max="total"
        class="qp-range w-full"
        @input="setParticipating(Number(($event.target as HTMLInputElement).value))"
      />
    </div>

    <div class="mt-6 flex flex-wrap gap-2" role="group" aria-label="Parties">
      <button
        v-for="p in state.parties"
        :key="p.id"
        type="button"
        :class="[
          'w-11 h-11 rounded-full font-mono text-sm border transition-all',
          partyClass(p.signed),
        ]"
        :title="`Party ${p.id + 1}${p.signed ? ' (signed)' : ''}`"
        :aria-pressed="p.signed"
        @click="setParticipating(p.signed ? p.id : p.id + 1)"
      >
        {{ p.id + 1 }}
      </button>
    </div>

    <div
      class="mt-6 p-4 rounded-lg border border-line bg-surface-dim"
      role="status"
      aria-live="polite"
    >
      <div class="flex items-start gap-3">
        <span
          :class="['mt-1.5 w-3 h-3 rounded-full flex-shrink-0 transition-colors', statusDotClass(state.status)]"
          aria-hidden="true"
        />
        <p class="text-sm leading-relaxed">
          {{ statusText }}
        </p>
      </div>
    </div>

    <p class="mt-4 text-xs text-muted leading-relaxed">
      Adjust N and T to model any quorum policy — 3-of-5 directors,
      5-of-9 from 3 distinct regions, and so on. Confium's
      attribute-based threshold DSL expresses policies that the
      coordinator enforces at signing time.
    </p>
  </div>
</template>

<style scoped>
.qp-range {
  accent-color: var(--accent);
}
</style>
