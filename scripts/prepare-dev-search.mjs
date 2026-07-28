/**
 * Copies the production-built Pagefind index from `dist/pagefind/`
 * into `public/pagefind/` so the dev server can serve it for local
 * search testing.
 *
 * Run automatically by `npm run dev` via the `predev` script.
 */

import { existsSync, mkdirSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'dist/pagefind');
const DST = join(ROOT, 'public/pagefind');

if (!existsSync(SRC)) {
  console.log('[prepare-dev-search] no dist/pagefind yet — run `npm run build` first');
  console.log('[prepare-dev-search] dev server will run without search results');
  process.exit(0);
}

mkdirSync(DST, { recursive: true });
cpSync(SRC, DST, { recursive: true });
console.log(`[prepare-dev-search] copied ${SRC} → ${DST}`);
