import type { ReactNode } from 'react';
import './empty-state.css';

export interface EmptyHint { icon?: ReactNode; text: ReactNode }

export interface EmptyStateProps {
  /** A lucide-react icon, drawn at 26 px in a 56 px rounded square. */
  icon: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  /** One primary and one secondary action. */
  primary?: ReactNode;
  secondary?: ReactNode;
  /** A row of three small hints. */
  hints?: EmptyHint[];
  /** Heading level for document order. */
  level?: 2 | 3;
}

/** Centred empty state: what is missing and the one thing to do next. */
export function EmptyState({ icon, title, children, primary, secondary, hints, level = 2 }: EmptyStateProps) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <div className="hr-empty">
      <span className="hr-empty__icon" aria-hidden="true">{icon}</span>
      <H className="hr-empty__title">{title}</H>
      {children ? <p className="hr-empty__body">{children}</p> : null}
      {primary || secondary ? <div className="hr-empty__actions">{primary}{secondary}</div> : null}
      {hints?.length ? (
        <ul className="hr-empty__hints">
          {hints.map((h, i) => (
            <li key={i} className="hr-empty__hint">
              {h.icon ? <span className="hr-empty__hint-icon" aria-hidden="true">{h.icon}</span> : null}
              <span>{h.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
