// The rules of posting, kept apart from the dialog so they can be tested on their own:
// where each clip may go, what its caption is on each platform, and what still stops it from being posted.
import type { PostPlatform } from '@/data/fixtures';
import { CAPTION_LIMITS, type Account, type Campaign } from '@/data/posts';
import { listOf, platformName } from '@/data/words';

/** What the person has written for one clip. */
export interface PostDraft {
  /** One caption on every platform. */
  same: boolean;
  /** The shared caption, and the starting point of each platform's own. */
  text: string;
  /** Captions written for one platform, used when `same` is off. */
  per: Partial<Record<PostPlatform, string>>;
  /** The YouTube title. Only used when the clip goes to Shorts. */
  title: string;
}

/** The parts of a clip record the rules read. */
export interface PostClip {
  id: string;
  title: string;
  seconds: number;
  posts: Array<{ platform: PostPlatform }>;
  uploads: Array<{ platform: PostPlatform; state: 'uploading' | 'failed' }>;
}

export type PostProblemKind = 'short' | 'tag' | 'limit' | 'title';
export interface PostProblem {
  kind: PostProblemKind;
  /** The platform whose caption is at fault. Left out for problems that belong to the whole clip. */
  platform?: PostPlatform;
  message: string;
}

const count = (n: number) => n.toLocaleString('en-US');
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** True when the caption carries the tag as a word of its own: "#ad" matches, "#adventure" does not. */
export function hasTag(text: string, tag: string): boolean {
  return new RegExp(`(^|\\s)${escapeRe(tag)}(?![\\w-])`, 'i').test(text);
}

/** The caption with the tag added at the end, or unchanged when it is already there. */
export function withTag(text: string, tag: string): string {
  if (hasTag(text, tag)) return text;
  const trimmed = text.trimEnd();
  return trimmed ? `${trimmed} ${tag}` : tag;
}

/** The caption a clip gets on one platform. */
export function captionOf(draft: PostDraft, platform: PostPlatform): string {
  return draft.same ? draft.text : (draft.per[platform] ?? draft.text);
}

/** The accounts a clip can be posted from right now. */
export function connectedPlatforms(accounts: Account[]): PostPlatform[] {
  return accounts.filter((a) => a.state === 'connected').map((a) => a.platform);
}

export interface PostTargets {
  /** Where this clip will be posted. */
  targets: PostPlatform[];
  /** Ticked, but the clip's campaign does not take posts there. */
  refused: PostPlatform[];
  /** Ticked, but the clip is already there or on its way. */
  already: PostPlatform[];
}

/** Sorts the ticked platforms for one clip. A clip is skipped on a platform its campaign refuses; it is never blocked by it. */
export function targetsOf(clip: PostClip, ticked: PostPlatform[], campaign: Campaign | undefined): PostTargets {
  const out: PostTargets = { targets: [], refused: [], already: [] };
  for (const p of ticked) {
    if (clip.posts.some((x) => x.platform === p) || clip.uploads.some((u) => u.platform === p && u.state === 'uploading')) out.already.push(p);
    else if (campaign && !campaign.platforms.includes(p)) out.refused.push(p);
    else out.targets.push(p);
  }
  return out;
}

/** The smallest caption limit among the platforms, for a caption they all share. Null when there is no platform. */
export function sharedLimit(platforms: PostPlatform[]): number | null {
  return platforms.length ? Math.min(...platforms.map((p) => CAPTION_LIMITS[p].caption)) : null;
}

/** Everything that stops one clip from being posted to its targets, in the order the dialog shows it. Empty means ready. */
export function problemsOf(clip: PostClip, draft: PostDraft, targets: PostPlatform[], campaign: Campaign | undefined): PostProblem[] {
  const problems: PostProblem[] = [];
  if (!targets.length) return problems;
  if (campaign && clip.seconds < campaign.minSeconds) {
    problems.push({ kind: 'short', message: `This clip is ${clip.seconds} s. ${campaign.name} pays for clips of ${campaign.minSeconds} s or longer.` });
  }
  const tag = campaign?.requiredTag;
  if (draft.same) {
    if (tag && !hasTag(draft.text, tag)) problems.push({ kind: 'tag', message: `Add ${tag} before posting. ${campaign?.name ?? 'The campaign'} requires it.` });
    const over = targets.filter((p) => draft.text.length > CAPTION_LIMITS[p].caption);
    if (over.length) {
      const limit = sharedLimit(over) ?? 0;
      const all = over.length === targets.length;
      problems.push({
        kind: 'limit',
        platform: over[0],
        message: `${count(draft.text.length - limit)} characters over the limit of ${count(limit)}${all ? '' : ` on ${listOf(over.map((p) => platformName(p)))}`}. Shorten it${all ? '' : ', or give that platform its own caption'}.`,
      });
    }
  } else {
    for (const p of targets) {
      const text = captionOf(draft, p);
      const name = platformName(p);
      if (tag && !hasTag(text, tag)) problems.push({ kind: 'tag', platform: p, message: `The ${name} caption needs ${tag}.` });
      const limit = CAPTION_LIMITS[p].caption;
      if (text.length > limit) problems.push({ kind: 'limit', platform: p, message: `The ${name} caption is ${count(text.length - limit)} characters over its limit of ${count(limit)}.` });
    }
  }
  if (targets.includes('shorts')) {
    const limit = CAPTION_LIMITS.shorts.title ?? 100;
    const title = draft.title.trim();
    if (!title) problems.push({ kind: 'title', message: 'YouTube needs a title.' });
    else if (title.length > limit) problems.push({ kind: 'title', message: `${count(title.length - limit)} characters over the limit of ${count(limit)}.` });
  }
  return problems;
}

/** "64 of 2,200 characters", or "64 characters" when no limit applies. */
export function countLine(length: number, limit: number | null): string {
  return limit === null ? `${count(length)} characters` : `${count(length)} of ${count(limit)} characters`;
}
