// Real content from the design. Do not replace with lorem ipsum. Items marked placeholder were invented for the mockups.

export type Platform = 'tiktok' | 'reels' | 'shorts';
/** Everywhere a clip can be posted. X has no safe zone overlay, so it is a posting platform but not a `Platform`. */
export type PostPlatform = Platform | 'x';
export const POST_PLATFORMS: Array<{ value: PostPlatform; label: string; short: string }> = [
  { value: 'tiktok', label: 'TikTok', short: 'TikTok' },
  { value: 'reels', label: 'Instagram Reels', short: 'Reels' },
  { value: 'shorts', label: 'YouTube Shorts', short: 'Shorts' },
  { value: 'x', label: 'X', short: 'X' },
];
export type ClipStage = 'review' | 'kept' | 'posted' | 'past-window' | 'submitted';

export type Pay =
  | { kind: 'per-view'; per1k: number; min: number; max: number }
  | { kind: 'pool'; pool: number };

export interface Stream { id: string; channel: string; title: string; pay: Pay; live: boolean }
export interface Clip { id: string; streamId: string; title: string; score: number; seconds: number; stage: ClipStage; placeholder?: boolean }

export const STREAMS: Stream[] = [
  { id: 'tomo', channel: 'Tomo', title: 'GTA VI launch night', pay: { kind: 'per-view', per1k: 1.5, min: 3.5, max: 150 }, live: false },
  { id: 'lacy', channel: 'Lacy', title: 'Live 19:40', pay: { kind: 'pool', pool: 12500 }, live: true },
  { id: 'dom', channel: 'Dom', title: 'Heist practice', pay: { kind: 'per-view', per1k: 1, min: 10, max: 100 }, live: false },
];

/** Channels being watched. Clix and Lacy are live right now. */
export const WATCHED = [
  { channel: 'Clix', live: true, note: 'Watching', nextCheck: '0:40', workflow: null },
  { channel: 'Lacy', live: true, note: 'Rendering clips', renderPct: 41, workflow: 'Lacy pool' },
  { channel: 'Tomo', live: false, note: 'Offline', workflow: 'Tomo launch night' },
  { channel: 'Dom', live: false, note: 'Not watching', workflow: 'Dom heist practice' },
] as const;

export const CLIPS: Clip[] = [
  { id: 'c1', streamId: 'tomo', title: 'He did not see that coming', score: 91, seconds: 24, stage: 'review' },
  { id: 'c2', streamId: 'tomo', title: 'The cops gave up', score: 84, seconds: 26, stage: 'review' },
  { id: 'c3', streamId: 'tomo', title: 'Chat called it', score: 72, seconds: 23, stage: 'review' },
  { id: 'c4', streamId: 'tomo', title: 'Wait for it', score: 66, seconds: 25, stage: 'review' },
  { id: 'c5', streamId: 'dom', title: 'Bro panicked', score: 63, seconds: 22, stage: 'review' },
  { id: 'c6', streamId: 'dom', title: 'No way', score: 58, seconds: 24, stage: 'review' },
  { id: 'c7', streamId: 'tomo', title: 'Talking about the map size', score: 47, seconds: 26, stage: 'review' },
  { id: 'c8', streamId: 'tomo', title: 'Slow drive across the bay', score: 22, seconds: 25, stage: 'review' },
  { id: 'c9', streamId: 'tomo', title: 'Missed the jump', score: 78, seconds: 25, stage: 'kept', placeholder: true },
  { id: 'c10', streamId: 'dom', title: 'Wrong boat', score: 69, seconds: 22, stage: 'kept', placeholder: true },
  { id: 'c11', streamId: 'tomo', title: 'Ran out of road', score: 81, seconds: 24, stage: 'posted', placeholder: true },
  { id: 'c12', streamId: 'dom', title: 'The long way round', score: 70, seconds: 23, stage: 'past-window', placeholder: true },
  { id: 'c13', streamId: 'tomo', title: 'Clean landing', score: 88, seconds: 25, stage: 'submitted', placeholder: true },
  { id: 'c14', streamId: 'tomo', title: 'Chat picked the car', score: 76, seconds: 23, stage: 'submitted', placeholder: true },
];

/** The clip shown in Clip review. */
export const FEATURED = {
  clipId: 'c1',
  reason: 'Chat jumps 6× in four seconds and his face reacts inside the first 3 s.',
  signals: { chat: '6×', reactionAt: '1.2 s', peakAt: '1:27:16', captionWordsFixed: 2 },
  hook: 'He did not see that coming',
  caption: 'HE DID NOT SEE THAT COMING. Tomo in GTA 6 #ad #gta6 #tomo #fyp',
  start: '1:27:09.2', end: '1:27:33.4', length: '24.2 s',
  scoreNote: 'AI guess, not a promise of views.',
};

export const HOME_COUNTS = { toReview: 8, strong: 4, maybe: 3, weak: 1, kept: 2, postedDue: 1, minutesLeft: 13, pastWindow: 1, submitted: 2, renderingPct: 41, submitWindowMin: 30 };

/** Estimate shown only where the campaign pays per view. Pool campaigns return null. */
export function estimateAt10k(pay: Pay): number | null {
  if (pay.kind === 'pool') return null;
  return Math.min(pay.max, Math.max(pay.min, pay.per1k * 10));
}

export function formatEstimate(pay: Pay): string | null {
  const v = estimateAt10k(pay);
  return v === null ? null : `≈ $${Number.isInteger(v) ? v : v.toFixed(2)} at 10K views`;
}

/** Safe zone overlays, as percentages of the 9:16 frame. Approximate: verify against each platform's current guidance before shipping. */
export const SAFE_ZONES: Record<Platform, { top: number; bottom: number; railWidth: number; railTop: number; topLabel: string; bottomLabel: string }> = {
  tiktok: { top: 10, bottom: 21, railWidth: 14, railTop: 40, topLabel: 'TikTok · top tabs', bottomLabel: 'Name, caption, sound' },
  reels: { top: 12, bottom: 26, railWidth: 13, railTop: 46, topLabel: 'Reels · top bar', bottomLabel: 'Name, caption, audio' },
  shorts: { top: 9, bottom: 24, railWidth: 15, railTop: 42, topLabel: 'Shorts · top bar', bottomLabel: 'Channel, title, subscribe' },
};
