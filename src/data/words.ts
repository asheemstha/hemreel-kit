// Small wording helpers shared by the screens and flows, so counts and lists read the same everywhere.
import { POST_PLATFORMS, type PostPlatform } from './fixtures';

/** "1 clip", "2 clips". Pass `many` when adding "s" is wrong. */
export const plural = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`;

/** "TikTok", "TikTok and Reels", "TikTok, Reels and Shorts". No Oxford comma. */
export function listOf(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** "TikTok", "Reels", "Shorts", "X". Pass `long` for "Instagram Reels" and "YouTube Shorts". */
export function platformName(platform: PostPlatform, long = false): string {
  const p = POST_PLATFORMS.find((x) => x.value === platform);
  return p ? (long ? p.label : p.short) : platform;
}
