import type { ReactNode } from 'react';
import './step-list.css';

export interface Step {
  title: ReactNode;
  note?: ReactNode;
}

/** Numbered "What will happen" list. The list itself is an <ol>; the drawn numbers are decorative. */
export function StepList({ steps, label }: { steps: Step[]; label?: string }) {
  return (
    <ol className="hr-steps" aria-label={label}>
      {steps.map((s, i) => (
        <li key={i} className="hr-steps__item">
          <span className="hr-steps__num hr-tnum" aria-hidden="true">{i + 1}</span>
          <span className="hr-steps__text">
            <span className="hr-steps__title">{s.title}</span>
            {s.note ? <span className="hr-steps__note">{s.note}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
