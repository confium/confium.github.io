import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Vitest configuration.
 *
 * Mirrors the tsconfig + astro.config path aliases so tests can
 * import via `@lib/...`, `@data/...`, `@components/...`, etc.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'scripts/lib/**/*.test.mjs'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts', 'src/data/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
    },
  },
});
