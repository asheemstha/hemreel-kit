import { Clock } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { SUBMIT_WINDOW_MS } from '@/data/deadlines';
import { useCountdown } from '@/hooks/useCountdown';
import { Meter } from './Meter';
import './countdown.css';

export interface CountdownProps {
  /** Deadline as ms since epoch. */
  deadline: number;
  /** Length of the whole window. Defaults to the 30 min submit window. */
  windowMs?: number;
  /** Called once when the time reaches zero. */
  onExpire?: () => void;
}

/**
 * The submit-window clock. Ticks every second. Under five minutes the spoken text updates once a minute.
 * Layout: fixed 168 px column so the meter has a stable length.
 */
export function Countdown({ deadline, windowMs = SUBMIT_WINDOW_MS, onExpire }: CountdownProps) {
  const { msLeft, text, expired, urgent } = useCountdown(deadline);
  const fired = useRef(false);
  useEffect(() => {
    if (expired && !fired.current) {
      fired.current = true;
      onExpire?.();
    }
    if (!expired) fired.current = false;
  }, [expired, onExpire]);

  const windowMin = Math.round(windowMs / 60000);
  const spoken = expired ? 'Submit window closed' : `${Math.max(1, Math.ceil(msLeft / 60000))} minutes left to submit the link`;
  return (
    <div className="hr-countdown" data-urgent={urgent || undefined} data-expired={expired || undefined}>
      <div className="hr-countdown__time">
        <Clock aria-hidden="true" className="hr-countdown__icon" />
        <span className="hr-tnum" aria-hidden="true">{text}</span>
        {/* minute-resolution text so screen readers are not flooded every second */}
        <span className="hr-sr-only" aria-live={urgent ? 'polite' : 'off'}>{spoken}</span>
      </div>
      <Meter value={msLeft} max={windowMs} variant="due" height={5} label="Submit window" valueText={spoken} />
      <div className="hr-countdown__caption">{expired ? `The ${windowMin} min window has closed` : `left of the ${windowMin} min window`}</div>
    </div>
  );
}
