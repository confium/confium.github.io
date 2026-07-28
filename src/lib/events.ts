/**
 * Typed event bus for cross-island communication. Vue islands talk to
 * each other through window.dispatchEvent; this module defines the
 * canonical event names so consumers don't drift.
 */

export const CONFUM_EVENTS = {
  openSearch: 'confium:open-search',
  closeSearch: 'confium:close-search',
  toggleTheme: 'confium:toggle-theme',
  replayHero: 'confium:replay-hero',
  selectMode: 'confium:select-mode',
} as const;

export type ConfiumEventName =
  (typeof CONFUM_EVENTS)[keyof typeof CONFUM_EVENTS];

export function dispatch<T = unknown>(
  name: ConfiumEventName,
  detail?: T,
): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on(
  name: ConfiumEventName,
  handler: (event: Event) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}
