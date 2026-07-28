import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Six hand-written collections + three vendor-pulled collections.
 *
 * Content format: plain Markdown (.md). The MDX integration was removed
 * because @astrojs/mdx does not yet cleanly interoperate with Astro 7's
 * rolldown-vite build. Plain Markdown covers everything the content needs.
 *
 * Vendor-pulled collections read from `vendor/` (populated by
 * scripts/fetch-sources.mjs at build time). If vendor/ is empty, the
 * loader silently produces an empty collection — the site still builds.
 */

const adocFrontmatter = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
});

const mdFrontmatter = z.object({
  title: z.string(),
  description: z.string().optional(),
  mode: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal('cross')]).optional(),
  order: z.number().optional(),
});

const softwareFrontmatter = z.object({
  name: z.string(),
  description: z.string(),
  install_command: z.string().optional(),
  docs_repo: z.string().optional(),
  docs_ref: z.string().optional(),
  docs_subtree: z.string().default('docs'),
  docs_path_prefix: z.string().optional(),
  weight: z.number().default(0),
});

const specsFrontmatter = z.object({
  title: z.string(),
  description: z.string(),
  upstream_path: z.string(),
  category: z.string().default('spec'),
});

export const collections = {
  blog: defineCollection({
    loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
    schema: adocFrontmatter,
  }),

  docs: defineCollection({
    loader: glob({ base: './src/content/docs', pattern: '**/*.md' }),
    schema: adocFrontmatter.extend({
      audience: z.enum(['developer', 'executive', 'evaluator', 'researcher']).optional(),
      order: z.number().default(0),
    }),
  }),

  concepts: defineCollection({
    loader: glob({ base: './src/content/concepts', pattern: '**/*.md' }),
    schema: adocFrontmatter,
  }),

  use_cases: defineCollection({
    loader: glob({ base: './src/content/use_cases', pattern: '**/*.md' }),
    schema: mdFrontmatter,
  }),

  glossary: defineCollection({
    loader: glob({ base: './src/content/glossary', pattern: '**/*.md' }),
    schema: mdFrontmatter.extend({
      term: z.string(),
      see_also: z.array(z.string()).default([]),
    }),
  }),

  software: defineCollection({
    loader: glob({ base: './src/content/software', pattern: '**/*.md' }),
    schema: softwareFrontmatter,
  }),

  specs: defineCollection({
    loader: glob({ base: './src/content/specs', pattern: '**/*.md' }),
    schema: specsFrontmatter,
  }),

  // Vendor-pulled: per-repo implementation docs.
  softwareDocs: defineCollection({
    loader: glob({ base: './vendor', pattern: '**/docs/**/*.md' }),
    schema: adocFrontmatter.partial().extend({
      source_repo: z.string().optional(),
      upstream_path: z.string().optional(),
    }),
  }),

  // Vendor-pulled: authoritative specs from github.com/confium/specs.
  specDocs: defineCollection({
    loader: glob({ base: './vendor/specs', pattern: '**/*.md' }),
    schema: adocFrontmatter.partial().extend({
      spec_id: z.string().optional(),
    }),
  }),
};
