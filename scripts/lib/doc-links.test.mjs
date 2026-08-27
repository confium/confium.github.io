import { describe, it, expect } from 'vitest';
import { rewriteDocText } from './doc-links.mjs';
import { sanitizeMdx } from './mdx-sanitize.mjs';

const DOCS = '/vendor/ruby/docs';
const REPO = '/vendor/ruby';

function ioWith(files) {
  return { exists: (p) => files.includes(p) };
}

function ctx(io, path = `${DOCS}/index.md`, over = {}) {
  return {
    path,
    docsRoot: DOCS,
    repoRoot: REPO,
    id: 'ruby',
    repoHttps: 'https://github.com/confium/confium-ruby.git',
    ref: 'main',
    rustDocsRoot: '/vendor/rust/docs',
    io,
    ...over,
  };
}

describe('rewriteDocText — fallbacks in order', () => {
  it('rewrites relative .md links inside the docs root to site URLs', () => {
    const io = ioWith([`${DOCS}/installation.md`]);
    const { text, changed } = rewriteDocText('see [install](installation.md#section)', ctx(io));
    expect(changed).toBe(true);
    expect(text).toBe('see [install](/software/ruby/docs/installation#section)');
  });

  it('mirrors the Astro slugger: lowercase, dots stripped per segment', () => {
    const io = ioWith([`${DOCS}/guides/0.3-to-0.4.mdx`]);
    const { text } = rewriteDocText('[guide](guides/0.3-to-0.4.mdx)', ctx(io));
    expect(text).toBe('[guide](/software/ruby/docs/guides/03-to-04)');
  });

  it('resolves extensionless siblings through .mdx/.md/index forms', () => {
    const io = ioWith([`${DOCS}/api/index.mdx`]);
    const { text } = rewriteDocText('[api](../api)', ctx(io, `${DOCS}/bindings/quickstart.md`));
    expect(text).toBe('[api](/software/ruby/docs/api)');
  });

  it('maps upstream /docs/… assumptions into this vendor tree', () => {
    const io = ioWith([`${DOCS}/installation.mdx`]);
    const { text } = rewriteDocText('[x](/docs/installation)', ctx(io));
    expect(text).toBe('[x](/software/ruby/docs/installation)');
  });

  it('falls back to the rust tree by position for cross-vendor links', () => {
    const io = ioWith(['/vendor/rust/docs', '/vendor/rust/docs/bindings/policy.md']);
    // A python-vendor doc referencing a rust-only page:
    const { text } = rewriteDocText('[p](policy.md)', ctx(io, '/vendor/python/docs/bindings/x.md', {
      docsRoot: '/vendor/python/docs',
      repoRoot: '/vendor/python',
      id: 'python',
      repoHttps: 'https://github.com/confium/confium-python.git',
    }));
    expect(text).toBe('[p](/software/rust/docs/bindings/policy)');
  });

  it('sends dead targets to the upstream GitHub blob, .git stripped', () => {
    const io = ioWith([]);
    const { text, changed } = rewriteDocText('[x](gone/never.md)', ctx(io));
    expect(changed).toBe(true);
    expect(text).toBe('[x](https://github.com/confium/confium-ruby/blob/main/docs/gone/never.md)');
  });

  it('leaves URLs, mailto, and site-absolute links untouched', () => {
    const src = '[a](https://x.y/z) [m](mailto:a@b.c) [s](/threshold/)';
    const { text, changed } = rewriteDocText(src, ctx(ioWith([])));
    expect(changed).toBe(false);
    expect(text).toBe(src);
  });

  it('sends image-looking targets that miss the docs tree to GitHub (parity: the skip regex only matches targets literally starting with the extension)', () => {
    const { text } = rewriteDocText('![p](../pic.svg)', ctx(ioWith([])));
    expect(text).toBe('![p](https://github.com/confium/confium-ruby/blob/main/pic.svg)');
  });

  it('keeps repo-escaping doc links but does not flag them as changes (parity with the old walker)', () => {
    const io = ioWith([]);
    const { text, changed } = rewriteDocText('[c](../../CONTRIBUTING.md)', ctx(io, `${DOCS}/bindings/quickstart.md`));
    expect(changed).toBe(false);
    expect(text).toBe('[c](https://github.com/confium/confium-ruby/blob/main/CONTRIBUTING.md)');
  });
});

describe('sanitizeMdx', () => {
  it('rewrites a leading HTML comment to an MDX comment', () => {
    expect(sanitizeMdx('<!-- note -->\nbody')).toBe('{/* note */}\nbody');
  });

  it('rewrites markdown autolinks to explicit links', () => {
    expect(sanitizeMdx('go <https://x.y> now')).toBe('go [https://x.y](https://x.y) now');
    expect(sanitizeMdx('mail <mailto:a@b.c>')).toBe('mail [mailto:a@b.c](mailto:a@b.c)');
  });

  it('escapes bare identifiers in braces but leaves code alone', () => {
    expect(sanitizeMdx('set {user_id} here')).toBe('set \\{user_id\\} here');
    expect(sanitizeMdx('`{code}` stays')).toBe('`{code}` stays');
    expect(sanitizeMdx('already \\{escaped\\}')).toBe('already \\{escaped\\}');
  });

  it('leaves text without constructs untouched', () => {
    const src = '# Title\n\nplain prose with no macros';
    expect(sanitizeMdx(src)).toBe(src);
  });
});
