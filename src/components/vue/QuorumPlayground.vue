<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const total = ref(5);
const threshold = ref(3);
const attempted = ref(0);

const insufficient = computed(() => attempted.value > 0 && attempted.value < threshold.value);
const quorumReached = computed(() => attempted.value >= threshold.value);
const canSign = computed(() => quorumReached.value);

const parties = computed(() => {
  return Array.from({ length: total.value }, (_, i) => ({
    id: i,
    signed: i < attempted.value,
  }));
});

function attempt(value: number) {
  attempted.value = Math.min(value, total.value);
}

function reset() {
  attempted.value = 0;
}

// Keep threshold sensible when total changes.
watch(total, (n) => {
  if (threshold.value > n) threshold.value = n;
  if (attempted.value > n) attempted.value = n;
});
</script>

<template>
  <div class="rounded-lg border border-line bg-card p-6 shadow-card">
    <div class="grid sm:grid-cols-2 gap-6 mb-6">
      <div>
        <label class="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Total parties (N)
        </label>
        <div class="mt-2 flex items-center gap-3">
          <input
            v-model.number="total"
            type="range"
            min="2"
            max="9"
            class="w-full accent-brand-600"
          />
          <span class="font-mono text-lg w-8 text-right">{{ total }}</span>
        </div>
      </div>
      <div>
        <label class="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Threshold required (T)
        </label>
        <div class="mt-2 flex items-center gap-3">
          <input
            v-model.number="threshold"
            type="range"
            min="2"
            :max="total"
            class="w-full accent-brand-600"
          />
          <span class="font-mono text-lg w-8 text-right">{{ threshold }}</span>
        </div>
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-3">
        <label class="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Signers participating
        </label>
        <span class="text-xs text-muted-foreground">
          {{ attempted }} / {{ total }} (need {{ threshold }})
        </span>
      </div>
      <input
        :value="attempted"
        type="range"
        min="0"
        :max="total"
        class="w-full accent-brand-600"
        @input="attempt(Number(($event.target as HTMLInputElement).value))"
      />
    </div>

    <div class="mt-6 flex flex-wrap gap-2">
      <button
        v-for="p in parties"
        :key="p.id"
        type="button"
        :class="[
          'w-12 h-12 rounded-full font-mono text-sm border transition-all',
          p.signed
            ? 'bg-brand-600 text-white border-brand-600 shadow-card'
            : 'bg-card text-muted-foreground border-line hover:border-brand-400',
        ]"
        :title="`Party ${p.id + 1}${p.signed ? ' (signed)' : ''}`"
        @click="attempt(p.signed ? p.id : p.id + 1)"
      >
        {{ p.id + 1 }}
      </button>
    </div>

    <div class="mt-6 p-4 rounded-md border border-line bg-brand-50/30 dark:bg-brand-900/10">
      <div class="flex items-center gap-3">
        <div
          :class="[
            'w-3 h-3 rounded-full',
            canSign
              ? 'bg-brand-500'
              : insufficient
                ? 'bg-amber-500'
                : 'bg-muted-foreground/40',
          ]"
        />
        <p class="text-sm">
          <template v-if="attempted === 0">
            No signers yet — the signature cannot be produced.
          </template>
          <template v-else-if="insufficient">
            Only {{ attempted }} of {{ threshold }} required signers
            participated. <strong>No single party can sign alone.</strong>
          </template>
          <template v-else-if="canSign">
            Quorum reached: {{ attempted }} ≥ {{ threshold }}.
            The composite signature is valid.
          </template>
        </p>
      </div>
    </div>

    <p class="mt-4 text-xs text-muted-foreground">
      Adjust N and T to model any quorum policy — 3-of-5 directors,
      5-of-9 from 3 distinct regions, and so on. Confium's
      attribute-based threshold DSL expresses policies that the
      coordinator enforces at signing time.
    </p>
  </div>
</template>
