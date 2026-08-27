import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Six hand-written collections + three vendor-pulled collections.
 *
 * Content format: MDX (.mdx) — supports component imports for future
 * enrichment. The MDX integration filters by id, so non-MDX files are
 * untouched.
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
  order: z.number().optional(),
});

const mdFrontmatter = z.object({
  title: z.string(),
  description: z.string().optional(),
  mode: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal('cross')]).optional(),
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

export const collections = {
  blog: defineCollection({
    loader: glob({ base: './src/content/blog', pattern: '**/*.mdx' }),
    schema: adocFrontmatter,
  }),

  docs: defineCollection({
    loader: glob({ base: './src/content/docs', pattern: '**/*.mdx' }),
    schema: adocFrontmatter.extend({
      audience: z.enum(['developer', 'executive', 'evaluator', 'researcher', 'operator', 'architect', 'compliance']).optional(),
      order: z.number().default(0),
      group: z.enum(['start', 'architecture', 'guides', 'reference', 'adapters']).default('start'),
    }),
  }),

  concepts: defineCollection({
    loader: glob({ base: './src/content/concepts', pattern: '**/*.mdx' }),
    schema: adocFrontmatter,
  }),

  use_cases: defineCollection({
    loader: glob({ base: './src/content/use_cases', pattern: '**/*.mdx' }),
    schema: mdFrontmatter,
  }),

  glossary: defineCollection({
    loader: glob({ base: './src/content/glossary', pattern: '**/*.{md,mdx}' }),
    schema: mdFrontmatter.extend({
      term: z.string(),
      see_also: z.array(z.string()).default([]),
    }),
  }),

  software: defineCollection({
    loader: glob({ base: './src/content/software', pattern: '**/*.md' }),
    schema: softwareFrontmatter,
  }),

  // Vendor-pulled: per-repo implementation docs. Pattern matches both
  // .md (vendor sources are still .mdx in upstream repos, but those are
  // converted on the fly by the loader) and .mdx.
  softwareDocs: defineCollection({
    loader: glob({ base: './vendor', pattern: '**/docs/**/*.{md,mdx}' }),
    schema: adocFrontmatter.partial().extend({
      source_repo: z.string().optional(),
      upstream_path: z.string().optional(),
    }),
  }),

  specDocs: defineCollection({
    loader: glob({ base: './vendor/specs/specs', pattern: '*.md' }),
    schema: adocFrontmatter
      .partial()
      .extend({
        title: z.string(),
        upstream_path: z.string(),
        spec_id: z.number().optional(),
        status: z.string().optional(),
        implementation: z.string().optional(),
        product: z.string().optional(),
      }),
  }),
};
