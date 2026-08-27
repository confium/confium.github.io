/**
 * AsciiDoc → Markdown conversion for the specs corpus. Pure: every
 * environment decision (which specs exist, which diagrams may be
 * embedded, where upstream blobs live) arrives through `resolve`, so
 * the module is testable with an in-memory adapter and has no fs/git
 * dependencies.
 *
 * Not a general AsciiDoc converter — the confium/specs corpus is the
 * contract: `= / ==` headings, `:attr:` headers, author lines,
 * `|===` tables, `[source]` + `----` listings, ``` fences,
 * `link:` / bare-URL macros, `image::` macros, and inline emphasis.
 *
 * resolve adapter:
 *   specHref(leaf)  -> site href for a spec that becomes a page, else null
 *   specStatus(leaf)-> 'page' | 'blocked' | 'missing'
 *   imageHref(file) -> servable href for an embeddable diagram, else null
 *   blobUrl(path)   -> canonical GitHub URL for content that stays upstream
 */

/** @param {string} id @param {string | undefined} product */
function specCategory(id, product) {
  if (product) return product;
  if (id === 'PRODUCTS') return 'index';
  const n = parseInt(id, 10);
  if (!Number.isNaN(n)) {
    if (n <= 9) return 'architecture';
    if (n <= 19) return 'modes';
  }
  return 'security';
}

function extractDescription(body) {
  const prose = body
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !/^[#>|!`={]/.test(l) && !l.startsWith('['));
  if (!prose) return '';
  const flat = prose.replace(/\s+/g, ' ');
  const cut = flat.search(/[.!?](\s|$)/);
  return (cut === -1 ? flat : flat.slice(0, cut + 1)).slice(0, 240);
}

function yamlQuote(value) {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function emitTable(rows) {
  const cells = rows
    .filter((r) => r.trim() !== '')
    .map((r) =>
      r
        .replace(/^\|/, '')
        .split('|')
        .map((c) => c.trim()),
    );
  if (!cells.length) return [];
  const width = Math.max(...cells.map((c) => c.length));
  const norm = cells.map((c) => {
    while (c.length < width) c.push('');
    return c;
  });
  const md = [`| ${norm[0].join(' | ')} |`, `|${' --- |'.repeat(width)}`];
  for (const r of norm.slice(1)) md.push(`| ${r.join(' | ')} |`);
  return md;
}

/**
 * @param {string} text
 * @param {(leaf: string) => string | null} specHref
 * @param {(leaf: string) => 'page' | 'blocked' | 'missing'} specStatus
 * @param {(file: string) => string | null} imageHref
 * @param {(path: string) => string} blobUrl
 */
function specInline(text, specHref, specStatus, imageHref, blobUrl) {
  text = text.replace(
    /link:\+\+(.+?)\+\+\[([^\]]*)\]/g,
    (_, url, label) => `[${label || url}](${url})`,
  );
  text = text.replace(
    /link:((?:https?:|mailto:)[^\s[]+)\[([^\]]*)\]/g,
    (_, url, label) => `[${label || url}](${url})`,
  );
  text = text.replace(/link:([\w./-]+?\.adoc)\[([^\]]*)\]/g, (_m, target, label) => {
    const leaf = target.replace(/\.adoc$/, '').split('/').pop();
    const label2 = label || leaf;
    const status = specStatus(leaf);
    if (status === 'page' && specHref(leaf)) {
      return `[${label2}](${specHref(leaf)})`;
    }
    if (status === 'blocked') {
      return `[${label2}](${blobUrl(`specs/${target}`)})`;
    }
    // Unwritten spec: keep the cross-reference as plain text rather
    // than linking to a GitHub page that does not exist either.
    return label2;
  });
  // Bare AsciiDoc URL macro: `https://host/path[label]`.
  text = text.replace(
    /(^|[\s(])((?:https?:\/\/)[^\s[]+)\[([^\]\n]{1,80})\]/g,
    (_m, pre, url, label) => `${pre}[${label}](${url})`,
  );
  text = text.replace(/image::([\w./-]+\.\w+)\[([^\]]*)\]/g, (_m, path, alt) => {
    const file = path.split('/').pop();
    const href = imageHref(file);
    if (href) return `![${alt}](${href})`;
    return `[${alt || 'View diagram'} (SVG)](${blobUrl(`images/${file}`)})`;
  });
  return text;
}

/**
 * @param {string} text - AsciiDoc source
 * @param {string} adocName - file name, e.g. "22-threshold-session.adoc"
 * @param {{
 *   specHref: (leaf: string) => string | null,
 *   specStatus: (leaf: string) => 'page' | 'blocked' | 'missing',
 *   imageHref: (file: string) => string | null,
 *   blobUrl: (path: string) => string,
 * }} resolve
 * @returns {{ id: string, frontmatter: Record<string, string | number>, body: string }}
 */
export function convertSpec(text, adocName, resolve) {
  const lines = text.split('\n');
  const attrs = {};
  let title = adocName.replace(/\.adoc$/, '');
  let i = 0;
  if (lines[0] && /^= /.test(lines[0])) {
    title = lines[0].replace(/^= +/, '').trim();
    i = 1;
  }
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line === '') break;
    const attr = line.match(/^:([\w-]+):\s*(.*)$/);
    if (attr) {
      attrs[attr[1]] = attr[2].trim();
      continue;
    }
    if (/ <[^>]+>$/.test(line)) continue; // author line
  }
  const out = [];
  let inFence = false;
  let inListing = false;
  let pendingLang = null;
  let table = null;
  for (; i < lines.length; i++) {
    let line = lines[i];
    if (line.startsWith('```')) {
      out.push(line);
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (line === '----') {
      if (inListing) {
        out.push('```');
        inListing = false;
      } else {
        out.push('```' + (pendingLang ?? ''));
        inListing = true;
      }
      pendingLang = null;
      continue;
    }
    if (inListing) {
      out.push(line);
      continue;
    }
    const src = line.match(/^\[source(?:,\s*([\w+.-]+))?\]\s*$/);
    if (src) {
      pendingLang = src[1] ?? '';
      continue;
    }
    if (line.trim() === '|===') {
      if (table) {
        out.push(...emitTable(table));
        table = null;
      } else {
        table = [];
      }
      continue;
    }
    if (table) {
      if (/^\[(cols|frame|grid)/i.test(line.trim())) continue;
      table.push(line);
      continue;
    }
    line = specInline(line, resolve.specHref, resolve.specStatus, resolve.imageHref, resolve.blobUrl);
    line = line.replace(
      /^(={1,6}) +(.+?)(?:\s*=*)$/,
      (_m, eq, txt) => '#'.repeat(eq.length) + ' ' + txt,
    );
    out.push(line);
  }
  if (table) out.push(...emitTable(table));

  const id = adocName.replace(/\.adoc$/, '');
  /** @type {Record<string, string | number>} */
  const frontmatter = {
    title,
    upstream_path: `specs/${adocName}`,
    category: specCategory(id, attrs.product),
  };
  const description = extractDescription(out.join('\n'));
  if (description) frontmatter.description = description;
  if (/^\d/.test(id)) frontmatter.spec_id = parseInt(id, 10);
  if (attrs.status) frontmatter.status = attrs.status;
  if (attrs.implementation) frontmatter.implementation = attrs.implementation;
  if (attrs.product) frontmatter.product = attrs.product;

  return {
    id,
    frontmatter,
    body: out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n',
  };
}

/** Serialize a convertSpec result the way the vendor tree expects. */
export function serializeSpec(converted) {
  const fm = Object.entries(converted.frontmatter).map(([k, v]) =>
    typeof v === 'number' ? `${k}: ${v}` : `${k}: ${yamlQuote(String(v))}`,
  );
  return `---\n${fm.join('\n')}\n---\n\n${converted.body}`;
}
