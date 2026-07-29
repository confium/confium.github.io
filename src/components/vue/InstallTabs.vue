<script setup lang="ts">
import { ref } from 'vue';
import CopyButton from './CopyButton.vue';

interface Tab {
  id: string;
  label: string;
  command: string;
  hint?: string;
}

const tabs: Tab[] = [
  {
    id: 'ruby',
    label: 'Ruby',
    command: 'gem install confium',
    hint: 'Ruby ≥ 3.1 + Rust stable for the native extension.',
  },
  {
    id: 'python',
    label: 'Python',
    command: 'pip install confium',
    hint: 'Python ≥ 3.9. Native wheel — no Rust toolchain required.',
  },
  {
    id: 'rust',
    label: 'Rust',
    command: 'cargo add confium-core',
    hint: 'Add the engine to your Cargo.toml workspace.',
  },
  {
    id: 'wasm',
    label: 'WASM',
    command: 'npm install @confium/confium-wasm',
    hint: 'Browser / Node.js verifier (composite, transparency, PKI).',
  },
  {
    id: 'source',
    label: 'Source',
    command: 'git clone https://github.com/confium/confium.git',
    hint: 'Build the workspace from source (Nix flake available).',
  },
];

const activeId = ref<string>('ruby');
const active = ref<Tab>(tabs[0]);

function select(id: string) {
  activeId.value = id;
  active.value = tabs.find((t) => t.id === id) ?? tabs[0];
}
</script>

<template>
  <div class="rounded-lg border border-line bg-card overflow-hidden shadow-card">
    <div class="flex border-b border-line bg-brand-50/30 dark:bg-brand-900/10">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="[
          'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
          activeId === tab.id
            ? 'border-brand-500 text-brand-700 dark:text-brand-300'
            : 'border-transparent text-muted-foreground hover:text-foreground',
        ]"
        @click="select(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="p-4">
      <div class="flex items-center justify-between gap-3">
        <code class="font-mono text-sm flex-1 overflow-x-auto whitespace-nowrap">
          <span class="text-muted-foreground select-none">$ </span>
          <span>{{ active.command }}</span>
        </code>
        <CopyButton :value="active.command" label="Copy" size="sm" />
      </div>
      <p v-if="active.hint" class="mt-3 text-xs text-muted-foreground">
        {{ active.hint }}
      </p>
    </div>
  </div>
</template>
