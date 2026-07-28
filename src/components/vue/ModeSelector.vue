<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Mode {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  ctaLabel: string;
}

const modes: Mode[] = [
  {
    id: 'peer-tc',
    name: 'Peer-to-Peer TC',
    tagline: 'Nodes do threshold cryptography directly. Hours to value.',
    description:
      'The simplest deployment: peers exchange threshold signing messages directly over the transport of choice. Use this for MPC, distributed custody, BFT consensus, and any setting where the participants already have a channel.',
    href: '/docs/mode1-peer-tc/',
    ctaLabel: 'Read the Mode 1 docs',
  },
  {
    id: 'pki-drop-in',
    name: 'PKI Drop-in',
    tagline:
      'Replace single-party keys with threshold keys. No ecosystem changes.',
    description:
      'Drop Confium in front of existing PKCS#11, OpenSSL, or JCE consumers. They keep working — but every signature now requires a quorum. Use this for HSM replacement, KMS, TLS signing, code signing.',
    href: '/docs/mode2-pki-drop-in/',
    ctaLabel: 'Read the Mode 2 docs',
  },
  {
    id: 'sovereign-pki',
    name: 'Sovereign PKI',
    tagline: 'Custom certificate formats for institutions. No single trusted party.',
    description:
      'Custom certificate formats, delegation rules, archival cadence, and quorum composition for institutions where no single party can be trusted. Sovereign PKI deployments include calibration registries, pharma regulator approvals, academic accreditation, and supply-chain provenance.',
    href: '/docs/mode3-sovereign-pki/',
    ctaLabel: 'Read the Mode 3 docs',
  },
];

const selectedId = ref<string>('sovereign-pki');
const selected = ref<Mode>(modes[2]);

function select(id: string) {
  selectedId.value = id;
  selected.value = modes.find((m) => m.id === id) ?? modes[0];
  if (typeof window !== 'undefined') {
    history.replaceState(null, '', `#mode-${id}`);
  }
}

function fromHash(): string | null {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash;
  const m = h.match(/^#mode-(.+)$/);
  return m ? m[1] : null;
}

onMounted(() => {
  const hash = fromHash();
  if (hash && modes.some((m) => m.id === hash)) {
    select(hash);
  }
});

onUnmounted(() => {});
</script>

<template>
  <div>
    <div class="grid md:grid-cols-3 gap-4">
      <button
        v-for="mode in modes"
        :key="mode.id"
        type="button"
        :class="[
          'text-left rounded-lg border p-5 transition-all',
          selectedId === mode.id
            ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-900/15 shadow-card'
            : 'border-line bg-card hover:border-brand-300 dark:hover:border-brand-700',
        ]"
        @click="select(mode.id)"
      >
        <div class="flex items-baseline justify-between gap-2">
          <h3 class="font-semibold text-lg">{{ mode.name }}</h3>
          <span
            v-if="selectedId === mode.id"
            class="text-brand-600 dark:text-brand-400 text-sm"
            aria-hidden="true"
          >●</span>
        </div>
        <p class="mt-2 text-sm text-muted-foreground">{{ mode.tagline }}</p>
      </button>
    </div>

    <div class="mt-6 rounded-lg border border-line bg-card p-6">
      <p class="text-base leading-relaxed">{{ selected.description }}</p>
      <a
        :href="selected.href"
        class="mt-4 inline-flex items-center gap-1 text-brand-700 dark:text-brand-300 font-medium hover:underline"
      >
        {{ selected.ctaLabel }}
        <span aria-hidden="true">→</span>
      </a>
    </div>
  </div>
</template>
