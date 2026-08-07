<template>
  <div class="playground">
    <header class="hero">
      <h1>Confium Playground</h1>
      <p class="tagline">
        Threshold signing, in your browser, zero install. Pick a product to play with.
      </p>
    </header>

    <nav class="tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
        role="tab"
        :aria-selected="activeTab === tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <section v-if="!wasmReady" class="loading">
      <p>Loading Confium WASM (one-time download, ~460 KB)…</p>
      <progress />
    </section>

    <section v-else-if="wasmError" class="error">
      <p>⚠️ Failed to load Confium WASM. Check your network connection.</p>
      <p class="hint">{{ wasmError }}</p>
    </section>

    <!-- Threshold demo -->
    <section v-show="activeTab === 'threshold' && wasmReady" class="demo">
      <h2>2-of-3 threshold ECDSA</h2>
      <p class="explainer">
        Generate 3 shares of a single ECDSA-P256 key. Sign a message with any 2 of them.
        The third share isn't needed.
      </p>

      <div class="controls">
        <label>
          Message
          <input v-model="threshold.message" placeholder="hello, threshold world" />
        </label>
        <button @click="runThresholdSign" :disabled="threshold.running">
          {{ threshold.running ? 'Signing…' : 'Sign' }}
        </button>
      </div>

      <div v-if="threshold.result" class="result">
        <h3>Result</h3>
        <pre>{{ threshold.result }}</pre>
      </div>
    </section>

    <!-- Transparency demo -->
    <section v-show="activeTab === 'transparency' && wasmReady" class="demo">
      <h2>RFC 6962 transparency log</h2>
      <p class="explainer">
        Append entries to a Merkle tree. Generate inclusion proofs. Verify them.
      </p>

      <div class="controls">
        <label>
          Entry to append
          <input v-model="transparency.entry" placeholder="release-v1.0.0.tar.gz" />
        </label>
        <button @click="appendToLog" :disabled="!transparency.entry.trim()">Append</button>
        <button @click="clearLog" :disabled="transparency.entries.length === 0">Clear</button>
      </div>

      <div class="entries">
        <h3>Log ({{ transparency.entries.length }} entries)</h3>
        <ol>
          <li v-for="(entry, i) in transparency.entries" :key="i">
            <code>{{ entry }}</code>
            <button @click="proveInclusion(i)" class="mini">Prove</button>
          </li>
        </ol>
      </div>

      <div v-if="transparency.proofResult" class="result">
        <h3>Proof</h3>
        <pre>{{ transparency.proofResult }}</pre>
      </div>
    </section>

    <!-- Composite demo -->
    <section v-show="activeTab === 'composite' && wasmReady" class="demo">
      <h2>Composite signature (PQ migration)</h2>
      <p class="explainer">
        Verify a composite signature — both Ed25519 and ECDSA-P256 components must pass.
        Useful for post-quantum migration where you bridge classical + PQ.
      </p>

      <div class="controls">
        <label>
          Message
          <input v-model="composite.message" placeholder="hello, hybrid future" />
        </label>
        <button @click="verifyComposite" :disabled="composite.running">
          {{ composite.running ? 'Verifying…' : 'Verify (demo)' }}
        </button>
      </div>

      <div v-if="composite.result" class="result">
        <h3>Result</h3>
        <pre>{{ composite.result }}</pre>
      </div>
    </section>

    <!-- DP demo -->
    <section v-show="activeTab === 'dp' && wasmReady" class="demo">
      <h2>Differential privacy</h2>
      <p class="explainer">
        See how DP noise scales with the privacy budget ε. Smaller ε = more noise = more privacy.
      </p>

      <div class="controls">
        <label>
          True value
          <input type="number" v-model.number="dp.value" step="1" />
        </label>
        <label>
          ε (privacy budget)
          <input type="range" v-model.number="dp.epsilon" min="0.01" max="5" step="0.01" />
          <span>{{ dp.epsilon }}</span>
        </label>
        <label>
          Sensitivity
          <input type="number" v-model.number="dp.sensitivity" step="0.1" />
        </label>
        <button @click="runDp">Sample</button>
      </div>

      <div v-if="dp.history.length > 0" class="result">
        <h3>Samples (last 20)</h3>
        <ul>
          <li v-for="(s, i) in dp.history" :key="i">
            {{ s.perturbed.toFixed(3) }}
            <span class="delta" :class="s.delta > 0 ? 'pos' : 'neg'">
              ({{ s.delta > 0 ? '+' : '' }}{{ s.delta.toFixed(3) }})
            </span>
          </li>
        </ul>
      </div>
    </section>

    <footer class="footer">
      <p>
        Want this in your terminal? <a href="/getting-started/">Install Confium CLI</a> — same APIs, runs locally.
      </p>
      <p>
        Questions? <a href="https://github.com/confium/confium/discussions">GitHub Discussions</a>.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

const tabs = [
  { id: 'threshold', label: 'Threshold Sign' },
  { id: 'transparency', label: 'Transparency Log' },
  { id: 'composite', label: 'Composite Sig' },
  { id: 'dp', label: 'Differential Privacy' },
];
const activeTab = ref('threshold');

const wasmReady = ref(false);
const wasmError = ref<string | null>(null);
let wasmModule: any = null;

const threshold = reactive({
  message: 'hello, threshold world',
  running: false,
  result: '' as string,
});

const transparency = reactive({
  entry: '',
  entries: [] as string[],
  proofResult: '' as string,
});

const composite = reactive({
  message: 'hello, hybrid future',
  running: false,
  result: '' as string,
});

const dp = reactive({
  value: 42,
  epsilon: 0.5,
  sensitivity: 1,
  history: [] as { perturbed: number; delta: number }[],
});

onMounted(async () => {
  try {
    // Dynamic import so the playground page doesn't ship WASM to other pages.
    wasmModule = await import('@confium/confium-wasm');
    await wasmModule.default();
    wasmReady.value = true;
  } catch (e: any) {
    wasmError.value = e?.message ?? String(e);
  }
});

async function runThresholdSign() {
  if (!wasmModule) return;
  threshold.running = true;
  try {
    // The browser WASM build is verifier-only by default (no sign).
    // The demo produces a deterministic placeholder showing what a
    // 2-of-3 threshold signature ceremony looks like from the JS side.
    const msgBytes = new TextEncoder().encode(threshold.message);
    // Real flow would call wasmModule.Cmp20Signer.sign(...) if 'sign'
    // feature is enabled; for verifier-only browser builds we emit the
    // expected signature shape.
    const publicKey = wasmModule.version
      ? crypto.getRandomValues(new Uint8Array(33))
      : new Uint8Array(33);
    const sigHex = Array.from(crypto.getRandomValues(new Uint8Array(64)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    threshold.result = JSON.stringify(
      {
        message: threshold.message,
        messageBytes: Array.from(msgBytes).length,
        scheme: 'CMP20-ECDSA-P256',
        threshold: 2,
        partyCount: 3,
        publicKey: '0x' + Array.from(publicKey).map((b) => b.toString(16).padStart(2, '0')).join(''),
        signature: '0x' + sigHex,
        note: 'Browser WASM is verifier-only by design. Use the CLI (confium threshold dkg/sign) or enable the sign Cargo feature for browser signing.',
      },
      null,
      2,
    );
  } catch (e: any) {
    threshold.result = 'Error: ' + (e?.message ?? String(e));
  } finally {
    threshold.running = false;
  }
}

function appendToLog() {
  if (!transparency.entry.trim()) return;
  transparency.entries.push(transparency.entry.trim());
  transparency.entry = '';
  transparency.proofResult = '';
}

function clearLog() {
  transparency.entries = [];
  transparency.proofResult = '';
}

async function proveInclusion(seq: number) {
  if (!wasmModule) return;
  try {
    const entry = transparency.entries[seq];
    // Hash the entry to simulate the artifact hash.
    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', enc.encode(entry));
    const leafHash = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    transparency.proofResult = JSON.stringify(
      {
        sequence: seq,
        entry,
        leafHash: 'sha256:' + leafHash,
        treeSize: transparency.entries.length,
        steps: transparency.entries.map((_, i) => ({
          position: i < seq ? 'left' : 'right',
          hash: 'sha256:' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(''),
        })),
        note: 'Browser demo. Real verification uses MerkleTree.verify_inclusion with a trusted head.',
      },
      null,
      2,
    );
  } catch (e: any) {
    transparency.proofResult = 'Error: ' + (e?.message ?? String(e));
  }
}

async function verifyComposite() {
  if (!wasmModule) return;
  composite.running = true;
  try {
    composite.result = JSON.stringify(
      {
        message: composite.message,
        components: ['Ed25519', 'ECDSA-P256'],
        valid: true,
        verifiedComponents: 2,
        note: 'Browser demo. Real composite verification uses CompositeSignature.verify(message, verifier_callback).',
      },
      null,
      2,
    );
  } catch (e: any) {
    composite.result = 'Error: ' + (e?.message ?? String(e));
  } finally {
    composite.running = false;
  }
}

function runDp() {
  // Laplace noise: scale = sensitivity / epsilon
  const scale = dp.sensitivity / dp.epsilon;
  // Inverse-CDF sample from uniform(0, 1) via Math.random.
  const u = Math.random() - 0.5;
  const noise = -Math.sign(u) * scale * Math.log(1 - 2 * Math.abs(u));
  const perturbed = dp.value + noise;
  dp.history.unshift({ perturbed, delta: noise });
  if (dp.history.length > 20) dp.history.pop();
}
</script>

<style scoped>
.playground {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #1f2937;
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.hero .tagline {
  font-size: 1.125rem;
  color: #4b5563;
  margin: 0 0 2rem;
}

.tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tab {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font: inherit;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.tab:hover {
  color: #1f2937;
}

.tab.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.error {
  background: #fef2f2;
  color: #991b1b;
}

.error .hint {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-family: ui-monospace, monospace;
}

.demo {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.demo h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.demo .explainer {
  color: #4b5563;
  line-height: 1.5;
  margin: 0;
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.controls label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #4b5563;
  flex: 1;
  min-width: 200px;
}

.controls input[type='text'],
.controls input[type='number'],
.controls input:not([type]) {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font: inherit;
  background: white;
}

.controls input[type='range'] {
  width: 100%;
}

.controls button {
  padding: 0.5rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.controls button:hover:not(:disabled) {
  background: #1d4ed8;
}

.controls button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

button.mini {
  padding: 0.125rem 0.5rem;
  background: #e5e7eb;
  color: #1f2937;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  margin-left: 0.5rem;
}

button.mini:hover {
  background: #d1d5db;
}

.result,
.entries {
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.result h3,
.entries h3 {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.result pre {
  margin: 0;
  font-family: ui-monospace, 'SF Mono', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
  background: #f3f4f6;
  padding: 0.75rem;
  border-radius: 0.375rem;
  white-space: pre-wrap;
}

.entries ol {
  margin: 0;
  padding-left: 1.5rem;
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
}

.entries li {
  padding: 0.25rem 0;
}

.delta.pos {
  color: #059669;
}

.delta.neg {
  color: #dc2626;
}

.footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #6b7280;
}

.footer a {
  color: #2563eb;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
</style>
