<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import ThemeToggle from './ThemeToggle.vue';
import { dispatch, CONFUM_EVENTS } from '@lib/events';

const props = defineProps<{ overlay?: boolean }>();

const nav = [
  { label: 'Docs', href: '/docs/' },
  { label: 'Concepts', href: '/concepts/' },
  { label: 'Use Cases', href: '/use-cases/' },
  { label: 'Plugins', href: '/plugins/' },
  { label: 'Specs', href: '/specs/' },
  { label: 'Software', href: '/software/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'About', href: '/about/' },
];

const isMobileOpen = ref(false);
const isScrolled = ref(false);
let lastScrollY = 0;

const isOverlay = computed(() => !!props.overlay && !isScrolled.value);

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
      'site-header fixed top-0 inset-x-0 z-40 transition-all duration-200',
      isScrolled
        ? 'bg-background/85 backdrop-blur-md border-b border-line shadow-card'
        : 'border-b border-transparent',
      isOverlay ? 'header-overlay' : '',
    ]"
  >
    <div class="mx-auto w-full max-w-6xl px-6">
      <div class="flex h-16 items-center justify-between">
        <a href="/" class="site-logo font-sans text-lg font-bold tracking-tight lowercase flex items-center gap-2">
          <span class="w-8 h-5 inline-block">
            <svg viewBox="0 0 275.37 167.48" class="w-full h-full" aria-hidden="true">
              <path fill="#1a7bec" d="M95.79,83.73a95.44,95.44,0,0,1,31.82-71.27,83.73,83.73,0,1,0,0,142.54A95.44,95.44,0,0,1,95.79,83.73Z" transform="translate(0.08 0.01)" />
              <path fill="#00dfb7" d="M179.46,83.73A95.44,95.44,0,0,1,147.6,155a83.73,83.73,0,1,0,0-142.54A95.44,95.44,0,0,1,179.46,83.73Z" transform="translate(0.08 0.01)" />
              <path fill="#ffdc4a" d="M167.49,83.73a83.57,83.57,0,0,0-29.87-64,83.59,83.59,0,0,0,0,128.09A83.57,83.57,0,0,0,167.49,83.73Z" transform="translate(0.08 0.01)" />
            </svg>
          </span>
          <span>confium</span>
        </a>

        <nav class="hidden md:flex items-center gap-1">
          <a
            v-for="item in nav"
            :key="item.href"
            :href="item.href"
            class="nav-link rounded-full px-3.5 py-1.5 font-sans text-[0.92rem] transition-colors"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="search-btn hidden sm:inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-mono transition-colors"
            @click="openSearch"
          >
            <span>Search</span>
            <kbd class="text-faint">⌘K</kbd>
          </button>

          <a
            href="https://github.com/confium"
            class="icon-btn hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors"
            aria-label="GitHub"
          >
            <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
            </svg>
          </a>

          <ThemeToggle />

          <button
            type="button"
            class="icon-btn md:hidden p-2 rounded-full transition-colors"
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