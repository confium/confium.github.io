/**
 * Threshold-cryptography quorum math. Pure functions — no Vue, no
 * DOM. The source of truth for "is this configuration valid, and
 * what is its current signing state?".
 *
 * The QuorumPlayground Vue component is a thin presentation layer
 * over these functions; the math itself is independently testable
 * and reusable (could equally drive a CLI preview, a doc diagram,
 * or a spec fixture).
 */

export type QuorumStatus = 'idle' | 'insufficient' | 'ready';

export interface Party {
  readonly id: number;
  readonly signed: boolean;
}

export interface QuorumState {
  readonly total: number;
  readonly threshold: number;
  readonly participating: number;
  readonly status: QuorumStatus;
  readonly canSign: boolean;
  readonly parties: readonly Party[];
}

/** Lower bound on total parties — needs at least 2 for a meaningful threshold. */
export const MIN_TOTAL = 2;

/** Upper bound — kept small for UI slider range; math works for any N. */
export const MAX_TOTAL = 9;

/** Clamp a value into [lo, hi]. */
function clamp(value: number, lo: number, hi: number): number {
  if (value < lo) return lo;
  if (value > hi) return hi;
  return value;
}

/**
 * Compute the canonical QuorumState for a (total, threshold,
 * participating) triple. All inputs are clamped to valid ranges so
 * callers can pass raw slider values.
 *
 * Invariants guaranteed on the returned state:
 *   - MIN_TOTAL ≤ total ≤ MAX_TOTAL
 *   - 2 ≤ threshold ≤ total
 *   - 0 ≤ participating ≤ total
 *   - parties.length === total, parties[i].signed === (i < participating)
 */
export function quorumState(
  total: number,
  threshold: number,
  participating: number,
): QuorumState {
  const t = clamp(Math.floor(total), MIN_TOTAL, MAX_TOTAL);
  const th = clamp(Math.floor(threshold), MIN_TOTAL, t);
  const p = clamp(Math.floor(participating), 0, t);

  const status: QuorumStatus =
    p === 0 ? 'idle' : p < th ? 'insufficient' : 'ready';

  const parties: Party[] = Array.from({ length: t }, (_, i) => ({
    id: i,
    signed: i < p,
  }));

  return {
    total: t,
    threshold: th,
    participating: p,
    status,
    canSign: status === 'ready',
    parties,
  };
}

/**
 * Human-readable description of the current status, in the
 * interface's voice. Active voice, plain verbs, no filler.
 */
export function describeStatus(state: QuorumState): string {
  switch (state.status) {
    case 'idle':
      return 'No signers yet — the signature cannot be produced.';
    case 'insufficient':
      return `Only ${state.participating} of ${state.threshold} required signers participated. No single party can sign alone.`;
    case 'ready':
      return `Quorum reached: ${state.participating} ≥ ${state.threshold}. The composite signature is valid.`;
  }
}
