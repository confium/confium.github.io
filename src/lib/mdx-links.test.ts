/**
 * Guards against the Phase 0 regression: MDX content using relative
 * paths like `./foo.mdx` or `../foo/`. Astro doesn't rewrite these
 * when rendering, so the built HTML has the relative path embedded
 * verbatim — which then resolves wrong relative to the HTML file's
 * URL.
 *
 * Convention: use absolute paths (`/docs/foo/`) in all MDX content.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const CONTENT_ROOT = join(process.cwd(), 'src', 'content');

function findMdxFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.mdx')) out.push(path);
    }
  };
  walk(root);
  return out;
}

const mdxFiles = findMdxFiles(CONTENT_ROOT);

// Match markdown links with relative paths. Flags:
//   - ./foo, ./foo.mdx, ./foo/
//   - ../foo, ../foo.mdx
// Does NOT flag: absolute URLs (http://, mailto:), site-absolute
// paths (/foo/), in-page fragments (#anchor).
const RELATIVE_LINK_PATTERN = /\]\((\.{1,2}[/A-Za-z0-9._-]+)\)/g;

describe('MDX relative-link guard', () => {
  it('found MDX files to scan', () => {
    expect(mdxFiles.length).toBeGreaterThan(0);
  });

  it('no MDX file uses relative paths in markdown links', () => {
    const violations: { file: string; relativePath: string }[] = [];
    for (const file of mdxFiles) {
      const content = readFileSync(file, 'utf8');
      const matches = content.matchAll(RELATIVE_LINK_PATTERN);
      const rel = relative(CONTENT_ROOT, file);
      for (const match of matches) {
        violations.push({ file: rel, relativePath: match[1] });
      }
    }
    if (violations.length > 0) {
      const detail = violations
        .slice(0, 20)
        .map((v) => `  ${v.file}: ${v.relativePath}`)
        .join('\n');
      expect.fail(
        `Found ${violations.length} relative link(s) in MDX content.\n` +
          'Use absolute paths like `/docs/foo/` instead.\n' +
          `First ${Math.min(20, violations.length)}:\n${detail}`,
      );
    }
  });

  it('the relative-link pattern only matches what we want to flag', () => {
    // Each test string is a complete markdown link `[text](href)`.
    const positives = [
      '[a](./foo)',
      '[a](./foo.mdx)',
      '[a](./foo/)',
      '[a](../bar)',
      '[a](../bar.mdx)',
      '[a](../../baz)',
    ];
    const negatives = [
      '[a](/docs/foo/)',
      '[a](https://example.com/foo)',
      '[a](mailto:a@b.com)',
      '[a](#section)',
      '[a](#)',
    ];
    for (const p of positives) {
      expect(p).toMatch(RELATIVE_LINK_PATTERN);
    }
    for (const n of negatives) {
      expect(n).not.toMatch(RELATIVE_LINK_PATTERN);
    }
  });
});
