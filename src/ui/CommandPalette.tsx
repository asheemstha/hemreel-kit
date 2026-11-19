import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { Kbd } from './Kbd';
import './command-palette.css';

export interface CommandItem {
  id: string;
  label: string;
  /** A 16 px lucide-react icon. */
  icon?: ReactNode;
  /** Quiet text after the label, for example "3:12:40" or "Score 91". */
  note?: string;
  /** Keycap shown at the right when the action has its own key, for example "⌘N". */
  shortcut?: string;
  /** Extra words the search should match, for example ["add", "import"]. */
  keywords?: string[];
  onSelect: () => void;
}

export interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandGroup[];
  placeholder?: string;
  /** Second line of the empty state, under "No matches for …". */
  emptyText?: string;
}

/** The key that opens the palette, in the two forms the keymap uses. */
export const COMMAND_PALETTE_KEY = { keys: '⌘K', aria: 'Meta+K' } as const;

/** Every word typed must appear somewhere in the label, the note or the keywords. */
export function filterCommands(groups: CommandGroup[], query: string): CommandGroup[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return groups;
  return groups
    .map((g) => ({
      heading: g.heading,
      items: g.items.filter((item) => {
        const hay = [item.label, item.note ?? '', ...(item.keywords ?? [])].join(' ').toLowerCase();
        return words.every((w) => hay.includes(w));
      }),
    }))
    .filter((g) => g.items.length > 0);
}

/** Opens the palette on ⌘K (Ctrl+K on Windows and Linux) from anywhere, including while typing in a field. */
export function useCommandPaletteHotkey(onOpen: () => void, enabled = true): void {
  const ref = useRef(onOpen);
  useEffect(() => {
    ref.current = onOpen;
  });
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'k') return;
      e.preventDefault();
      ref.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}

function PaletteBody({ groups, placeholder, emptyText, onPick }: { groups: CommandGroup[]; placeholder: string; emptyText?: string; onPick: (item: CommandItem) => void }) {
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (itemId: string) => `${id}-o-${itemId}`;
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const shown = useMemo(() => filterCommands(groups, query), [groups, query]);
  const flat = useMemo(() => shown.flatMap((g) => g.items), [shown]);
  // The first match is active until the person moves; a pick that was filtered away falls back to the first match.
  const active = flat.find((item) => item.id === activeId) ?? flat[0];

  useEffect(() => {
    if (!active) return;
    listRef.current?.querySelector<HTMLElement>(`[data-item="${CSS.escape(active.id)}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const move = (by: number) => {
    if (flat.length === 0) return;
    const at = active ? flat.indexOf(active) : -1;
    const next = flat[(at + by + flat.length) % flat.length];
    if (next) setActiveId(next.id);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (active) onPick(active);
    }
  };

  return (
    <>
      <div className="hr-cmdk__search">
        <Search className="hr-cmdk__search-icon" aria-hidden="true" />
        <input
          className="hr-cmdk__input"
          type="text"
          role="combobox"
          aria-label={placeholder}
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active ? optionId(active.id) : undefined}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveId(null);
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      <div ref={listRef} id={listId} className="hr-cmdk__list" role="listbox" aria-label="Results">
        {shown.map((group, gi) => (
          <div key={group.heading} className="hr-cmdk__group" role="group" aria-labelledby={`${id}-g-${gi}`}>
            <div className="hr-cmdk__heading" id={`${id}-g-${gi}`}>{group.heading}</div>
            {group.items.map((item) => (
              // Options are picked with the pointer here and with Enter in the search field; focus never leaves the field.
              // oxlint-disable-next-line jsx-a11y/click-events-have-key-events
              <div
                key={item.id}
                id={optionId(item.id)}
                className="hr-cmdk__item"
                role="option"
                tabIndex={-1}
                aria-selected={item === active}
                data-active={item === active || undefined}
                data-item={item.id}
                onPointerMove={() => { if (item !== active) setActiveId(item.id); }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(item)}
              >
                {item.icon ? <span className="hr-cmdk__icon" aria-hidden="true">{item.icon}</span> : null}
                <span className="hr-cmdk__label">{item.label}</span>
                {item.note ? <span className="hr-cmdk__note hr-tnum">{item.note}</span> : null}
                {item.shortcut ? <Kbd decorative>{item.shortcut}</Kbd> : null}
              </div>
            ))}
          </div>
        ))}
      </div>
      {flat.length === 0 ? (
        <div className="hr-cmdk__empty" role="status">
          <p className="hr-cmdk__empty-title">{`No matches for “${query.trim()}”`}</p>
          {emptyText ? <p className="hr-cmdk__empty-hint">{emptyText}</p> : null}
        </div>
      ) : null}
      <div className="hr-cmdk__foot" aria-hidden="true">
        <span className="hr-cmdk__hint"><Kbd decorative>↑</Kbd><Kbd decorative>↓</Kbd>Move</span>
        <span className="hr-cmdk__hint"><Kbd decorative>↵</Kbd>Open</span>
        <span className="hr-cmdk__hint"><Kbd decorative>Esc</Kbd>Close</span>
      </div>
    </>
  );
}

/**
 * ⌘K: jump to a project, clip, channel or action by typing a few letters.
 * Focus stays in the search field. Up and Down move through the results, Enter runs the highlighted one and closes, Esc closes.
 * Open it with `useCommandPaletteHotkey`. What was typed is forgotten each time it closes.
 * Layout: portals to <body>, a 640 px panel in the top third of the window over a scrim; place it anywhere in the tree.
 */
export function CommandPalette({ open, onOpenChange, groups, placeholder = 'Search projects, clips, channels and actions', emptyText = 'Try a project, clip or channel name.' }: CommandPaletteProps) {
  const pick = (item: CommandItem) => {
    onOpenChange(false);
    item.onSelect();
  };
  return (
    <BaseDialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="hr-cmdk__scrim" />
        <BaseDialog.Popup className="hr-cmdk">
          <BaseDialog.Title className="hr-sr-only">Command palette</BaseDialog.Title>
          <PaletteBody groups={groups} placeholder={placeholder} emptyText={emptyText} onPick={pick} />
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
