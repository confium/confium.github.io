<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { CONFUM_EVENTS, dispatch, on } from '@lib/events';

type Theme = 'light' | 'dark' | 'system';
const theme = ref<Theme>('system');

function resolveEffective(t: Theme): 'light' | 'dark' {
  if (t === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return t;
}

function applyTheme(t: Theme) {
  theme.value = t;
  const effective = resolveEffective(t);
  if (effective === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  localStorage.setItem('confium-theme', t);
}

function cycle() {
  const next: Theme = theme.value === 'light' ? 'dark' : theme.value === 'dark' ? 'system' : 'light';
  applyTheme(next);
}

let cleanup: (() => void) | null = null;

onMounted(() => {
  const stored = (localStorage.getItem('confium-theme') as Theme) || 'system';
  theme.value = stored;
  cleanup = on(CONFUM_EVENTS.toggleTheme, cycle);
  window.addEventListener('storage', (e) => {
    if (e.key === 'confium-theme') applyTheme((e.newValue as Theme) || 'system');
  });
});

onUnmounted(() => {
  cleanup?.();
});
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors"
    :title="`Theme: ${theme}`"
    aria-label="Toggle theme"
    @click="cycle"
  >
    <svg v-if="theme === 'light'" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
    </svg>
    <svg v-else-if="theme === 'dark'" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
    <svg v-else class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.8 1.6L11.3 14.954A1 1 0 0110 14.155V9.155H6a1 1 0 01-.8-1.6l4.7-6.5z" clip-rule="evenodd" />
    </svg>
  </button>
</template>
