<script setup lang="ts">
import { ref, computed, defineComponent, h, onMounted, onUnmounted } from 'vue';
import { CONFUM_EVENTS, on } from '@lib/events';

interface PagefindHit {
  url: string;
  excerpt: string;
  meta: { title?: string; description?: string };
}

let pagefind: any = null;

async function ensurePagefind() {
  if (pagefind) return pagefind;
  try {
    // Dynamic import — runtime path so Vite doesn't try to resolve at build.
    const importFn = new Function('u', 'return import(u)');
    pagefind = await importFn('/pagefind/pagefind.js');
    await pagefind.init();
  } catch (e) {
    console.warn('[confium] pagefind not available:', e);
  }
  return pagefind;
}

const isOpen = ref(false);
const query = ref('');
const hits = ref<PagefindHit[]>([]);
const selectedIndex = ref(0);
let cleanupOpen: (() => void) | null = null;

async function runSearch() {
  const pf = await ensurePagefind();
  if (!pf || query.value.trim().length === 0) {
    hits.value = [];
    selectedIndex.value = 0;
    return;
  }
  const search = await pf.search(query.value);
  const top = await Promise.all(search.results.slice(0, 8).map((r: any) => r.data()));
  hits.value = top as PagefindHit[];
  selectedIndex.value = 0;
}

function close() {
  isOpen.value = false;
  query.value = '';
  hits.value = [];
}

function selectAndNavigate(i: number) {
  const hit = hits.value[i];
  if (hit) window.location.href = hit.url;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    close();
    e.preventDefault();
  } else if (isOpen.value && e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value + 1) % hits.value.length;
  } else if (isOpen.value && e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value =
      (selectedIndex.value - 1 + hits.value.length) % hits.value.length;
  } else if (isOpen.value && e.key === 'Enter') {
    e.preventDefault();
    selectAndNavigate(selectedIndex.value);
  }
}

onMounted(() => {
  cleanupOpen = on(CONFUM_EVENTS.openSearch, async () => {
    isOpen.value = true;
    await ensurePagefind();
    setTimeout(() => {
      const input = document.getElementById('confium-search-input') as HTMLInputElement;
      input?.focus();
    }, 50);
  });
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  cleanupOpen?.();
  window.removeEventListener('keydown', handleKeydown);
});

// Async renderer for each hit — keeps the parent template clean.
const SearchResult = defineComponent({
  props: { hit: { type: Object as () => PagefindHit, required: true } },
  setup(props) {
    return () =>
      h('div', null, [
        h('div', { class: 'text-sm font-medium' }, props.hit.meta?.title || props.hit.url),
        props.hit.meta?.description
          ? h('div', { class: 'text-xs text-muted-foreground mt-0.5' }, props.hit.meta.description)
          : null,
        props.hit.excerpt
          ? h('div', { class: 'text-xs text-muted-foreground mt-1', innerHTML: props.hit.excerpt })
          : null,
      ]);
  },
});
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
    @click.self="close"
  >
    <div
      class="absolute inset-0 bg-black/30 backdrop-blur-sm"
      @click="close"
    />
    <div
      class="relative w-full max-w-2xl bg-card border border-line rounded-lg shadow-lift overflow-hidden"
    >
      <div class="flex items-center border-b border-line px-4">
        <svg class="w-4 h-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <input
          id="confium-search-input"
          v-model="query"
          type="search"
          placeholder="Search Confium docs…"
          class="w-full px-3 py-4 bg-transparent border-0 focus:outline-none text-sm"
          autocomplete="off"
          @input="runSearch"
        />
        <kbd class="text-xs font-mono text-muted-foreground">esc</kbd>
      </div>
      <ul v-if="hits.length > 0" class="max-h-96 overflow-y-auto">
        <li
          v-for="(hit, i) in hits"
          :key="hit.url"
        >
          <a
            href="#"
            class="block px-4 py-3 hover:bg-brand-50/50 dark:hover:bg-brand-900/10"
            :class="i === selectedIndex ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''"
            @click.prevent="selectAndNavigate(i)"
            @mousemove="selectedIndex = i"
          >
            <SearchResult :hit="hit" />
          </a>
        </li>
      </ul>
      <div v-else-if="query.length > 0" class="px-4 py-8 text-center text-sm text-muted-foreground">
        No results for "{{ query }}"
      </div>
    </div>
  </div>
</template>
