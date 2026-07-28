import { getCollection, type CollectionEntry } from 'astro:content';

export type SidebarItem = {
  label: string;
  href: string;
  current?: boolean;
};

export type CardItem = {
  title: string;
  description: string;
  href: string;
  badge?: { label: string; tone: 'accent' | 'accent2' | 'gold' };
  external?: boolean;
};

/**
 * Sort entries by a numeric `order` field, falling back to title.
 * Use for any collection that exposes `order` in its frontmatter.
 */
export function byOrder<T extends { data: { order?: number; title: string } }>(
  entries: T[],
): T[] {
  return [...entries].sort((a, b) => {
    const ao = a.data.order ?? 99;
    const bo = b.data.order ?? 99;
    return ao - bo || a.data.title.localeCompare(b.data.title);
  });
}

/**
 * Sort entries by `date` (newest first). For blog, changelog, etc.
 */
export function byDateNewest<
  T extends { data: { date?: Date } },
>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const at = a.data.date?.getTime() ?? 0;
    const bt = b.data.date?.getTime() ?? 0;
    return bt - at;
  });
}

/**
 * Group entries by the year of their `date` field. Returns an array
 * sorted with the most recent year first.
 */
export function groupByYear<T extends { data: { date?: Date } }>(
  entries: T[],
): { year: number; items: T[] }[] {
  const groups = new Map<number, T[]>();
  for (const entry of entries) {
    const year = entry.data.date?.getFullYear() ?? 0;
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(entry);
  }
  const sortedYears = [...groups.keys()].sort((a, b) => b - a);
  return sortedYears.map((year) => ({ year, items: groups.get(year)! }));
}

/**
 * Build a sidebar nav from a content collection. `currentId`
 * (optional) marks the current entry as `current: true`.
 */
export async function buildSidebar(
  collection: 'docs' | 'concepts' | 'use_cases',
  currentId?: string,
): Promise<SidebarItem[]> {
  const entries = await getCollection(collection);
  return byOrder(entries).map((e) => ({
    label: e.data.title,
    href: `/${collection === 'use_cases' ? 'use-cases' : collection}/${e.id}/`,
    current: e.id === currentId,
  }));
}

/**
 * Map a collection to CardItem for the index-page card grids.
 */
export function toCardItems<
  C extends 'docs' | 'concepts' | 'use_cases' | 'glossary' | 'specs',
>(entries: CollectionEntry<C>[]): CardItem[] {
  return byOrder(entries).map((e) => ({
    title: e.data.title,
    description: e.data.description ?? '',
    href: `/${e.collection === 'use_cases' ? 'use-cases' : e.collection}/${e.id}/`,
  }));
}
