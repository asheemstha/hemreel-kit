import { Clock } from 'lucide-react';
import { Link } from 'react-router';
import { useCountdown } from '@/hooks/useCountdown';
import './due-chip.css';

export interface DueChipProps {
  /** How many post links are waiting to be submitted. */
  links: number;
  /** Deadline of the most urgent one, ms since epoch. */
  deadline: number;
}

const plural = (n: number) => `${n} ${n === 1 ? 'link' : 'links'}`;

/**
 * The submit countdown that sits at the far right of every top bar and links to Home.
 * Hidden when nothing is due. Under five minutes it is announced politely, once per minute.
 * Layout: hugs its text. Sits at the right end of TopBar.
 */
export function DueChip({ links, deadline }: DueChipProps) {
  const { text, minutes, expired, urgent } = useCountdown(deadline);
  const announce = urgent && !expired && links > 0;
  const message = announce ? `${plural(links)} due in ${minutes < 1 ? 'under a minute' : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`}` : '';
  // The message only changes when the whole minute changes, so the live region speaks at most once a minute.

  if (links <= 0 || expired) return null;
  return (
    <>
      <Link to="/home" className="hr-due" data-urgent={urgent || undefined}>
        <Clock aria-hidden="true" />
        <span>{plural(links)} due</span>
        <span className="hr-due__time hr-tnum">{text}</span>
      </Link>
      <span className="hr-sr-only" aria-live="polite">{message}</span>
    </>
  );
}
