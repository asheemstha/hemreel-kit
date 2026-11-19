import { T0 } from '@/hooks/clock';

const at = (min: number, sec = 0) => T0 + (min * 60 + sec) * 1000;

/** Submit-window deadlines used across the screens and the gallery. */
export const DEADLINES = {
  /** "Ran out of road", posted to TikTok 17 min ago: 13:02 left of the 30 min window. */
  submit: at(13, 2),
  second: at(4, 10),
  underFive: at(4, 10),
  underOne: at(0, 45),
  expired: at(0, -1),
} as const;

/** The submit window length in ms (HOME_COUNTS.submitWindowMin). */
export const SUBMIT_WINDOW_MS = 30 * 60 * 1000;
