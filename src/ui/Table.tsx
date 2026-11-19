import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { ReactNode, TableHTMLAttributes, ThHTMLAttributes } from 'react';
import { Checkbox } from './Checkbox';
import './table.css';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Table caption. Visually hidden unless showCaption is set. */
  caption: string;
  showCaption?: boolean;
  /** 'compact' drops rows from 76 px to 52 px, for long lists of clips or runs. */
  density?: 'default' | 'compact';
  children: ReactNode;
}

/**
 * A real <table>. Write <thead>, <tbody>, <tr>, <th scope="col"> and <td> inside it.
 * Row variants: <tr data-state="live" | "offline" | "off">; "off" (watching off) quiets the text to --ink-3. <tr data-selected> tints a chosen row.
 * Cells: className "hr-table__num" for numbers, "hr-table__end" for the trailing control column.
 * Sorting: use <SortHeader> in place of <th>. Selection: <SelectAllHeader> in the header row and <SelectCell> in each row, with useSelection().
 * Layout: fills the parent's width and scrolls sideways when the columns do not fit.
 */
export function Table({ caption, showCaption, density = 'default', className, children, ...rest }: TableProps) {
  return (
    <div className="hr-table-wrap">
      <table className={['hr-table', className].filter(Boolean).join(' ')} data-density={density} {...rest}>
        <caption className={showCaption ? 'hr-table__caption' : 'hr-sr-only'}>{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export type SortDirection = 'asc' | 'desc';
export interface SortState { column: string; direction: SortDirection }

/** The sort a header click leads to: a new column starts ascending, the same column flips. */
export function nextSort(current: SortState | null, column: string): SortState {
  if (current?.column !== column) return { column, direction: 'asc' };
  return { column, direction: current.direction === 'asc' ? 'desc' : 'asc' };
}

export interface SortHeaderProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'onClick'> {
  /** The key this header sorts by. */
  column: string;
  sort: SortState | null;
  onSort: (next: SortState) => void;
  /** Right-align, for number columns. */
  end?: boolean;
  children: ReactNode;
}

/**
 * A column header that sorts. The whole header is a button; aria-sort tells assistive tech the direction.
 * Sorting the rows is up to the screen: this only reports the next sort.
 */
export function SortHeader({ column, sort, onSort, end, className, children, ...rest }: SortHeaderProps) {
  const direction = sort?.column === column ? sort.direction : null;
  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ChevronsUpDown;
  return (
    <th scope="col" aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'} className={[end ? 'hr-table__end' : null, className].filter(Boolean).join(' ') || undefined} {...rest}>
      <button type="button" className="hr-table__sort" data-active={direction ? '' : undefined} onClick={() => onSort(nextSort(sort, column))}>
        <span>{children}</span>
        <Icon aria-hidden="true" />
      </button>
    </th>
  );
}

export type SelectAllState = 'none' | 'some' | 'all';

/** The header cell that selects or clears every row. `label` names it, for example "Select all clips". */
export function SelectAllHeader({ state, onChange, label }: { state: SelectAllState; onChange: (checked: boolean) => void; label: string }) {
  // A <td>, not a <th>: a header cell must hold visible text, and this one holds only the checkbox.
  return (
    <td className="hr-table__check">
      <Checkbox aria-label={label} checked={state === 'all'} indeterminate={state === 'some'} onCheckedChange={onChange} />
    </td>
  );
}

/** The first cell of a selectable row. `label` names the row, for example "Select He did not see that coming". */
export function SelectCell({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <td className="hr-table__check">
      <Checkbox aria-label={label} checked={checked} onCheckedChange={onChange} />
    </td>
  );
}
