/**
 * Path-alias drift guard.
 *
 * Astro resolves imports via Vite's `resolve.alias` config. TypeScript
 * resolves them via `tsconfig.json` `paths`. The two configs MUST
 * agree, or you get the runtime-vs-type-checker divergence that bit
 * us before (TypeScript happy, build broken).
 *
 * This test parses both files and asserts they define the same set
 * of aliases pointing at the same targets.
 *
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

interface AliasExpectation {
  alias: string;
  target: string;
}

const EXPECTED_ALIASES: AliasExpectation[] = [
  { alias: '@', target: 'src' },
  { alias: '@components', target: 'src/components' },
  { alias: '@layouts', target: 'src/layouts' },
  { alias: '@lib', target: 'src/lib' },
  { alias: '@data', target: 'src/data' },
];

function parseTsconfigPaths(): Record<string, string> {
  const raw = readFileSync(`${ROOT}/tsconfig.json`, 'utf8');
  // Strip JSON-incompatible comments (none currently, but be safe).
  const json = raw.replace(/\/\/.*$/gm, '');
  const parsed = JSON.parse(json);
  const paths = parsed.compilerOptions.paths ?? {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(paths)) {
    // `@lib/*` -> `@lib`; `[ "src/lib/*" ]` -> `src/lib`
    const alias = k.replace(/\/\*$/, '');
    const target = (v as string[])[0].replace(/\/\*$/, '');
    out[alias] = target;
  }
  return out;
}

function parseViteAliases(): Record<string, string> {
  const raw = readFileSync(`${ROOT}/astro.config.mjs`, 'utf8');
  // Match the resolve.alias block. Format:
  //   resolve: { alias: { '@': '/abs/path/src', ... } }
  const blockMatch = raw.match(/alias:\s*\{([^}]*)\}/);
  if (!blockMatch) return {};
  const block = blockMatch[1];
  const out: Record<string, string> = {};
  // Match `'@alias': new URL('./target', import.meta.url).pathname`
  // or `'@alias': '/abs/path'`. `@alias` may be just `@` or `@foo`.
  const entryPattern =
    /['"](@[\w-]*)['"]\s*:\s*(?:new URL\(\s*['"]\.\/([^'"]+)['"]|['"]([^'"]+)['"])/g;
  let m: RegExpExecArray | null;
  while ((m = entryPattern.exec(block)) !== null) {
    out[m[1]] = m[2] ?? m[3];
  }
  return out;
}

describe('path-alias drift guard', () => {
  it('tsconfig.json defines every expected alias', () => {
    const paths = parseTsconfigPaths();
    for (const { alias, target } of EXPECTED_ALIASES) {
      expect(paths[alias], `tsconfig missing ${alias}`).toBe(target);
    }
  });

  it('astro.config.mjs defines every expected alias', () => {
    const aliases = parseViteAliases();
    for (const { alias, target } of EXPECTED_ALIASES) {
      expect(aliases[alias], `astro.config missing ${alias}`).toBe(target);
    }
  });

  it('tsconfig and astro.config agree on every alias', () => {
    const ts = parseTsconfigPaths();
    const vite = parseViteAliases();
    for (const { alias } of EXPECTED_ALIASES) {
      expect(vite[alias], `vite missing ${alias}`).toBe(ts[alias]);
    }
  });

  it('every declared alias actually exists on disk', async () => {
    const { statSync } = await import('node:fs');
    const vite = parseViteAliases();
    for (const { alias, target } of EXPECTED_ALIASES) {
      const path = `${ROOT}/${vite[alias] ?? target}`;
      expect(() => statSync(path), `${alias} → ${target} does not exist`).not.toThrow();
    }
  });
});
