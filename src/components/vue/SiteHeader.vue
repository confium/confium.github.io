<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { CONFUM_EVENTS, dispatch, on } from '@lib/events';

const nav = [
  { label: 'Docs', href: '/docs/' },
  { label: 'Concepts', href: '/concepts/' },
  { label: 'Use Cases', href: '/use-cases/' },
  { label: 'Specs', href: '/specs/' },
  { label: 'Software', href: '/software/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'About', href: '/about/' },
];

const isMobileOpen = ref(false);
const isScrolled = ref(false);
let lastScrollY = 0;

function openSearch() {
  dispatch(CONFUM_EVENTS.openSearch);
}

function closeMobile() {
  isMobileOpen.value = false;
}

function handleScroll() {
  const y = window.scrollY;
  isScrolled.value = y > 8;
  lastScrollY = y;
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <header
    :class="[
      'fixed top-0 inset-x-0 z-40 transition-all duration-200',
      isScrolled
        ? 'bg-background/85 backdrop-blur-md border-b border-line shadow-card'
        : 'bg-transparent border-b border-transparent',
    ]"
  >
    <div class="mx-auto w-full max-w-6xl px-6">
      <div class="flex h-16 items-center justify-between">
        <a href="/" class="font-sans text-lg font-semibold flex items-center gap-2">
          <span class="w-7 h-7 inline-block">
            <svg viewBox="0 0 275 275" class="w-full h-full" aria-hidden="true">
              <path fill="#1a7bec" d="M137.5 12 L263 70 L137.5 128 L12 70 Z" opacity="0.95" />
              <path fill="#00dfb7" d="M12 70 L137.5 128 L137.5 263 L12 205 Z" opacity="0.92" />
              <path fill="#ffdc4a" d="M263 70 L137.5 128 L137.5 263 L263 205 Z" opacity="0.92" />
            </svg>
          </span>
          <span>Confium</span>
        </a>

        <nav class="hidden md:flex items-center gap-1">
          <a
            v-for="item in nav"
            :key="item.href"
            :href="item.href"
            class="rounded-full px-3.5 py-1.5 font-sans text-[0.92rem] text-muted hover:text-foreground hover:bg-surface-dim transition-colors"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="hidden sm:inline-flex items-center gap-2 rounded-full border border-line bg-background px-3 py-1.5 text-xs font-mono hover:border-accent hover:text-accent transition-colors"
            @click="openSearch"
          >
            <span>Search</span>
            <kbd class="text-faint">⌘K</kbd>
          </button>

          <a
            href="https://github.com/confium"
            class="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface-dim transition-colors"
            aria-label="GitHub"
          >
            <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15.08-.1.36-.45.08-1.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.28.67-.1 1.02-.08 1.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>

          <button
            type="button"
            class="md:hidden p-2 rounded-full hover:bg-surface-dim transition-colors"
            :aria-expanded="isMobileOpen"
            @click="isMobileOpen = !isMobileOpen"
          >
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path v-if="!isMobileOpen" fill-rule="evenodd" d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z" clip-rule="evenodd" />
              <path v-else fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile drawer -->
    <div
      v-if="isMobileOpen"
      class="fixed inset-0 z-50 flex flex-col bg-background md:hidden"
    >
      <div class="flex h-16 items-center justify-between px-6 border-b border-line">
        <p class="mono-label">Menu</p>
        <button
          type="button"
          class="p-2 rounded-full hover:bg-surface-dim"
          @click="closeMobile"
          aria-label="Close menu"
        >
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <nav class="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
        <a
          v-for="item in nav"
          :key="item.href"
          :href="item.href"
          class="block text-2xl font-semibold text-foreground hover:text-accent transition-colors py-1"
          @click="closeMobile"
        >
          {{ item.label }}
        </a>
      </nav>
      <div class="px-6 py-6 border-t border-line">
        <a
          href="https://github.com/confium"
          class="text-sm font-mono text-faint hover:text-accent"
        >
          github.com/confium →
        </a>
      </div>
    </div>
  </header>
</template>
