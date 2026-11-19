import { Trash2, X } from 'lucide-react';
import type { ButtonHTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import './bulk-bar.css';

export interface BulkBarProps {
  /** How many things are selected. The bar is not rendered at zero. */
  count: number;
  /** Singular noun: "clip", "project", "moment". */
  noun?: string;
  /** Plural, when adding "s" is wrong. */
  nounPlural?: string;
  onClear: () => void;
  /** The actions, as BulkAction buttons. */
  children: ReactNode;
  /** Render in the flow instead of fixed at the bottom centre. Used by the gallery. */
  inline?: boolean;
  /** Accessible name of the toolbar. */
  label?: string;
}

/**
 * Appears when one or more things are selected: how many, what can be done to all of them, and a way out.
 * Left and Right move between its buttons; Esc clears the selection while focus is inside.
 * Layout: fixed to the bottom centre of the window, just under where a Toast sits in the stack. Hugs its content. Use `inline` to place it in normal flow.
 */
export function BulkBar({ count, noun = 'clip', nounPlural, onClear, children, inline = false, label = 'Bulk actions' }: BulkBarProps) {
  if (count <= 0) return null;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClear();
      return;
    }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
    const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    e.preventDefault();
    e.stopPropagation();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : Math.min(buttons.length - 1, Math.max(0, at + (e.key === 'ArrowRight' ? 1 : -1)));
    buttons[next]?.focus();
  };
  return (
    <div className="hr-bulk" role="toolbar" aria-label={label} tabIndex={-1} data-inline={inline || undefined} onKeyDown={onKeyDown}>
      <span className="hr-bulk__count hr-tnum" role="status">{`${count} ${count === 1 ? noun : nounPlural ?? `${noun}s`} selected`}</span>
      <span className="hr-bulk__actions">{children}</span>
      <button type="button" className="hr-bulk__clear" aria-label="Clear selection" aria-keyshortcuts="Escape" onClick={onClear}>
        <X aria-hidden="true" />
      </button>
    </div>
  );
}

export interface BulkActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** A 16 px lucide-react icon. */
  icon?: ReactNode;
  /** A destructive action. It gets a bin icon and must keep a word such as "Delete": status colour is not used on the ink bar. */
  danger?: boolean;
}

/**
 * A button for the ink surface of BulkBar: icon and a word.
 * Layout: hugs its label.
 */
export function BulkAction({ icon, danger, children, className, type = 'button', ...rest }: BulkActionProps) {
  const shown = icon ?? (danger ? <Trash2 /> : null);
  return (
    <button type={type} className={['hr-bulk__action', className].filter(Boolean).join(' ')} data-danger={danger || undefined} {...rest}>
      {shown ? <span className="hr-bulk__icon" aria-hidden="true">{shown}</span> : null}
      <span>{children}</span>
    </button>
  );
}
