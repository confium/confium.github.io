import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseFrontmatter } from './frontmatter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOFTWARE_DIR = join(__dirname, '..', '..', 'src', 'content', 'software');

describe('parseFrontmatter', () => {
  it('parses plain and quoted values, colons included', () => {
    const fm = parseFrontmatter(
      '---\nplain: docs\nquoted: "docs v2: bindings"\nsingle: \'kept\'\nrepo: github.com/confium/confium-ruby\n---\n\nbody',
    );
    expect(fm).toEqual({
      plain: 'docs',
      quoted: 'docs v2: bindings',
      single: 'kept',
      repo: 'github.com/confium/confium-ruby',
    });
  });

  it('skips blanks and comments, never reads body text as keys', () => {
    const fm = parseFrontmatter('---\n# comment\na: 1\n\n---\nnot_a_key: nope');
    expect(fm).toEqual({ a: '1' });
  });

  it('returns null without a frontmatter block', () => {
    expect(parseFrontmatter('# just a page\n\nbody')).toBeNull();
  });
});

describe('the real vendor configuration parses cleanly', () => {
  it.skipIf(!existsSync(SOFTWARE_DIR))('every software page yields its docs_* keys', () => {
    const files = readdirSync(SOFTWARE_DIR).filter((f) => /\.(md|mdx)$/.test(f));
    expect(files.length).toBeGreaterThan(3);
    for (const f of files) {
      const fm = parseFrontmatter(readFileSync(join(SOFTWARE_DIR, f), 'utf8'));
      expect(fm, `${f}: frontmatter`).not.toBeNull();
      expect(fm, `${f}: keys`).toHaveProperty('name');
      if (fm.docs_repo) {
        // The keys the fetch pipeline depends on must survive parsing.
        expect(fm.docs_repo.trim()).toBe(fm.docs_repo);
        expect(fm.docs_subtree ?? 'docs').not.toMatch(/"/);
      }
    }
  });
});
