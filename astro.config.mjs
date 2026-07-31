import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// Confium public website.
//
// Mirrors the sister RNP site architecture (rnpgp.org):
// Astro 7 + Vue 3 + Tailwind 4 (Vite plugin) + Pagefind search.
//
// Content format: MDX (.mdx). The MDX integration's vite-plugin-mdx
// filters by `id: /\.mdx$/` so non-MDX files (rss.xml.ts, etc.) are
// not touched.
export default defineConfig({
  site: 'https://www.confium.org',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [vue(), sitemap(), mdx()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        '@components': new URL('./src/components', import.meta.url).pathname,
        '@layouts': new URL('./src/layouts', import.meta.url).pathname,
        '@lib': new URL('./src/lib', import.meta.url).pathname,
        '@data': new URL('./src/data', import.meta.url).pathname,
      },
    },
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
