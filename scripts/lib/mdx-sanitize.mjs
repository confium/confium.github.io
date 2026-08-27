/**
 * Patches vendored MDX to survive the MDX 3 parser. Pure
 * string → string; the fetch script owns traversal and writing.
 *
 *  - HTML comments at the top of a file (`<!-- ... -->`) are illegal;
 *    the `<!` is parsed as JSX. Rewritten to MDX-style comments.
 *  - Markdown autolinks (`<https://...>`) are not accepted by MDX;
 *    rewritten to explicit `[label](url)` links.
 *  - `{word}` in prose parses as a JSX expression; escaped so
 *    upstream template placeholders render literally. Inline code
 *    and already-escaped braces are left alone.
 */

export function sanitizeMdx(text) {
  let sanitized = text;
  if (sanitized.match(/^<!--/m)) {
    sanitized = sanitized.replace(/^<!--([\s\S]*?)-->/, '{/*$1*/}');
  }
  sanitized = sanitized.replace(
    /<((?:https?|mailto):[^>\s]+)>/g,
    (_, url) => `[${url}](${url})`,
  );
  sanitized = sanitized.replace(
    /(^|[^`{])\{([a-zA-Z][a-zA-Z0-9_-]*)\}/g,
    '$1\\{$2\\}',
  );
  return sanitized;
}
