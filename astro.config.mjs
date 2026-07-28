import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Confium public website.
//
// Mirrors the sister RNP site architecture (rnpgp.org):
// Astro 7 + Vue 3 + Tailwind 4 (Vite plugin) + Pagefind search.
//
// Content format: plain Markdown (.md). MDX is intentionally NOT used
// (the @astrojs/mdx integration does not yet cleanly interoperate with
// Astro 7's rolldown-vite build). Plain Markdown covers everything
// the content needs; component composition happens in .astro pages.
export default defineConfig({
  site: 'https://www.confium.org',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [vue(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
