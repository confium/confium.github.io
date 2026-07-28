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
        ? 'bg-card/85 backdrop-blur-md border-b border-line shadow-card'
        : 'bg-transparent border-b border-transparent',
    ]"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <a href="/" class="font-semibold text-lg flex items-center gap-2">
          <span class="w-6 h-6 inline-block text-brand-600 dark:text-brand-400">
            <svg viewBox="0 0 512 512" fill="currentColor" class="w-full h-full">
              <path d="M239.1 6.3l-208 78c-18.7 7-31.1 25-31.1 45v225.1c0 18.2 10.3 34.8 26.5 42.9l208 104c13.5 6.8 29.4 6.8 42.9 0l208-104c16.3-8.1 26.5-24.8 26.5-42.9V129.3c0-20-12.4-37.9-31.1-44.9l-208-78C262 2.2 250 2.2 239.1 6.3zM256 34.2l224 84v.3l-224 97.1-224-97.1v-.3l224-84zM32 153.4l208 90.1v224.7l-208-104V153.4zm240 314.8V243.5l208-90.1v210.9L272 468.2z" />
            </svg>
          </span>
          <span>Confium</span>
        </a>

        <nav class="hidden md:flex items-center gap-1">
          <a
            v-for="item in nav"
            :key="item.href"
            :href="item.href"
            class="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-brand-50/50 dark:hover:bg-brand-900/10"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-md border border-line bg-card hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors"
            @click="openSearch"
          >
            <span>Search</span>
            <kbd class="text-muted-foreground">⌘K</kbd>
          </button>

          <button
            type="button"
            class="md:hidden p-2 rounded-md hover:bg-brand-50/50 dark:hover:bg-brand-900/10"
            :aria-expanded="isMobileOpen"
            @click="isMobileOpen = !isMobileOpen"
          >
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
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
      class="md:hidden border-t border-line bg-card"
      @click="closeMobile"
    >
      <nav class="mx-auto max-w-7xl px-4 py-4 space-y-1">
        <a
          v-for="item in nav"
          :key="item.href"
          :href="item.href"
          class="block px-3 py-2 text-sm rounded-md hover:bg-brand-50/50 dark:hover:bg-brand-900/10"
        >
          {{ item.label }}
        </a>
        <button
          type="button"
          class="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-brand-50/50 dark:hover:bg-brand-900/10"
          @click.stop="openSearch"
        >
          Search (⌘K)
        </button>
      </nav>
    </div>
  </header>
</template>
