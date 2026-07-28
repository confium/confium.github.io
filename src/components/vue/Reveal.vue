<script setup lang="ts">
/**
 * Reveal — always-visible wrapper with a subtle rise animation on viewport
 * entry. Content is fully visible at SSR (no opacity:0 / transform offset),
 * so non-JS users and search engines see everything immediately. When JS
 * hydrates, a global IntersectionObserver in BaseLayout adds `.reveal-in`
 * to each `.reveal` element as it enters the viewport, triggering a
 * translateY(translateY → 0) keyframe rise.
 */
withDefaults(
  defineProps<{ delayMs?: number; translateY?: number }>(),
  { delayMs: 0, translateY: 12 },
);
</script>

<template>
  <div
    class="reveal"
    :data-reveal-delay="delayMs"
    :data-reveal-distance="translateY"
  >
    <slot />
  </div>
</template>