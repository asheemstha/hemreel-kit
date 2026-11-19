import { useNow } from './clock';

export interface CountdownState {
  /** Milliseconds left, never below zero. */
  msLeft: number;
  /** "13:02", "04:10", "00:45". Hours roll into minutes. */
  text: string;
  /** Whole minutes left, for spoken updates. */
  minutes: number;
  expired: boolean;
  /** Under five minutes. */
  urgent: boolean;
}

export function formatClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function countdownAt(deadline: number, now: number): CountdownState {
  const msLeft = Math.max(0, deadline - now);
  return { msLeft, text: formatClock(msLeft), minutes: Math.floor(msLeft / 60000), expired: msLeft <= 0, urgent: msLeft < 5 * 60000 };
}

/** Ticks every second from a deadline timestamp (ms since epoch). */
export function useCountdown(deadline: number): CountdownState {
  return countdownAt(deadline, useNow());
}
