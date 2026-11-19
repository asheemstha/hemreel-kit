import { useCallback, useMemo, useState } from 'react';

export interface Selection<T extends string> {
  /** The chosen ids that still exist in the list. */
  selected: ReadonlySet<T>;
  count: number;
  /** For a "select all" checkbox: nothing, part or everything chosen. */
  state: 'none' | 'some' | 'all';
  isSelected: (id: T) => boolean;
  toggle: (id: T, on?: boolean) => void;
  toggleAll: (on: boolean) => void;
  clear: () => void;
}

/** Multi-select state for a list of ids: a table, a clip grid, the moments list. Ids that leave the list drop out of the selection. */
export function useSelection<T extends string>(ids: readonly T[], initial: readonly T[] = []): Selection<T> {
  const [raw, setRaw] = useState<ReadonlySet<T>>(() => new Set(initial));
  const selected = useMemo(() => new Set(ids.filter((id) => raw.has(id))), [ids, raw]);
  const toggle = useCallback((id: T, on?: boolean) => {
    setRaw((prev) => {
      const next = new Set(prev);
      const want = on ?? !next.has(id);
      if (want) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  const toggleAll = useCallback((on: boolean) => setRaw(on ? new Set(ids) : new Set()), [ids]);
  const clear = useCallback(() => setRaw(new Set()), []);
  const isSelected = useCallback((id: T) => selected.has(id), [selected]);
  const state = selected.size === 0 ? 'none' : selected.size === ids.length ? 'all' : 'some';
  return { selected, count: selected.size, state, isSelected, toggle, toggleAll, clear };
}
