/**
 * Minimal YAML frontmatter parser for the vendor-pull configuration
 * in `src/content/software/*.md`. Handles the shapes those files use
 * — plain scalars and quoted strings — without pulling in a YAML
 * dependency: values may contain colons, quotes are stripped, and
 * non-frontmatter text is never misread as a key.
 *
 * Returns null when the text has no frontmatter block.
 */

/**
 * @param {string} text
 * @returns {Record<string, string> | null}
 */
export function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  /** @type {Record<string, string>} */
  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const [, key, raw] = m;
    let value = raw.trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }
  return frontmatter;
}
