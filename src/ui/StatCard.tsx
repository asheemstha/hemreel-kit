import type { ReactNode } from 'react';
import './stat-card.css';

export type StatCardTone = 'default' | 'due';
export type StatCardState = 'ready' | 'zero' | 'not-loaded';

export interface StatCardProps {
  label: ReactNode;
  /** A lucide-react icon, drawn at 14 px. */
  icon?: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  tone?: StatCardTone;
  state?: StatCardState;
}

/**
 * One number at a glance. Zero and not-loaded states keep the card shape so the row never jumps.
 * Layout: fills its grid cell or the parent's width.
 */
export function StatCard({ label, icon, value, note, tone = 'default', state = 'ready' }: StatCardProps) {
  const notLoaded = state === 'not-loaded';
  return (
    <div className="hr-stat" data-tone={tone} data-state={state}>
      <div className="hr-stat__label">
        {icon ? <span className="hr-stat__icon" aria-hidden="true">{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div className="hr-stat__value hr-tnum">{notLoaded ? 'Not loaded' : value}</div>
      {note || notLoaded ? <div className="hr-stat__note">{notLoaded ? 'Try again to load this number.' : note}</div> : null}
    </div>
  );
}
