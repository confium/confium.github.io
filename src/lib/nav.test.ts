import { describe, it, expect, vi } from 'vitest';

// `astro:content` is a virtual module resolved only inside Astro.
// The pure functions in nav.ts (byOrder, byDateNewest, groupByYear)
// don't need it; the async collection wrappers do, but those are
// exercised through integration builds rather than unit tests.
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

// Import AFTER the mock so the module loads clean.
const { byOrder, byDateNewest, groupByYear } = await import('./nav');

interface TestEntry {
  data: { order?: number; title: string; date?: Date };
}

const makeEntries = (entries: Array<[string, number?, Date?]>): TestEntry[] =>
  entries.map(([title, order, date]) => ({
    data: { title, order, date },
  }));

describe('byOrder', () => {
  it('sorts by ascending order', () => {
    const entries = makeEntries([
      ['Charlie', 3],
      ['Alpha', 1],
      ['Bravo', 2],
    ]);
    const sorted = byOrder(entries).map((e) => e.data.title);
    expect(sorted).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('falls back to 99 when order is undefined', () => {
    const entries = makeEntries([
      ['With order', 5],
      ['No order'],
    ]);
    const sorted = byOrder(entries).map((e) => e.data.title);
    expect(sorted).toEqual(['With order', 'No order']);
  });

  it('uses title as tiebreaker for equal orders', () => {
    const entries = makeEntries([
      ['Zebra', 1],
      ['Apple', 1],
      ['Mango', 1],
    ]);
    const sorted = byOrder(entries).map((e) => e.data.title);
    expect(sorted).toEqual(['Apple', 'Mango', 'Zebra']);
  });

  it('does not mutate the input array', () => {
    const entries = makeEntries([
      ['Bravo', 2],
      ['Alpha', 1],
    ]);
    const original = entries.map((e) => e.data.title);
    byOrder(entries);
    expect(entries.map((e) => e.data.title)).toEqual(original);
  });

  it('handles empty input', () => {
    expect(byOrder([])).toEqual([]);
  });
});

describe('byDateNewest', () => {
  it('sorts newest first', () => {
    const entries = makeEntries([
      ['Old', undefined, new Date('2024-01-01')],
      ['New', undefined, new Date('2026-06-01')],
      ['Mid', undefined, new Date('2025-06-01')],
    ]);
    const sorted = byDateNewest(entries).map((e) => e.data.title);
    expect(sorted).toEqual(['New', 'Mid', 'Old']);
  });

  it('places undated entries at the end', () => {
    const entries = makeEntries([
      ['Undated'],
      ['Dated', undefined, new Date('2024-01-01')],
    ]);
    const sorted = byDateNewest(entries).map((e) => e.data.title);
    expect(sorted).toEqual(['Dated', 'Undated']);
  });

  it('does not mutate input', () => {
    const entries = makeEntries([
      ['B', undefined, new Date('2024-02-01')],
      ['A', undefined, new Date('2024-01-01')],
    ]);
    const original = entries.map((e) => e.data.title);
    byDateNewest(entries);
    expect(entries.map((e) => e.data.title)).toEqual(original);
  });
});

describe('groupByYear', () => {
  it('groups by year, newest year first', () => {
    const entries = makeEntries([
      ['A', undefined, new Date('2026-03-15')],
      ['B', undefined, new Date('2026-06-01')],
      ['C', undefined, new Date('2024-12-31')],
      ['D', undefined, new Date('2025-01-15')],
    ]);
    const groups = groupByYear(entries);
    expect(groups.map((g) => g.year)).toEqual([2026, 2025, 2024]);
  });

  it('preserves all entries within a year group', () => {
    const entries = makeEntries([
      ['A', undefined, new Date('2026-03-15')],
      ['B', undefined, new Date('2026-06-01')],
    ]);
    const groups = groupByYear(entries);
    expect(groups).toHaveLength(1);
    expect(groups[0].year).toBe(2026);
    expect(groups[0].items).toHaveLength(2);
  });

  it('places undated entries in year 0, sorted last', () => {
    const entries = makeEntries([
      ['Undated'],
      ['Dated', undefined, new Date('2026-01-01')],
    ]);
    const groups = groupByYear(entries);
    expect(groups.map((g) => g.year)).toEqual([2026, 0]);
  });

  it('handles empty input', () => {
    expect(groupByYear([])).toEqual([]);
  });

  it('handles a single year with a single entry', () => {
    const entries = makeEntries([['Solo', undefined, new Date('2026-01-01')]]);
    const groups = groupByYear(entries);
    expect(groups).toEqual([
      { year: 2026, items: [{ data: { title: 'Solo', date: new Date('2026-01-01') } }] },
    ]);
  });
});
