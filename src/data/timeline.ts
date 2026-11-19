// Timeline fixtures for the Moments editor and the video stage. Deterministic, so screenshots never change.
// Moments marked placeholder: true were invented for the mockups (see brief section 13); their titles and scores are not real.

export const STREAM_LENGTH_S = 3 * 3600 + 12 * 60 + 40; // 3:12:40

export interface Moment {
  id: string;
  start: number; // seconds into the stream
  end: number;
  title: string;
  score: number;
  selected: boolean;
  placeholder?: boolean;
}

export const MOMENTS: Moment[] = [
  { id: 'm1', start: 1102, end: 1125, title: 'Chat called it', score: 72, selected: true },
  { id: 'm2', start: 1840.5, end: 1865.5, title: 'Wait for it', score: 66, selected: true },
  { id: 'm3', start: 2711, end: 2737, title: 'The cops gave up', score: 84, selected: true },
  { id: 'm4', start: 3390, end: 3416, title: 'Talking about the map size', score: 47, selected: true },
  { id: 'm5', start: 5229.2, end: 5253.4, title: 'He did not see that coming', score: 91, selected: true },
  { id: 'm6', start: 6020, end: 6045, title: 'Missed the jump', score: 78, selected: true, placeholder: true },
  { id: 'm7', start: 6650, end: 6674, title: 'Ran out of road', score: 81, selected: true, placeholder: true },
  { id: 'm8', start: 7480, end: 7505, title: 'Clean landing', score: 88, selected: true, placeholder: true },
  { id: 'm9', start: 8120, end: 8145, title: 'Slow drive across the bay', score: 22, selected: false },
  { id: 'm10', start: 8930, end: 8953, title: 'Chat picked the car', score: 76, selected: true, placeholder: true },
  { id: 'm11', start: 9800, end: 9822, title: 'Quiet stretch at the docks', score: 41, selected: false, placeholder: true },
  { id: 'm12', start: 10710, end: 10734, title: 'Last lap of the night', score: 58, selected: true, placeholder: true },
];

/** The moment open in the editor and the clip shown in review. */
export const CURRENT_MOMENT_ID = 'm5';

/** The zoomed detail window: 60 s around the current moment. */
export const DETAIL = {
  windowStart: 5214,
  windowLength: 60,
  inPoint: 5229.2,
  outPoint: 5253.4,
  playhead: 5236.6,
  peak: { at: 5236, label: 'chat peak 1:27:16' },
} as const;

/** The clip in review: 24.2 s long, paused at 0:07.4, chat peak at 7 s. */
export const REVIEW_PLAYBACK = { time: 7.4, duration: 24.2, markers: [{ at: 7, label: 'chat peak' }] } as const;

// Seeded pseudo-random numbers (mulberry32), so the bars look organic but never change.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buckets(from: number, to: number, count: number, seed: number, base: number, peaks: Array<{ at: number; width: number; height: number }>): number[] {
  const r = rng(seed);
  const out: number[] = [];
  const step = (to - from) / count;
  for (let i = 0; i < count; i++) {
    const t = from + (i + 0.5) * step;
    let v = base * (0.45 + r() * 0.75);
    for (const p of peaks) v += p.height * Math.exp(-(((t - p.at) / p.width) ** 2));
    out.push(Math.max(0.04, Math.min(1, v)));
  }
  return out;
}

const momentPeaks = (width: number, scale: number) =>
  MOMENTS.map((m) => ({ at: (m.start + m.end) / 2, width, height: (m.score / 100) * scale }));

/** Whole-stream lanes, 240 buckets of about 48 s each. */
export const AUDIO = buckets(0, STREAM_LENGTH_S, 240, 7, 0.32, momentPeaks(90, 0.55));
export const CHAT = buckets(0, STREAM_LENGTH_S, 240, 11, 0.18, momentPeaks(70, 0.8));

const detailEnd = DETAIL.windowStart + DETAIL.windowLength;
/** Detail-window lanes, 120 buckets of 0.5 s. */
export const DETAIL_AUDIO = buckets(DETAIL.windowStart, detailEnd, 120, 23, 0.3, [
  { at: 5233, width: 2.5, height: 0.6 },
  { at: 5237, width: 1.6, height: 0.5 },
  { at: 5246, width: 3, height: 0.35 },
]);
export const DETAIL_CHAT = buckets(DETAIL.windowStart, detailEnd, 120, 29, 0.12, [
  { at: 5236, width: 2.2, height: 0.9 },
  { at: 5241, width: 3, height: 0.35 },
]);

/** "1:27:09.2" with hours, "0:07.4" without. */
export function formatTime(seconds: number, opts: { tenths?: boolean } = {}): string {
  const neg = seconds < 0;
  let s = Math.abs(seconds);
  if (opts.tenths) s = Math.round(s * 10) / 10;
  else s = Math.floor(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const whole = Math.floor(s % 60);
  const sec = String(whole).padStart(2, '0') + (opts.tenths ? `.${Math.round((s - Math.floor(s)) * 10) % 10}` : '');
  const body = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
  return neg ? `-${body}` : body;
}

/** Spoken form for aria-valuetext: "1 hour 27 minutes 9.2 seconds". */
export function spokenTime(seconds: number): string {
  const s = Math.round(Math.max(0, seconds) * 10) / 10;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.round((s % 60) * 10) / 10;
  const parts: string[] = [];
  if (h) parts.push(`${h} hour${h === 1 ? '' : 's'}`);
  if (m) parts.push(`${m} minute${m === 1 ? '' : 's'}`);
  parts.push(`${sec} second${sec === 1 ? '' : 's'}`);
  return parts.join(' ');
}
