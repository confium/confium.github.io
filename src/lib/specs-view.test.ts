import { describe, it, expect } from 'vitest';
import { groupSpecsByCategory, SPEC_CATEGORY_ORDER } from './specs-view';

const spec = (upstream_path: string, category?: string) => ({
  data: { upstream_path, category },
});

describe('groupSpecsByCategory', () => {
  it('groups in presentation order with the index first', () => {
    const groups = groupSpecsByCategory([
      spec('specs/22-threshold-session.adoc', 'threshold'),
      spec('specs/PRODUCTS.adoc', 'index'),
      spec('specs/90-security-model.adoc', 'security'),
      spec('specs/00-framework-overview.adoc', 'architecture'),
    ]);
    expect(groups.map((g) => g.category)).toEqual([
      'index',
      'architecture',
      'threshold',
      'security',
    ]);
  });

  it('sorts unknown categories after known ones, alphabetically', () => {
    const groups = groupSpecsByCategory([
      spec('specs/a.adoc', 'zz-unknown'),
      spec('specs/b.adoc', 'aa-unknown'),
      spec('specs/c.adoc', 'pki'),
    ]);
    expect(groups.map((g) => g.category)).toEqual(['pki', 'aa-unknown', 'zz-unknown']);
    expect(groups[1].label).toBe('aa-unknown'); // unknown labels fall back to the key
  });

  it('defaults missing categories to spec and keeps upstream order within groups', () => {
    const groups = groupSpecsByCategory([
      spec('specs/70-cmp20.adoc'),
      spec('specs/22-threshold-session.adoc', 'threshold'),
      spec('specs/51-frost-p256.adoc', 'threshold'),
    ]);
    const threshold = groups.find((g) => g.category === 'threshold')!;
    expect(threshold.specs.map((s) => s.data.upstream_path)).toEqual([
      'specs/22-threshold-session.adoc',
      'specs/51-frost-p256.adoc',
    ]);
    expect(groups.find((g) => g.category === 'spec')!.label).toBe('Specifications');
  });

  it('covers every known category with a label', () => {
    for (const cat of SPEC_CATEGORY_ORDER) {
      expect(groupSpecsByCategory([spec('specs/x.adoc', cat)])[0].label, cat).toBeTruthy();
    }
  });
});
