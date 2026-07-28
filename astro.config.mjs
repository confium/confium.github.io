import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// Confium public website.
//
// Static output, trailing slash always, sitemap, MDX content collections,
// Vue islands, and Tailwind 4 via the Vite plugin (not an Astro
// integration — same architecture as the sister RNP site at rnpgp.org).
export default defineConfig({
  site: 'https://www.confium.org',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [vue(), sitemap(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
