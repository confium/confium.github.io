<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  /** The text to copy. */
  value: string;
  /** Optional label override (defaults to "Copy"). */
  label?: string;
  /** Visual size: small for inline use, medium for primary CTA. */
  size?: 'sm' | 'md';
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Copy',
  size: 'md',
});

const copied = ref(false);
let resetTimer: number | null = null;

async function copy() {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(props.value);
    } else {
      // Legacy fallback.
      const ta = document.createElement('textarea');
      ta.value = props.value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    copied.value = true;
    if (resetTimer !== null) window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      copied.value = false;
    }, 1800);
  } catch (err) {
    console.warn('[CopyButton] copy failed:', err);
  }
}
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center gap-1.5 rounded-md font-mono transition-colors',
      size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5',
      copied
        ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
        : 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/40',
    ]"
    :aria-label="`${label} command`"
    @click="copy"
  >
    <span v-if="copied" aria-hidden="true">✓</span>
    <span v-else aria-hidden="true">⧉</span>
    <span>{{ copied ? 'Copied' : label }}</span>
  </button>
</template>
