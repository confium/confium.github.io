import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectGateViolations } from '../check-gates.mjs';

let dir;
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'gates-'));
  // Baseline: one healthy spec page so the specs walk always has data.
  write(join('specs', '22-full', 'index.html'), '<h1>t</h1><h2>a</h2><h2>b</h2>');
});
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

function write(rel, content) {
  const path = join(dir, rel);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content);
}

describe('collectGateViolations', () => {
  it('reports OIML in any dist file, including svg', () => {
    write('diagram.svg', '<svg><text>OIML label</text></svg>');
    const v = collectGateViolations(dir, { minSpecPages: 0 });
    expect(v.oiml).toHaveLength(1);
    expect(v.oiml[0]).toContain('diagram.svg');
    expect(v.incompleteSpecs).toHaveLength(0);
  });

  it('reports forbidden language only in html/md/mdx', () => {
    write('page.html', '<p>coming soon</p>');
    write('page.md', 'see the roadmap');
    write('ignored.json', '{"note": "planned"}');
    const v = collectGateViolations(dir, { minSpecPages: 0 });
    expect(v.language.some((f) => f.endsWith('page.html'))).toBe(true);
    expect(v.language.some((f) => f.endsWith('page.md'))).toBe(true);
    expect(v.language.some((f) => f.endsWith('ignored.json'))).toBe(false);
  });

  it('flags spec pages that render without content', () => {
    write(join('specs', '00-empty', 'index.html'), '<h1>Only hero</h1>');
    const v = collectGateViolations(dir, { minSpecPages: 0 });
    expect(v.incompleteSpecs).toHaveLength(1);
    expect(v.incompleteSpecs[0]).toContain('00-empty');
  });

  it('fails loudly when the specs section is gutted (page-count floor)', () => {
    write(join('specs', '22-already-counted', 'index.html'), '<h2>a</h2><h2>b</h2>');
    const v = collectGateViolations(dir); // default floor: 30
    const floor = v.incompleteSpecs.filter((e) => e.includes('vendor pull'));
    expect(floor).toHaveLength(1);
  });
});
