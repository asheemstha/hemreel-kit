import { describe, expect, it } from 'vitest';
import { scoreBand } from '@/ui/ScoreBadge';
import { estimateAt10k, formatEstimate } from '@/data/fixtures';
import { countdownAt, formatClock } from '@/hooks/useCountdown';
import { comboOf } from '@/hooks/useHotkeys';

describe('scoreBand', () => {
  it('splits at 39/40 and 64/65', () => {
    expect(scoreBand(0)).toBe('weak');
    expect(scoreBand(39)).toBe('weak');
    expect(scoreBand(40)).toBe('maybe');
    expect(scoreBand(64)).toBe('maybe');
    expect(scoreBand(65)).toBe('strong');
    expect(scoreBand(100)).toBe('strong');
  });
});

describe('estimateAt10k', () => {
  it('pays per1k × 10 inside the clamps', () => {
    expect(estimateAt10k({ kind: 'per-view', per1k: 1.5, min: 3.5, max: 150 })).toBe(15);
  });
  it('clamps up to the minimum', () => {
    expect(estimateAt10k({ kind: 'per-view', per1k: 0.2, min: 3.5, max: 150 })).toBe(3.5);
    expect(estimateAt10k({ kind: 'per-view', per1k: 1, min: 10, max: 100 })).toBe(10);
  });
  it('clamps down to the maximum', () => {
    expect(estimateAt10k({ kind: 'per-view', per1k: 20, min: 3.5, max: 150 })).toBe(150);
  });
  it('returns null for pool campaigns', () => {
    expect(estimateAt10k({ kind: 'pool', pool: 12500 })).toBeNull();
    expect(formatEstimate({ kind: 'pool', pool: 12500 })).toBeNull();
  });
  it('formats the estimate line', () => {
    expect(formatEstimate({ kind: 'per-view', per1k: 1.5, min: 3.5, max: 150 })).toBe('≈ $15 at 10K views');
    expect(formatEstimate({ kind: 'per-view', per1k: 0.2, min: 3.5, max: 150 })).toBe('≈ $3.50 at 10K views');
  });
});

describe('countdown maths', () => {
  it('formats minutes and seconds', () => {
    expect(formatClock(13 * 60000 + 2000)).toBe('13:02');
    expect(formatClock(45000)).toBe('00:45');
    expect(formatClock(-5)).toBe('00:00');
  });
  it('flags urgent under 5 min and expired at zero', () => {
    expect(countdownAt(1000 + 4 * 60000, 1000)).toMatchObject({ urgent: true, expired: false, minutes: 4 });
    expect(countdownAt(1000, 1000)).toMatchObject({ expired: true, text: '00:00' });
  });
});

describe('comboOf', () => {
  const ev = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);
  it('normalises keys to the keymap aria form', () => {
    expect(comboOf(ev({ key: 'p' }))).toBe('P');
    expect(comboOf(ev({ key: ' ' }))).toBe('Space');
    expect(comboOf(ev({ key: 'z', metaKey: true }))).toBe('Meta+Z');
    expect(comboOf(ev({ key: '?', shiftKey: true }))).toBe('Shift+Slash');
    expect(comboOf(ev({ key: ',', metaKey: true }))).toBe('Meta+Comma');
    expect(comboOf(ev({ key: 'ArrowLeft', shiftKey: true }))).toBe('Shift+ArrowLeft');
  });
});
