// Reads a pasted link and says whether it is a post on a platform hemreel posts to.
// It only looks at the shape of the address: it never opens the link, so it cannot tell whether the post still exists.
import type { PostPlatform } from './fixtures';

export type LinkProblem =
  /** Nothing was typed. */
  | 'empty'
  /** The text is not a web address. */
  | 'not-a-link'
  /** A site hemreel posts to, but the address is a profile, a home page or a feed. */
  | 'not-a-post'
  /** A web address on some other site. */
  | 'other-site';

export interface PostLink {
  ok: true;
  platform: PostPlatform;
  /** The account in the link, with its "@". Null when the link has none (short links, Reels, Shorts). */
  handle: string | null;
  /** The post's id or short code. */
  id: string;
  /** The link to store: https, the platform's usual host, no tracking query. */
  url: string;
  /** A share link that redirects (vm.tiktok.com, youtu.be). It is kept as it was pasted. */
  short: boolean;
}

export interface BadLink {
  ok: false;
  reason: LinkProblem;
  /** What to tell the person, in plain words. */
  message: string;
  /** The platform, when the site was recognised but the address is not a post. */
  platform?: PostPlatform;
}

export type ParsedLink = PostLink | BadLink;

const bad = (reason: LinkProblem, message: string, platform?: PostPlatform): BadLink => ({ ok: false, reason, message, platform });
const good = (platform: PostPlatform, id: string, url: string, handle: string | null = null, short = false): PostLink => ({ ok: true, platform, handle, id, url, short });

const HANDLE = /^@[\w.-]+$/;
const DIGITS = /^\d{5,}$/;
/** Instagram short codes and TikTok share codes: letters, digits, "-" and "_". */
const CODE = /^[\w-]{5,}$/;
/** A YouTube video id is always 11 characters. */
const YOUTUBE_ID = /^[\w-]{11}$/;

/** Pulls the first thing that looks like a web address out of pasted text ("Check this out https://…"). */
function firstAddress(text: string): string | null {
  const token = text.split(/\s+/).find((t) => /^https?:\/\//i.test(t) || /^[\w-]+(\.[\w-]+)+(\/|$)/.test(t));
  return token ?? null;
}

function toUrl(text: string): URL | null {
  // a full stop or bracket that came along with the paste is not part of the address
  const address = (/\s/.test(text) ? firstAddress(text) : text)?.replace(/[).,;!]+$/, '');
  if (!address) return null;
  // another scheme (mailto:, ftp://, javascript:) is never a post link. "host:443" is a port, not a scheme.
  if (/^[a-z][a-z\d+.-]*:(?!\d)/i.test(address) && !/^https?:\/\//i.test(address)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(address) ? address : `https://${address}`);
    // a real host has a dot and a name on both sides of it
    return /^[\w-]+(\.[\w-]+)+$/.test(url.hostname) ? url : null;
  } catch {
    return null;
  }
}

function tiktok(host: string, parts: string[]): ParsedLink {
  const [a = '', b = '', c = ''] = parts;
  if (host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
    return CODE.test(a) ? good('tiktok', a, `https://${host}/${a}`, null, true) : bad('not-a-post', 'That TikTok link has no post in it. Open the post, press Share and copy the link.', 'tiktok');
  }
  // tiktok.com/t/CODE is the share link the app copies in some regions
  if (a === 't' && CODE.test(b)) return good('tiktok', b, `https://www.tiktok.com/t/${b}`, null, true);
  if (HANDLE.test(a) && b === 'video' && DIGITS.test(c)) return good('tiktok', c, `https://www.tiktok.com/${a}/video/${c}`, a);
  if (HANDLE.test(a) && !b) return bad('not-a-post', 'That is a TikTok profile, not a post. Open the post and copy its link.', 'tiktok');
  return bad('not-a-post', 'That TikTok link is not a post. A post link looks like tiktok.com/@name/video/123.', 'tiktok');
}

function instagram(parts: string[]): ParsedLink {
  // newer share links put the account first: instagram.com/name/reel/CODE
  const at = parts.findIndex((p) => p === 'reel' || p === 'reels' || p === 'p');
  const kind = parts[at];
  const code = parts[at + 1] ?? '';
  if (at >= 0 && at <= 1 && kind && CODE.test(code)) {
    const handle = at === 1 && parts[0] ? `@${parts[0]}` : null;
    return good('reels', code, `https://www.instagram.com/${kind === 'p' ? 'p' : 'reel'}/${code}/`, handle);
  }
  if (parts.length === 1 && parts[0] !== 'reels' && parts[0] !== 'explore') return bad('not-a-post', 'That is an Instagram profile, not a post. Open the reel and copy its link.', 'reels');
  return bad('not-a-post', 'That Instagram link is not a post. A reel link looks like instagram.com/reel/abc123.', 'reels');
}

function youtube(host: string, parts: string[], query: URLSearchParams): ParsedLink {
  const [a = '', b = ''] = parts;
  if (host === 'youtu.be') {
    return YOUTUBE_ID.test(a) ? good('shorts', a, `https://youtu.be/${a}`, null, true) : bad('not-a-post', 'That YouTube link has no video in it. Open the Short, press Share and copy the link.', 'shorts');
  }
  if (a === 'shorts' && YOUTUBE_ID.test(b)) return good('shorts', b, `https://www.youtube.com/shorts/${b}`);
  const v = query.get('v') ?? '';
  if (a === 'watch' && YOUTUBE_ID.test(v)) return good('shorts', v, `https://www.youtube.com/watch?v=${v}`);
  if (a.startsWith('@') || a === 'channel' || a === 'c' || a === 'user') return bad('not-a-post', 'That is a YouTube channel, not a video. Open the Short and copy its link.', 'shorts');
  return bad('not-a-post', 'That YouTube link is not a video. A Short link looks like youtube.com/shorts/abc123.', 'shorts');
}

function x(parts: string[]): ParsedLink {
  const [a = '', b = '', c = '', d = ''] = parts;
  if (b === 'status' && DIGITS.test(c) && /^\w{1,15}$/.test(a)) return good('x', c, `https://x.com/${a}/status/${c}`, a === 'i' ? null : `@${a}`);
  // x.com/i/web/status/ID: a post link without the account
  if (a === 'i' && b === 'web' && c === 'status' && DIGITS.test(d)) return good('x', d, `https://x.com/i/status/${d}`);
  if (a && !b && !['home', 'explore', 'search', 'i', 'notifications', 'messages'].includes(a)) return bad('not-a-post', 'That is an X profile, not a post. Open the post and copy its link.', 'x');
  return bad('not-a-post', 'That X link is not a post. A post link looks like x.com/name/status/123.', 'x');
}

/**
 * Reads what someone pasted as a post link.
 * Accepts TikTok, Instagram (Reels), YouTube (Shorts) and X post links, with or without "https://", "www." or "m.",
 * and returns the link without its tracking query. Anything else comes back with a reason and a sentence to show.
 */
export function parsePostLink(text: string): ParsedLink {
  const trimmed = text.trim().replace(/^[<"'“‘]+|[>"'”’]+$/g, '').trim();
  if (!trimmed) return bad('empty', 'Paste the link to the post.');
  const url = toUrl(trimmed);
  if (!url) return bad('not-a-link', 'That is not a link. Copy the post’s link from the app and paste it here.');

  const host = url.hostname.toLowerCase().replace(/^(www|m|mobile)\./, '');
  const parts = url.pathname.split('/').filter(Boolean);
  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return tiktok(host, parts);
  if (host === 'instagram.com' || host === 'instagr.am') return instagram(parts);
  if (host === 'youtube.com' || host === 'music.youtube.com' || host === 'youtu.be') return youtube(host, parts, url.searchParams);
  if (host === 'x.com' || host === 'twitter.com') return x(parts);
  return bad('other-site', 'hemreel posts to TikTok, Reels, Shorts and X. That link is from somewhere else.');
}

/** A link as people read it: no "https://" and no "www.". The stored link keeps both. */
export function readableLink(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
}

/** An example of a post link on each platform, for placeholders. */
export const LINK_EXAMPLE: Record<PostPlatform, string> = {
  tiktok: 'https://www.tiktok.com/@you/video/…',
  reels: 'https://www.instagram.com/reel/…',
  shorts: 'https://www.youtube.com/shorts/…',
  x: 'https://x.com/you/status/…',
};
