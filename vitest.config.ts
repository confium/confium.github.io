import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@lib': new URL('./src/lib', import.meta.url).pathname,
      '@data': new URL('./src/data', import.meta.url).pathname,
      '@components': new URL('./src/components', import.meta.url).pathname,
    },
  },
});
