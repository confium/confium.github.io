import { describe, it, expect } from 'vitest';
import { AUDIENCES, resolveAudience, type AudienceSlug } from './audiences';

describe('AUDIENCES', () => {
  it('contains the canonical 12 audience pages', () => {
    expect(AUDIENCES).toHaveLength(12);
  });

  it('every entry has a unique slug', () => {
    const slugs = AUDIENCES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every entry has a non-empty name and tagline', () => {
    for (const a of AUDIENCES) {
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.tagline.length).toBeGreaterThan(0);
    }
  });

  it('all slugs match the slug pattern (lowercase, hyphen-separated)', () => {
    const slugPattern = /^[a-z][a-z0-9-]*$/;
    for (const a of AUDIENCES) {
      expect(a.slug).toMatch(slugPattern);
    }
  });
});

describe('resolveAudience', () => {
  it('returns the slug unchanged for known slugs', () => {
    expect(resolveAudience('developers')).toBe('developers');
    expect(resolveAudience('architects')).toBe('architects');
    expect(resolveAudience('executives')).toBe('executives');
  });

  it('resolves singular aliases to plural slugs', () => {
    // The docs schema uses singular forms; audience pages are plural.
    expect(resolveAudience('developer')).toBe('developers');
    expect(resolveAudience('architect')).toBe('architects');
    expect(resolveAudience('executive')).toBe('executives');
    expect(resolveAudience('operator')).toBe('operators');
    expect(resolveAudience('evaluator')).toBe('evaluators');
    expect(resolveAudience('researcher')).toBe('evaluators');
    expect(resolveAudience('cto')).toBe('ctos');
    expect(resolveAudience('product-manager')).toBe('product-managers');
    expect(resolveAudience('contributor')).toBe('contributors');
    expect(resolveAudience('student')).toBe('students');
    expect(resolveAudience('auditor')).toBe('auditors');
  });

  it('returns the input unchanged for unknown names', () => {
    // Caller decides how to handle unknown names — typically by
    // filtering them out downstream.
    expect(resolveAudience('nonexistent')).toBe('nonexistent');
    expect(resolveAudience('')).toBe('');
  });

  it('resolves case-sensitively', () => {
    // Slugs are lowercase. Uppercase variants are not aliased.
    expect(resolveAudience('Developers')).toBe('Developers');
    expect(resolveAudience('DEVELOPER')).toBe('DEVELOPER');
  });
});

describe('AUDIENCES alias coverage', () => {
  // Sanity-check that every alias declared in AUDIENCES actually
  // resolves back to its parent slug.
  it('every alias resolves to its declaring slug', () => {
    for (const a of AUDIENCES) {
      const aliases = (a as { aliases?: readonly string[] }).aliases ?? [];
      for (const alias of aliases) {
        expect(resolveAudience(alias)).toBe(a.slug);
      }
    }
  });

  it('every AudienceSlug value is present in AUDIENCES', () => {
    // TypeScript guarantees this at compile time; runtime check
    // catches schema drift if AUDIENCES is edited without updating
    // the AudienceSlug type.
    const slugs = new Set(AUDIENCES.map((a) => a.slug));
    const sampleSlugs: AudienceSlug[] = [
      'executives',
      'architects',
      'developers',
      'operators',
      'compliance',
      'evaluators',
      'ctos',
      'product-managers',
      'contributors',
      'students',
      'auditors',
      'web3',
    ];
    for (const s of sampleSlugs) {
      expect(slugs.has(s)).toBe(true);
    }
  });
});
