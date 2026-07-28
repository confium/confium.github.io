<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  /** ms delay before reveal after entering viewport */
  delayMs?: number;
  /** translate distance in px before reveal */
  translateY?: number;
}
const props = withDefaults(defineProps<Props>(), {
  delayMs: 0,
  translateY: 16,
});

const el = ref<HTMLElement | null>(null);
const visible = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!el.value) return;

  // Respect prefers-reduced-motion.
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    visible.value = true;
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (props.delayMs > 0) {
            window.setTimeout(() => {
              visible.value = true;
            }, props.delayMs);
          } else {
            visible.value = true;
          }
          observer?.disconnect();
        }
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
  );
  observer.observe(el.value);
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <div
    ref="el"
    :style="{
      transform: visible ? 'translateY(0)' : `translateY(${props.translateY}px)`,
      opacity: visible ? 1 : 0,
      transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease-out',
    }"
  >
    <slot />
  </div>
</template>
