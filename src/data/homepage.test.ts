import { describe, it, expect } from 'vitest';
import { TONE_COLOR, TONE_TINT, TONE_CYCLE, type BrandTone } from './homepage';

describe('TONE_COLOR', () => {
  it('maps every BrandTone to a semantic CSS color token', () => {
    expect(TONE_COLOR.blue).toBe('accent');
    expect(TONE_COLOR.teal).toBe('accent2');
    expect(TONE_COLOR.gold).toBe('gold-ink');
  });

  it('covers every BrandTone variant', () => {
    const tones: BrandTone[] = ['blue', 'teal', 'gold'];
    for (const tone of tones) {
      expect(TONE_COLOR[tone]).toBeTruthy();
    }
  });

  it('every value is one of the three semantic color tokens', () => {
    const validTokens = new Set(['accent', 'accent2', 'gold-ink']);
    for (const value of Object.values(TONE_COLOR)) {
      expect(validTokens.has(value)).toBe(true);
    }
  });

  it('mapping is one-to-one (no two tones share a color)', () => {
    const values = Object.values(TONE_COLOR);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('TONE_TINT', () => {
  it('maps every BrandTone to its tint CSS token', () => {
    expect(TONE_TINT.blue).toBe('tint-blue');
    expect(TONE_TINT.teal).toBe('tint-teal');
    expect(TONE_TINT.gold).toBe('tint-gold');
  });

  it('covers every BrandTone variant', () => {
    const tones: BrandTone[] = ['blue', 'teal', 'gold'];
    for (const tone of tones) {
      expect(TONE_TINT[tone]).toBeTruthy();
    }
  });

  it('every tint value matches the `tint-<tone>` pattern', () => {
    for (const [tone, tint] of Object.entries(TONE_TINT)) {
      expect(tint).toBe(`tint-${tone}`);
    }
  });
});

describe('TONE_CYCLE', () => {
  it('is an ordered array of the three tones', () => {
    expect(TONE_CYCLE).toEqual(['blue', 'teal', 'gold']);
  });

  it('has exactly 3 entries', () => {
    expect(TONE_CYCLE).toHaveLength(3);
  });

  it('every entry is a valid BrandTone', () => {
    const validTones = new Set<BrandTone>(['blue', 'teal', 'gold']);
    for (const tone of TONE_CYCLE) {
      expect(validTones.has(tone)).toBe(true);
    }
  });
});
