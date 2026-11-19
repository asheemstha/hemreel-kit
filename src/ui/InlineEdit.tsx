import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import './inline-edit.css';

export type InlineEditSize = 'title' | 'heading' | 'body';

export interface InlineEditProps {
  value: string;
  /** Called with the trimmed text when it changed. Never called with an empty string. */
  onSave: (next: string) => void;
  /** What is being named, for assistive tech: "Project name". */
  label: string;
  size?: InlineEditSize;
  maxLength?: number;
  /** Shown while the value is empty. */
  placeholder?: string;
  disabled?: boolean;
  /** Gallery only: start in the editing state, without taking focus. */
  defaultEditing?: boolean;
}

/**
 * Rename in place: a project, a workflow, a moment. Click, Enter or F2 starts editing; Enter or leaving the field saves; Esc cancels. An empty name is not saved.
 * The field has the same type style and box as the text, and grows with what is typed, so nothing around it moves.
 * Layout: hugs its text and never grows wider than the parent; long names wrap.
 */
export function InlineEdit({ value, onSave, label, size = 'body', maxLength, placeholder, disabled, defaultEditing = false }: InlineEditProps) {
  const [editing, setEditing] = useState(defaultEditing);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // 'focus' when the next render should move focus: into the field on start, back to the text after Enter or Esc.
  const pending = useRef<'input' | 'button' | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    if (pending.current === 'input') {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (pending.current === 'button') buttonRef.current?.focus();
    pending.current = null;
  }, [editing]);

  const start = () => {
    if (disabled) return;
    finished.current = false;
    setDraft(value);
    pending.current = 'input';
    setEditing(true);
  };
  const finish = (save: boolean, refocus: boolean) => {
    if (finished.current) return;
    finished.current = true;
    const next = draft.trim();
    if (save && next !== '' && next !== value) onSave(next);
    pending.current = refocus ? 'button' : null;
    setEditing(false);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finish(true, true);
    } else if (e.key === 'Escape') {
      // Esc belongs to this field: the page's Esc handler would blur it, and blur saves.
      e.preventDefault();
      e.stopPropagation();
      finish(false, true);
    }
  };

  return (
    <span className="hr-inline-edit" data-size={size} data-editing={editing || undefined}>
      {editing ? (
        <span className="hr-inline-edit__box">
          {/* an invisible copy of the text sizes the box, so the field is exactly as big as what is typed */}
          <span className="hr-inline-edit__sizer" aria-hidden="true">{`${draft || placeholder || ''} `}</span>
          <textarea
            ref={inputRef}
            className="hr-inline-edit__input"
            rows={1}
            aria-label={label}
            value={draft}
            maxLength={maxLength}
            placeholder={placeholder}
            spellCheck={false}
            onChange={(e) => setDraft(e.target.value.replace(/\n/g, ' '))}
            onKeyDown={onKeyDown}
            onBlur={() => finish(true, false)}
          />
        </span>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          className="hr-inline-edit__display"
          disabled={disabled}
          aria-keyshortcuts="F2"
          onClick={start}
          onKeyDown={(e) => {
            if (e.key === 'F2') {
              e.preventDefault();
              start();
            }
          }}
        >
          <span className="hr-inline-edit__text" data-empty={value ? undefined : ''}>{value || placeholder}</span>
          <Pencil className="hr-inline-edit__pencil" aria-hidden="true" />
          <span className="hr-sr-only">{`, edit ${label}`}</span>
        </button>
      )}
    </span>
  );
}
