import { Search, X } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, type KeyboardEvent } from 'react';
import { TIMING } from '@/styles/timing';
import { Field, type FieldSize } from './Field';
import { IconButton } from './IconButton';
import './search-field.css';

export interface SearchFieldProps {
  /** Names the field for assistive tech, for example "Search projects". Hidden unless `showLabel` is set. */
  label: string;
  showLabel?: boolean;
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Fires after a short pause in typing, and at once on Enter or clear: the moment to run the search. */
  onSearch?: (value: string) => void;
  /** Enter was pressed. */
  onSubmit?: (value: string) => void;
  placeholder?: string;
  /** The key that focuses the field, for example "/". A hint keycap: it shows while the field is empty and all keycaps are turned on. */
  shortcut?: string;
  /** Result line for assistive tech, read out when it changes: "12 clips". */
  count?: string;
  size?: FieldSize;
  disabled?: boolean;
}

/**
 * Search a list: projects, clips, a transcript. A clear button appears once there is text. Esc clears, and a second Esc leaves the field.
 * Layout: fills the parent's width. In a toolbar, put it in a box with a width (for example 280 px).
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { label, showLabel, id, value, onValueChange, onSearch, onSubmit, placeholder = 'Search', shortcut, count, size, disabled },
  ref,
) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current as HTMLInputElement);

  // onSearch: once per distinct text, after a pause in typing or straight away on Enter and clear.
  const handler = useRef(onSearch);
  useEffect(() => {
    handler.current = onSearch;
  });
  const sent = useRef(value);
  const send = (text: string) => {
    if (sent.current === text) return;
    sent.current = text;
    handler.current?.(text);
  };
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (sent.current === value) return;
      sent.current = value;
      handler.current?.(value);
    }, TIMING.searchDebounce);
    return () => window.clearTimeout(timer);
  }, [value]);

  const clear = () => {
    onValueChange('');
    send('');
    input.current?.focus();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      send(value);
      onSubmit?.(value);
    } else if (e.key === 'Escape') {
      // with text: clear and stay. Empty: leave the field. Either way the page's own Esc handling does not also run.
      e.preventDefault();
      e.stopPropagation();
      if (value) clear();
      else e.currentTarget.blur();
    }
  };

  return (
    <div className="hr-search">
      <Field
        ref={input}
        id={id}
        role="searchbox"
        label={label}
        hideLabel={!showLabel}
        size={size}
        icon={<Search />}
        shortcut={shortcut}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        trailing={value ? <IconButton size={32} icon={<X />} aria-label="Clear search" tooltip={false} disabled={disabled} onClick={clear} /> : undefined}
      />
      <span className="hr-sr-only" role="status">{count ?? ''}</span>
    </div>
  );
});
