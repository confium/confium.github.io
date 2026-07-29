import { describe, it, expect } from 'vitest';
import {
  MAX_TOTAL,
  MIN_TOTAL,
  describeStatus,
  quorumState,
  type QuorumState,
} from './quorum';

describe('quorumState', () => {
  describe('invariants', () => {
    it('clamps total to [MIN_TOTAL, MAX_TOTAL]', () => {
      expect(quorumState(0, 2, 0).total).toBe(MIN_TOTAL);
      expect(quorumState(1, 2, 0).total).toBe(MIN_TOTAL);
      expect(quorumState(999, 2, 0).total).toBe(MAX_TOTAL);
    });

    it('clamps threshold to [MIN_TOTAL, total]', () => {
      expect(quorumState(5, 0, 0).threshold).toBe(MIN_TOTAL);
      expect(quorumState(5, 1, 0).threshold).toBe(MIN_TOTAL);
      expect(quorumState(5, 999, 0).threshold).toBe(5);
    });

    it('clamps participating to [0, total]', () => {
      expect(quorumState(5, 3, -10).participating).toBe(0);
      expect(quorumState(5, 3, 999).participating).toBe(5);
    });

    it('parties array length matches total', () => {
      const s = quorumState(7, 3, 2);
      expect(s.parties).toHaveLength(7);
    });

    it('parties.signed reflects participating count, in order', () => {
      const s = quorumState(5, 3, 3);
      expect(s.parties.map((p) => p.signed)).toEqual([true, true, true, false, false]);
    });

    it('parties have stable ids 0..n-1', () => {
      const s = quorumState(4, 2, 0);
      expect(s.parties.map((p) => p.id)).toEqual([0, 1, 2, 3]);
    });

    it('returns a frozen-shape object (no mutation of inputs)', () => {
      const s1 = quorumState(5, 3, 2);
      const s2 = quorumState(5, 3, 2);
      expect(s1).toEqual(s2);
    });
  });

  describe('status transitions', () => {
    it('marks idle when no parties participate', () => {
      expect(quorumState(5, 3, 0).status).toBe('idle');
    });

    it('marks insufficient below threshold', () => {
      expect(quorumState(5, 3, 1).status).toBe('insufficient');
      expect(quorumState(5, 3, 2).status).toBe('insufficient');
    });

    it('marks ready at exactly threshold', () => {
      expect(quorumState(5, 3, 3).status).toBe('ready');
    });

    it('marks ready above threshold', () => {
      expect(quorumState(5, 3, 4).status).toBe('ready');
      expect(quorumState(5, 3, 5).status).toBe('ready');
    });

    it('canSign is true iff ready', () => {
      const cases: Array<[number, number, number]> = [
        [5, 3, 0],
        [5, 3, 1],
        [5, 3, 2],
        [5, 3, 3],
        [5, 3, 4],
      ];
      for (const [n, t, p] of cases) {
        const s = quorumState(n, t, p);
        expect(s.canSign).toBe(s.status === 'ready');
      }
    });
  });

  describe('edge cases', () => {
    it('handles minimum valid quorum (T=2, N=2)', () => {
      const s = quorumState(2, 2, 1);
      expect(s.status).toBe('insufficient');
      expect(quorumState(2, 2, 2).status).toBe('ready');
    });

    it('handles T=N (all parties required)', () => {
      const s = quorumState(3, 3, 2);
      expect(s.status).toBe('insufficient');
      expect(quorumState(3, 3, 3).status).toBe('ready');
    });

    it('handles MAX_TOTAL boundary', () => {
      const s = quorumState(MAX_TOTAL, 5, 5);
      expect(s.status).toBe('ready');
      expect(s.parties).toHaveLength(MAX_TOTAL);
    });

    it('floors non-integer inputs', () => {
      const s = quorumState(5.9, 3.9, 2.9);
      expect(s.total).toBe(5);
      expect(s.threshold).toBe(3);
      expect(s.participating).toBe(2);
    });
  });
});

describe('describeStatus', () => {
  it('describes idle state in active voice', () => {
    const s: QuorumState = quorumState(5, 3, 0);
    expect(describeStatus(s)).toMatch(/no signers/i);
  });

  it('describes insufficient state with the count', () => {
    const s = quorumState(5, 3, 2);
    const text = describeStatus(s);
    expect(text).toContain('2');
    expect(text).toContain('3');
    expect(text).toMatch(/no single party can sign alone/i);
  });

  it('describes ready state with the quorum hit', () => {
    const s = quorumState(5, 3, 3);
    const text = describeStatus(s);
    expect(text).toMatch(/quorum reached/i);
    expect(text).toContain('3');
  });
});
