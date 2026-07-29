/**
 * @vitest-environment node
 *
 * Run with the node environment (default) so `window` is undefined.
 * This verifies the SSR safety of events.ts: when there's no
 * window, dispatch and on are silent no-ops rather than throws.
 *
 * For browser-side behavior, integration tests via Playwright or
 * similar are more appropriate than unit tests.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CONFUM_EVENTS, dispatch, on } from './events';

describe('CONFUM_EVENTS', () => {
  it('exposes the canonical event names', () => {
    expect(CONFUM_EVENTS.openSearch).toBe('confium:open-search');
    expect(CONFUM_EVENTS.closeSearch).toBe('confium:close-search');
    expect(CONFUM_EVENTS.toggleTheme).toBe('confium:toggle-theme');
    expect(CONFUM_EVENTS.replayHero).toBe('confium:replay-hero');
    expect(CONFUM_EVENTS.selectMode).toBe('confium:select-mode');
  });

  it('every event name follows the confium:* namespace', () => {
    for (const name of Object.values(CONFUM_EVENTS)) {
      expect(name).toMatch(/^confium:[a-z-]+$/);
    }
  });

  it('every event name is unique', () => {
    const names = Object.values(CONFUM_EVENTS);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('dispatch (SSR — no window)', () => {
  it('is a no-op when window is undefined', () => {
    expect(() => dispatch(CONFUM_EVENTS.toggleTheme)).not.toThrow();
    expect(() => dispatch(CONFUM_EVENTS.openSearch, { query: 'x' })).not.toThrow();
  });
});

describe('on (SSR — no window)', () => {
  it('returns a no-op cleanup when window is undefined', () => {
    const cleanup = on(CONFUM_EVENTS.toggleTheme, () => {});
    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });
});

describe('dispatch + on (with window)', () => {
  beforeEach(() => {
    // Simulate a browser environment by attaching a fake window.
    const listeners: Record<string, EventListener> = {};
    (globalThis as { window?: unknown }).window = {
      dispatchEvent: vi.fn((event: Event) => {
        const type = (event as CustomEvent).type;
        if (listeners[type]) listeners[type](event);
        return true;
      }),
      addEventListener: vi.fn((type: string, handler: EventListener) => {
        listeners[type] = handler;
      }),
      removeEventListener: vi.fn((type: string) => {
        delete listeners[type];
      }),
      CustomEvent: class CustomEvent extends Event {
        detail: unknown;
        constructor(type: string, init: { detail?: unknown } = {}) {
          super(type);
          this.detail = init.detail;
        }
      },
    } as unknown as Window;
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('dispatch fires a CustomEvent with the given detail', () => {
    const handler = vi.fn();
    on(CONFUM_EVENTS.toggleTheme, handler);
    dispatch(CONFUM_EVENTS.toggleTheme, { mode: 'dark' });
    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ mode: 'dark' });
  });

  it('on returns a cleanup that removes the handler', () => {
    const handler = vi.fn();
    const cleanup = on(CONFUM_EVENTS.openSearch, handler);
    cleanup();
    dispatch(CONFUM_EVENTS.openSearch);
    expect(handler).not.toHaveBeenCalled();
  });
});
