import type { ReactNode } from 'react';
import './kbd.css';

export type KbdTone = 'light' | 'accent' | 'ink' | 'stage';

/** A keycap hint. Quiet by design. Inside a button it is hidden from screen readers; the button carries aria-keyshortcuts. */
/**
 * `hint` keycaps are secondary: hidden unless the user turns on all keycaps (data-keycaps="all" on <html>). Shortcuts stay in tooltips and the ? sheet.
 * Layout: hugs its text.
 */
export function Kbd({ children, tone = 'light', decorative = false, hint = false }: { children: ReactNode; tone?: KbdTone; decorative?: boolean; hint?: boolean }) {
  return (
    <kbd className="hr-kbd" data-tone={tone} data-hint={hint || undefined} aria-hidden={decorative || undefined}>
      {children}
    </kbd>
  );
}
