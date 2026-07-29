/**
 * Homepage design tokens — typed continuations of the design system.
 *
 * Used by section components and primitives throughout the site
 * to map the three brand identity tones to semantic CSS tokens.
 */

export type BrandTone = 'blue' | 'teal' | 'gold';

/**
 * Map a BrandTone to its semantic CSS color token name. Centralised
 * so consumers never branch on tone — they look up the token.
 */
export const TONE_COLOR: Readonly<Record<BrandTone, 'accent' | 'accent2' | 'gold-ink'>> = {
  blue: 'accent',
  teal: 'accent2',
  gold: 'gold-ink',
};

/**
 * Map a BrandTone to its tint CSS token (for section bands).
 */
export const TONE_TINT: Readonly<Record<BrandTone, 'tint-blue' | 'tint-teal' | 'tint-gold'>> = {
  blue: 'tint-blue',
  teal: 'tint-teal',
  gold: 'tint-gold',
};

/**
 * Inverted tonal order to alternate panels: blue, teal, gold, blue, ...
 */
export const TONE_CYCLE: readonly BrandTone[] = ['blue', 'teal', 'gold'];
