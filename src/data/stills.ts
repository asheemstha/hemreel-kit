// Neutral stand-in footage. No real people, no logos, nothing from a specific game. Three of them (1, 3, 5) carry burned-in text,
// because burned-in captions are part of real footage and the gallery stills are the only place the kit shows them.
import s1 from '@/assets/stills/still-1.svg';
import s2 from '@/assets/stills/still-2.svg';
import s3 from '@/assets/stills/still-3.svg';
import s4 from '@/assets/stills/still-4.svg';
import s5 from '@/assets/stills/still-5.svg';
import s6 from '@/assets/stills/still-6.svg';
import s7 from '@/assets/stills/still-7.svg';
import source from '@/assets/stills/source-16x9.svg';

export const STILLS = [s1, s2, s3, s4, s5, s6, s7] as const;
export const SOURCE_FRAME = source;

// Stills 1, 3 and 5 carry the burned-in hooks of clips c1, c2 and c3. Every other clip gets a plain still.
const BY_CLIP: Record<string, string> = { c1: s1, c2: s3, c3: s5 };
const PLAIN = [s2, s4, s6, s7] as const;

/** A stable still for a clip id, so the same clip always shows the same picture. */
export function stillFor(clipId: string): string {
  const fixed = BY_CLIP[clipId];
  if (fixed) return fixed;
  const n = Number(clipId.replace(/\D/g, '')) || 0;
  return PLAIN[n % PLAIN.length] ?? s2;
}
