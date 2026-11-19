import { X } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import './chip.css';

export type ChipTone = 'neutral' | 'ink' | 'ok' | 'due' | 'fail' | 'accent';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone;
  /** A lucide-react icon. Status chips (ok, due, fail) should always carry one, since colour alone never means status. */
  icon?: ReactNode;
  /** Adds a small remove button after the text (hashtags, filters). */
  onRemove?: () => void;
  /** Name of the remove button, for example "Remove #gta6". Defaults to "Remove" plus the chip text when that is a plain string. */
  removeLabel?: string;
}

/** Layout: hugs its text. */
export function Chip({ tone = 'neutral', icon, onRemove, removeLabel, children, className, ...rest }: ChipProps) {
  return (
    <span className={['hr-chip', 'hr-tnum', className].filter(Boolean).join(' ')} data-tone={tone} data-icon={icon ? '' : undefined} data-removable={onRemove ? '' : undefined} {...rest}>
      {icon ? <span className="hr-chip__icon" aria-hidden="true">{icon}</span> : null}
      {children}
      {onRemove ? (
        <button type="button" className="hr-chip__remove" aria-label={removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove')} onClick={onRemove}>
          <X aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}
