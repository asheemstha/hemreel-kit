import { Check, LogIn, Unplug } from 'lucide-react';
import type { ReactNode } from 'react';
import { Chip } from './Chip';
import './settings-row.css';

export type SettingsStatus = 'connected' | 'needs-sign-in' | 'disconnected';

const STATUS: Record<SettingsStatus, { tone: 'ok' | 'due' | 'neutral'; icon: ReactNode; label: string }> = {
  connected: { tone: 'ok', icon: <Check />, label: 'Connected' },
  'needs-sign-in': { tone: 'due', icon: <LogIn />, label: 'Needs sign-in' },
  disconnected: { tone: 'neutral', icon: <Unplug />, label: 'Not connected' },
};

export interface SettingsRowProps {
  title: ReactNode;
  note?: ReactNode;
  status?: SettingsStatus;
  /** Overrides the chip's word. */
  statusLabel?: string;
  action?: ReactNode;
}

/** A 60 px row inside a Card: title, note, status chip, action. */
export function SettingsRow({ title, note, status, statusLabel, action }: SettingsRowProps) {
  const s = status ? STATUS[status] : null;
  return (
    <div className="hr-settings-row">
      <div className="hr-settings-row__text">
        <span className="hr-settings-row__title">{title}</span>
        {note ? <span className="hr-settings-row__note">{note}</span> : null}
      </div>
      {s ? <Chip tone={s.tone} icon={s.icon}>{statusLabel ?? s.label}</Chip> : null}
      {action ? <div className="hr-settings-row__action">{action}</div> : null}
    </div>
  );
}
