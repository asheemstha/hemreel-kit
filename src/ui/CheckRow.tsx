import { CircleCheck, CircleX, LoaderCircle, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Chip } from './Chip';
import { Spinner } from './Spinner';
import './check-row.css';

export type CheckStatus = 'ok' | 'warning' | 'failed' | 'running';

const STATUS: Record<CheckStatus, { tone: 'ok' | 'due' | 'fail' | 'neutral'; icon: ReactNode; chipIcon: ReactNode; label: string }> = {
  ok: { tone: 'ok', icon: <CircleCheck />, chipIcon: <CircleCheck />, label: 'Passed' },
  warning: { tone: 'due', icon: <TriangleAlert />, chipIcon: <TriangleAlert />, label: 'Check' },
  failed: { tone: 'fail', icon: <CircleX />, chipIcon: <CircleX />, label: 'Failed' },
  running: { tone: 'neutral', icon: null, chipIcon: <LoaderCircle />, label: 'Running' },
};

export interface CheckRowProps {
  name: ReactNode;
  value?: ReactNode;
  status: CheckStatus;
  statusLabel?: string;
}

/** A 46 px system-check row: status icon, name, value, chip. The chip carries the word, so the icon is decorative. */
export function CheckRow({ name, value, status, statusLabel }: CheckRowProps) {
  const s = STATUS[status];
  return (
    <div className="hr-check-row" data-status={status}>
      <span className="hr-check-row__icon" aria-hidden="true">{status === 'running' ? <Spinner size={16} /> : s.icon}</span>
      <span className="hr-check-row__name">{name}</span>
      {value ? <span className="hr-check-row__value hr-tnum">{value}</span> : null}
      <Chip tone={s.tone} icon={s.chipIcon}>{statusLabel ?? s.label}</Chip>
    </div>
  );
}
