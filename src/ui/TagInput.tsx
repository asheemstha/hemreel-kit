import { Lock } from 'lucide-react';
import { useRef, useState, type ClipboardEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { Chip } from './Chip';
import { FieldFrame, useFieldIds } from './Field';
import './tag-input.css';

/** Splits typed or pasted text on spaces and commas into clean tags, adding the prefix once ("gta6" and "##gta6" both become "#gta6"). */
export function parseTags(text: string, prefix = ''): string[] {
  return text
    .split(/[\s,]+/)
    .map((raw) => {
      let tag = raw.trim();
      if (!prefix) return tag;
      while (tag.startsWith(prefix)) tag = tag.slice(prefix.length);
      return tag ? prefix + tag : '';
    })
    .filter(Boolean);
}

export interface TagInputProps {
  label: ReactNode;
  value: string[];
  onChange: (tags: string[]) => void;
  /** Put in front of every tag when the person leaves it out, and never doubled. Usually "#". */
  prefix?: string;
  placeholder?: string;
  /** The most tags allowed. Shows the count, for example "4 of 5", next to the label. */
  max?: number;
  /** Tags in `value` that cannot be removed, for example the campaign's required "#ad". */
  locked?: string[];
  help?: ReactNode;
  error?: ReactNode;
  /** Return a message to refuse a tag, or null to accept it. */
  validate?: (tag: string) => string | null;
  disabled?: boolean;
  hideLabel?: boolean;
  id?: string;
}

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * Tags you type: hashtags, a required tag, discovery tags. Enter, comma, space or leaving the field adds one;
 * Backspace in the empty field removes the last; pasting a list adds them all.
 * Layout: fills the parent's width and grows taller as tags wrap onto more lines.
 */
export function TagInput({ label, value, onChange, prefix = '', placeholder, max, locked = [], help, error, validate, disabled, hideLabel, id }: TagInputProps) {
  const { controlId, labelId, msgId } = useFieldIds(id);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [startedWith] = useState(() => new Set(value)); // tags added after this pop in; the ones already there do not move on load
  const [note, setNote] = useState('');        // spoken politely: added, removed, already there
  const [refusal, setRefusal] = useState<string | null>(null); // shown as the error line until the person types again
  const isLocked = (tag: string) => locked.some((l) => same(l, tag));
  const shownError = error ?? refusal;

  const add = (raw: string) => {
    const incoming = parseTags(raw, prefix);
    const next = [...value];
    const added: string[] = [];
    let said = '';
    let refused: string | null = null;
    for (const tag of incoming) {
      if (next.some((t) => same(t, tag))) {
        said = `${tag} is already added.`;
        continue;
      }
      if (max !== undefined && next.length >= max) {
        refused = `${max} is the most you can add. Remove one first.`;
        break;
      }
      const problem = validate?.(tag) ?? null;
      if (problem) {
        refused = problem;
        continue;
      }
      next.push(tag);
      added.push(tag);
    }
    if (added.length) said = `${added.join(', ')} added.`;
    setNote(said);
    setRefusal(refused);
    // one refused tag stays in the box so it can be fixed; anything else clears it
    setText(refused && incoming.length === 1 ? raw.trim() : '');
    if (added.length) onChange(next);
  };

  const remove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
    setNote(`${tag} removed.`);
    setRefusal(null);
    inputRef.current?.focus();
  };

  const removeButtons = () => [...(boxRef.current?.querySelectorAll<HTMLButtonElement>('.hr-chip__remove') ?? [])];

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      if (text.trim()) {
        e.preventDefault();
        add(text);
      } else if (e.key !== 'Enter') e.preventDefault(); // a tag never starts with a space or a comma
      return;
    }
    const atStart = e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0;
    if (e.key === 'Backspace' && text === '') {
      const last = value.findLast((t) => !isLocked(t));
      if (last !== undefined) {
        e.preventDefault();
        remove(last);
      }
    } else if (e.key === 'ArrowLeft' && atStart) {
      const buttons = removeButtons();
      const lastButton = buttons[buttons.length - 1];
      if (lastButton) {
        e.preventDefault();
        lastButton.focus();
      }
    }
  };

  // Left and Right walk the remove buttons; Backspace or Delete on one removes that tag. Kept away from page hotkeys.
  const onBoxKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!(e.target instanceof HTMLButtonElement) || !e.target.classList.contains('hr-chip__remove')) return;
    const buttons = removeButtons();
    const i = buttons.indexOf(e.target);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      const to = buttons[i + (e.key === 'ArrowLeft' ? -1 : 1)];
      if (to) to.focus();
      else if (e.key === 'ArrowRight') inputRef.current?.focus();
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      e.stopPropagation();
      e.target.click();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (!/[\s,]/.test(pasted.trim())) return; // a single tag pastes as normal text
    e.preventDefault();
    add(`${text} ${pasted}`);
  };

  // A press on the empty part of the box puts the caret in the field.
  const onBoxMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || disabled) return;
    e.preventDefault();
    inputRef.current?.focus();
  };

  return (
    <FieldFrame label={label} htmlFor={controlId} labelId={labelId} hideLabel={hideLabel} aside={max !== undefined ? `${value.length} of ${max}` : undefined} help={help} error={shownError} msgId={msgId}>
      {/* The box only catches presses on its empty space and keys bubbling from the chips; the group inside carries the meaning. */}
      <div ref={boxRef} className="hr-tags" role="presentation" data-disabled={disabled || undefined} onMouseDown={onBoxMouseDown} onKeyDown={onBoxKey}>
        <div className="hr-tags__group" role="group" aria-labelledby={labelId} aria-disabled={disabled || undefined}>
          {value.map((tag) =>
            isLocked(tag) ? (
              <Chip key={tag} icon={<Lock />}>
                {tag}
                <span className="hr-sr-only">, required</span>
              </Chip>
            ) : (
              <Chip key={tag} className={startedWith.has(tag) ? undefined : 'hr-tags__new'} onRemove={disabled ? undefined : () => remove(tag)} removeLabel={`Remove ${tag}`}>{tag}</Chip>
            ),
          )}
          <input
            ref={inputRef}
            id={controlId}
            className="hr-tags__input"
            type="text"
            value={text}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={shownError ? true : undefined}
            aria-describedby={shownError || help ? msgId : undefined}
            onChange={(e) => {
              setText(e.target.value);
              setRefusal(null);
            }}
            onKeyDown={onInputKey}
            onPaste={onPaste}
            onBlur={() => {
              if (text.trim()) add(text);
            }}
          />
        </div>
      </div>
      <span className="hr-sr-only" role="status" aria-live="polite">{note}</span>
    </FieldFrame>
  );
}
