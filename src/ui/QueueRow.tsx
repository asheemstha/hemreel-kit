import { Check, X } from 'lucide-react';
import { forwardRef, type KeyboardEvent, type ReactNode } from 'react';
import type { Clip } from '@/data/fixtures';
import { stillFor } from '@/data/stills';
import { BAND_LABEL, ScoreBadge, scoreBand } from './ScoreBadge';
import { Thumb } from './Thumb';
import './queue-row.css';

export type QueueDecision = 'kept' | 'skipped' | null;

export interface QueueRowProps {
  clip: Clip;
  /** Channel name for the meta line, for example "Tomo". */
  streamName: string;
  current?: boolean;
  decision?: QueueDecision;
  onSelect?: (clipId: string) => void;
  /** Only the current row is in the tab order (roving focus). */
  tabbable?: boolean;
}

/** One clip in the review queue. A real option in a listbox; focus it to read it, Enter or click to open it. */
export const QueueRow = forwardRef<HTMLDivElement, QueueRowProps>(function QueueRow(
  { clip, streamName, current = false, decision = null, onSelect, tabbable },
  ref,
) {
  const band = scoreBand(clip.score);
  const dim = band === 'weak' || decision === 'skipped';
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(clip.id);
    }
  };
  return (
    <div
      ref={ref}
      id={`queue-${clip.id}`}
      role="option"
      aria-selected={current}
      tabIndex={(tabbable ?? current) ? 0 : -1}
      className="hr-queue-row"
      data-current={current || undefined}
      data-band={band}
      data-decision={decision ?? undefined}
      onClick={() => onSelect?.(clip.id)}
      onKeyDown={onKeyDown}
    >
      <Thumb src={stillFor(clip.id)} width={36} selected={current} dim={dim} />
      <span className="hr-queue-row__text">
        <span className="hr-queue-row__title">{clip.title}</span>
        <span className="hr-queue-row__meta">
          <ScoreBadge score={clip.score} />
          {decision ? (
            <span className="hr-queue-row__decision" data-decision={decision}>
              {decision === 'kept' ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
              {decision === 'kept' ? 'Kept' : 'Skipped'}
            </span>
          ) : null}
          <span className="hr-tnum">{`${decision ? '' : `${BAND_LABEL[band]} · `}${streamName} · ${clip.seconds} s`}</span>
        </span>
      </span>
    </div>
  );
});

export interface QueueListProps {
  label?: string;
  children: ReactNode;
  /** Id of the current clip, used for Up and Down. */
  currentId?: string;
  /** All clip ids in display order. */
  order?: string[];
  onMove?: (clipId: string) => void;
}

/**
 * The review queue: a listbox. Up and Down move inside it; J and K are handled by the screen's hotkeys.
 * Layout: grows with its rows. Put it in a scroll container with a definite height (the review queue column) to scroll.
 */
export function QueueList({ label = 'Review queue', children, currentId, order = [], onMove }: QueueListProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onMove || !order.length) return;
    const i = currentId ? order.indexOf(currentId) : -1;
    let next: string | undefined;
    if (e.key === 'ArrowDown') next = order[Math.min(order.length - 1, i + 1)];
    else if (e.key === 'ArrowUp') next = order[Math.max(0, i - 1)];
    else if (e.key === 'Home') next = order[0];
    else if (e.key === 'End') next = order[order.length - 1];
    if (next) {
      e.preventDefault();
      onMove(next);
    }
  };
  return (
    <div className="hr-queue" role="listbox" aria-label={label} tabIndex={-1} onKeyDown={onKeyDown}>
      {children}
    </div>
  );
}
