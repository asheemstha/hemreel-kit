// Posting, links and campaigns: what the money path needs on top of the brief's fixtures.
// Handles, links and campaign rules here are placeholders invented for the kit. The brief's own content stays in fixtures.ts.
import { T0 } from '@/hooks/clock';
import { DEADLINES, SUBMIT_WINDOW_MS } from './deadlines';
import { STREAMS, type Clip, type PostPlatform } from './fixtures';

const MIN = 60_000;

/** One post of a clip on one platform. */
export interface Post {
  platform: PostPlatform;
  /** Null while hemreel does not know the link: the clip was posted by hand, or the posting service has not handed it over. */
  url: string | null;
  /** When it went live, ms since epoch. The submit window runs from here. */
  postedAt: number;
  /** When the link was handed to the campaign. Null until then. */
  submittedAt: number | null;
}

/** An upload that has not turned into a post yet. A finished upload becomes a Post and leaves this list. */
export interface Upload {
  platform: PostPlatform;
  state: 'uploading' | 'failed';
  /** 0 to 100. */
  progress: number;
  /** Why it failed, in plain words. */
  error?: string;
  /** Fixture switch: this attempt ends in the given failure. Cleared when the person tries again. */
  failsWith?: string;
}

export type AccountState = 'connected' | 'expired' | 'none';
export interface Account { platform: PostPlatform; handle: string | null; state: AccountState }

/** The same four accounts as the "Posting accounts" card in Settings. */
export const ACCOUNTS: Account[] = [
  { platform: 'tiktok', handle: '[YOUR HANDLE]', state: 'connected' },
  { platform: 'reels', handle: '[YOUR HANDLE]', state: 'expired' },
  { platform: 'shorts', handle: null, state: 'none' },
  { platform: 'x', handle: null, state: 'none' },
];
/** Every account connected: for the states that show posting to several platforms at once. */
export const ACCOUNTS_ALL: Account[] = ACCOUNTS.map((a) => ({ ...a, handle: '[YOUR HANDLE]', state: 'connected' }));

export interface Campaign {
  streamId: string;
  name: string;
  /** Must be in every caption. */
  requiredTag: string;
  /** Where the campaign accepts posts. */
  platforms: PostPlatform[];
  /** Shortest clip the campaign pays for, in seconds. */
  minSeconds: number;
  /** Where the post link is handed in. Placeholder address. */
  submitUrl: string;
}

/** One campaign per stream, named like the workflows on New clips. Rules are placeholders. */
export const CAMPAIGNS: Campaign[] = [
  { streamId: 'tomo', name: 'Tomo launch night', requiredTag: '#ad', platforms: ['tiktok', 'reels', 'shorts'], minSeconds: 15, submitUrl: 'https://example.com/campaigns/tomo-launch-night/submit' },
  { streamId: 'lacy', name: 'Lacy pool', requiredTag: '#ad', platforms: ['tiktok', 'reels', 'shorts'], minSeconds: 15, submitUrl: 'https://example.com/campaigns/lacy-pool/submit' },
  { streamId: 'dom', name: 'Dom heist practice', requiredTag: '#ad', platforms: ['tiktok', 'shorts'], minSeconds: 20, submitUrl: 'https://example.com/campaigns/dom-heist-practice/submit' },
];
export const campaignOf = (streamId: string): Campaign | undefined => CAMPAIGNS.find((c) => c.streamId === streamId);

/** Longest caption and title each platform takes. Approximate: check each platform's current limits before shipping. */
export const CAPTION_LIMITS: Record<PostPlatform, { caption: number; title?: number }> = {
  tiktok: { caption: 2200 },
  reels: { caption: 2200 },
  shorts: { caption: 5000, title: 100 },
  x: { caption: 280 },
};

/** Who can see a TikTok post. The posting service takes these three. */
export const TIKTOK_VISIBILITY = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'friends', label: 'Friends' },
  { value: 'only-me', label: 'Only me' },
] as const;

/** The caption a clip starts with: the hook in capitals, the stream, then the workflow's tags. */
export function defaultCaption(clip: Pick<Clip, 'title' | 'streamId'>): string {
  const channel = STREAMS.find((s) => s.id === clip.streamId)?.channel ?? '';
  return `${clip.title.toUpperCase()}. ${channel} in GTA 6 #ad #gta6 #fyp`;
}

/** A stand-in link for a post made through hemreel. Stable for a clip and platform, so screenshots do not change. */
export function placeholderPostUrl(platform: PostPlatform, clipId: string): string {
  // built from text: a 19 digit id is too large for a JS number
  const id = `74361200455182${String(30021 + (Number(clipId.replace(/\D/g, '')) || 0) * 137).padStart(5, '0')}`;
  switch (platform) {
    case 'tiktok': return `https://www.tiktok.com/@yourhandle/video/${id}`;
    case 'reels': return `https://www.instagram.com/reel/C${id.slice(-10)}/`;
    case 'shorts': return `https://www.youtube.com/shorts/h${id.slice(-10)}`;
    case 'x': return `https://x.com/yourhandle/status/${id}`;
  }
}

/**
 * Posts that exist when the app opens.
 * c11 was posted from the phone 17 min ago, so hemreel has no link yet: its job on Home is "Paste post link".
 * c12 went out through hemreel 41 min ago and was never submitted: its window closed 11 min ago.
 * c13 and c14 were submitted in time.
 */
export const SEED_POSTS: Record<string, Post[]> = {
  c11: [{ platform: 'tiktok', url: null, postedAt: DEADLINES.submit - SUBMIT_WINDOW_MS, submittedAt: null }],
  c12: [{ platform: 'tiktok', url: placeholderPostUrl('tiktok', 'c12'), postedAt: T0 - 41 * MIN, submittedAt: null }],
  c13: [{ platform: 'tiktok', url: placeholderPostUrl('tiktok', 'c13'), postedAt: T0 - 95 * MIN, submittedAt: T0 - 83 * MIN }],
  c14: [{ platform: 'tiktok', url: placeholderPostUrl('tiktok', 'c14'), postedAt: T0 - 150 * MIN, submittedAt: T0 - 131 * MIN }],
};
