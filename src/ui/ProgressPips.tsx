import './progress-pips.css';

export type PipState = 'todo' | 'kept' | 'skipped';

export interface ProgressPipsProps {
  states: PipState[];
  /** Index of the clip on screen, or -1 when every clip is decided. */
  current: number;
}

/**
 * One pill per clip in the session, with "Clip 1 of 8" beside it.
 * Layout: hugs its pips and text.
 */
export function ProgressPips({ states, current }: ProgressPipsProps) {
  const decided = states.filter((s) => s !== 'todo').length;
  const total = states.length;
  const text = current >= 0 ? `Clip ${current + 1} of ${total}` : `All ${total} decided`;
  return (
    <div className="hr-pips">
      <div className="hr-pips__track" role="progressbar" aria-label="Review progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={decided}
        aria-valuetext={`${decided} of ${total} decided`}>
        {states.map((s, i) => (
          <span key={i} className="hr-pips__pip" data-state={i === current ? 'current' : s} />
        ))}
      </div>
      <span className="hr-pips__text hr-tnum">{text}</span>
    </div>
  );
}
