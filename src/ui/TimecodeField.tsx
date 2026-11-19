import { forwardRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Field, type FieldSize } from './Field';
import { formatTimecode } from './TrimRow';
import './timecode-field.css';

/** Reads a typed time: "1:27:09.2" (h:mm:ss), "87:09" (m:ss) or "5229.2" (seconds). Returns null when the text is not a time. */
export function readTimecode(text: string): number | null {
  const t = text.trim();
  if (!/^\d+(:\d{1,2}){0,2}(\.\d+)?$/.test(t)) return null;
  const parts = t.split(':').map(Number);
  // after a colon, seconds and minutes stay under 60; the first part may be any size ("87:09" is 87 minutes)
  if (parts.slice(1).some((p) => p >= 60)) return null;
  return Math.round(parts.reduce((acc, p) => acc * 60 + p, 0) * 10) / 10;
}

export interface TimecodeFieldProps {
  label: ReactNode;
  id?: string;
  /** Seconds into the source. */
  value: number;
  onChange: (seconds: number) => void;
  /** Earliest and latest time allowed, in seconds. A typed time outside them moves to the limit and the help line says so. */
  min?: number;
  max?: number;
  help?: ReactNode;
  /** Keycap hint, for example "I". */
  shortcut?: string;
  disabled?: boolean;
  size?: FieldSize;
  hideLabel?: boolean;
  /** Fill the parent's width. The input is 132 px wide otherwise. */
  block?: boolean;
  /** Gallery only: start with this text typed in and checked, to show the error. */
  initialText?: string;
}

const tenth = (v: number) => Math.round(v * 10) / 10;

/**
 * A time you type: scan from, scan until, an exact trim point. Accepts h:mm:ss, m:ss or plain seconds.
 * Enter or leaving the field commits. Up and Down change it by 1 s, with Shift by 10 s, with Alt by 0.1 s. Esc puts the old time back.
 * Layout: the input is 132 px wide (pass `block` to fill); the label, help and error take the parent's width.
 */
export const TimecodeField = forwardRef<HTMLInputElement, TimecodeFieldProps>(function TimecodeField(
  { label, id, value, onChange, min = 0, max = Number.POSITIVE_INFINITY, help, shortcut, disabled, size, hideLabel, block, initialText },
  ref,
) {
  // `draft` is the text being typed; null means the field shows the committed value.
  const [draft, setDraft] = useState<string | null>(initialText ?? null);
  const [problem, setProblem] = useState<'bad' | 'early' | 'late' | null>(initialText !== undefined && readTimecode(initialText) === null ? 'bad' : null);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const commit = () => {
    if (draft === null) return;
    if (draft.trim() === '') {
      setDraft(null);
      setProblem(null);
      return;
    }
    const typed = readTimecode(draft);
    if (typed === null) {
      setProblem('bad');
      return;
    }
    const next = clamp(typed);
    setDraft(null);
    setProblem(next > typed ? 'early' : next < typed ? 'late' : null);
    if (next !== value) onChange(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit();
      return;
    }
    if (e.key === 'Escape' && draft !== null) {
      // the first Esc puts the old time back; the page's own Esc handling only sees the next one
      e.preventDefault();
      e.stopPropagation();
      setDraft(null);
      setProblem(null);
      return;
    }
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    e.stopPropagation();
    const from = draft === null ? value : readTimecode(draft);
    if (from === null) return;
    const by = e.altKey ? 0.1 : e.shiftKey ? 10 : 1;
    const next = clamp(tenth(from + (e.key === 'ArrowUp' ? by : -by)));
    setDraft(null);
    setProblem(null);
    if (next !== value) onChange(next);
  };

  const note =
    problem === 'early' ? `Moved to the earliest time allowed, ${formatTimecode(min)}.` : problem === 'late' ? `Moved to the latest time allowed, ${formatTimecode(max)}.` : help;
  return (
    <div className="hr-timecode" data-block={block || undefined}>
      <Field
        ref={ref}
        id={id}
        label={label}
        hideLabel={hideLabel}
        size={size}
        shortcut={shortcut}
        disabled={disabled}
        value={draft ?? formatTimecode(value)}
        onChange={(e) => {
          setDraft(e.target.value);
          setProblem(null);
        }}
        onBlur={commit}
        onKeyDown={onKeyDown}
        help={note}
        error={problem === 'bad' ? 'Use h:mm:ss, for example 1:27:09' : undefined}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
});
