<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { CONFUM_EVENTS, on } from '@lib/events';

const props = defineProps<{
  text: string;
  /** ms per character reveal */
  intervalMs?: number;
  /** character pool to draw from for the decrypt effect */
  alphabet?: string;
}>();

const intervalMs = props.intervalMs ?? 35;
const alphabet =
  props.alphabet ||
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/+=';

const displayed = ref<string>(props.text);
let frameId: number | null = null;
let cleanupReplay: (() => void) | null = null;

interface RevealState { position: number; final: string; }

function reveal(target: string) {
  if (frameId !== null) {
    clearInterval(frameId);
    frameId = null;
  }
  const finalChars = target.split('');
  let revealed = 0;
  const total = finalChars.length;
  displayed.value = '';

  frameId = window.setInterval(() => {
    if (revealed >= total) {
      if (frameId !== null) {
        clearInterval(frameId);
        frameId = null;
      }
      displayed.value = target;
      return;
    }
    let out = '';
    for (let i = 0; i < total; i++) {
      if (i < revealed) {
        out += finalChars[i];
      } else if (finalChars[i] === ' ') {
        out += ' ';
      } else {
        out += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
    displayed.value = out;
    revealed += 1;
  }, intervalMs);
}

onMounted(() => {
  reveal(props.text);
  cleanupReplay = on(CONFUM_EVENTS.replayHero, () => reveal(props.text));
});

onUnmounted(() => {
  if (frameId !== null) clearInterval(frameId);
  cleanupReplay?.();
});
</script>

<template>
  <span aria-label={props.text}>
    <span aria-hidden="true">{{ displayed }}</span>
  </span>
</template>
