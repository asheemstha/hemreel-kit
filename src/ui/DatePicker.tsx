import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useNow } from '@/hooks/clock';
import { Button } from './Button';
import { FieldFrame, useFieldIds } from './Field';
import { IconButton } from './IconButton';
import { Popover, PopoverClose } from './Popover';
import './button.css';
import './date-picker.css';

/* ---- date maths on 'YYYY-MM-DD' strings in local time. No date library. ---- */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (year: number, month: number, day: number) => `${year}-${pad(month)}-${pad(day)}`;

function parts(date: string): [year: number, month: number, day: number] {
  const [y = 1970, m = 1, d = 1] = date.split('-').map(Number);
  return [y, m, d];
}

/** A local Date at noon, so a daylight saving change can never move it to the day before or after. */
export function parseISODate(date: string): Date {
  const [y, m, d] = parts(date);
  return new Date(y, m - 1, d, 12);
}

export function toISODate(date: Date): string {
  return iso(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** True for a real calendar day written as YYYY-MM-DD ("2026-02-30" is not one). */
export function isISODate(text: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(text) && toISODate(parseISODate(text)) === text;
}

export function addDays(date: string, days: number): string {
  const d = parseISODate(date);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Month is 1 to 12. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Same day in another month, or that month's last day when it is shorter (31 Jan plus 1 month is 28 Feb). */
export function addMonths(date: string, months: number): string {
  const [y, m, d] = parts(date);
  const index = y * 12 + (m - 1) + months;
  const year = Math.floor(index / 12);
  const month = index - year * 12 + 1;
  return iso(year, month, Math.min(d, daysInMonth(year, month)));
}

/** The weeks of a month, Monday first. Days that belong to the neighbouring months are null. */
export function monthWeeks(year: number, month: number): Array<Array<string | null>> {
  const lead = (new Date(year, month - 1, 1, 12).getDay() + 6) % 7;
  const cells: Array<string | null> = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= daysInMonth(year, month); d++) cells.push(iso(year, month, d));
  while (cells.length % 7) cells.push(null);
  const weeks: Array<Array<string | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** "18 Nov 2026" */
export function formatDate(date: string): string {
  const [y, m, d] = parts(date);
  return `${d} ${(MONTHS[m - 1] ?? '').slice(0, 3)} ${y}`;
}

/** "12 Nov to 18 Nov 2026", or with both years when they differ. */
export function formatDateRange(from: string, to: string): string {
  if (from === to) return formatDate(from);
  const start = formatDate(from);
  return `${parts(from)[0] === parts(to)[0] ? start.slice(0, start.lastIndexOf(' ')) : start} to ${formatDate(to)}`;
}

/** Days in a range, counting both ends. */
export function daysInRange(from: string, to: string): number {
  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / 86_400_000) + 1;
}

const clamp = (date: string, min?: string, max?: string) => (min && date < min ? min : max && date > max ? max : date);

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface DatePreset {
  id: string;
  label: string;
  /** The range this preset stands for, given today's date. */
  range: (today: string) => DateRange;
}

export const DEFAULT_DATE_PRESETS: DatePreset[] = [
  { id: 'last-7', label: 'Last 7 days', range: (today) => ({ from: addDays(today, -6), to: today }) },
  { id: 'last-30', label: 'Last 30 days', range: (today) => ({ from: addDays(today, -29), to: today }) },
  { id: 'this-month', label: 'This month', range: (today) => ({ from: `${today.slice(0, 8)}01`, to: today }) },
];

/* ---- the month grid ---- */

interface CalendarShared {
  /** Today's date, marked with a dot. */
  today: string;
  /** First and last day that can be chosen. */
  min?: string;
  max?: string;
  /** Move focus to the current day when the calendar appears, as a popover does. */
  focusOnMount?: boolean;
}

export type CalendarProps = CalendarShared &
  (
    | { mode?: 'single'; value: string | null; onChange: (value: string) => void }
    | { mode: 'range'; value: DateRange; onChange: (value: DateRange) => void }
  );

/**
 * One month as a grid of days. One day is in the tab order; arrows move by day and week, Home and End go to the ends of the week,
 * Page Up and Page Down change month (with Shift, year). In range mode the first pick is the start and the second the end.
 * Layout: fixed width, 252 px (seven 36 px days), always six rows tall so it never jumps between months.
 */
export function Calendar(props: CalendarProps) {
  const { today, min, max, focusOnMount } = props;
  const titleId = useId();
  const anchor = props.mode === 'range' ? props.value.to ?? props.value.from : props.value;
  // The cursor is the one focusable day. The month on show is always the cursor's month.
  const [cursor, setCursor] = useState(() => clamp(anchor ?? today, min, max));
  const [hover, setHover] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const [year, month] = parts(cursor);
  const focusCursor = () => gridRef.current?.querySelector<HTMLElement>('button[tabindex="0"]')?.focus();

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    focusCursor();
  }, [cursor]);
  useEffect(() => {
    if (!focusOnMount) return;
    const id = requestAnimationFrame(focusCursor);
    return () => cancelAnimationFrame(id);
  }, [focusOnMount]);

  const go = (date: string) => {
    const next = clamp(date, min, max);
    if (next === cursor) return;
    moveFocus.current = true;
    setCursor(next);
  };

  const onDayKey = (e: KeyboardEvent<HTMLButtonElement>, date: string) => {
    const weekday = (parseISODate(date).getDay() + 6) % 7;
    let next: string;
    switch (e.key) {
      case 'ArrowLeft': next = addDays(date, -1); break;
      case 'ArrowRight': next = addDays(date, 1); break;
      case 'ArrowUp': next = addDays(date, -7); break;
      case 'ArrowDown': next = addDays(date, 7); break;
      case 'Home': next = addDays(date, -weekday); break;
      case 'End': next = addDays(date, 6 - weekday); break;
      case 'PageUp': next = addMonths(date, e.shiftKey ? -12 : -1); break;
      case 'PageDown': next = addMonths(date, e.shiftKey ? 12 : 1); break;
      default: return;
    }
    // these keys belong to the calendar, not to the page
    e.preventDefault();
    e.stopPropagation();
    go(next);
  };

  const pick = (date: string) => {
    setCursor(date);
    if (props.mode === 'range') {
      const { from, to } = props.value;
      if (!from || to) props.onChange({ from: date, to: null });
      else props.onChange(date < from ? { from: date, to: from } : { from, to: date });
    } else props.onChange(date);
  };

  // The tinted band: the chosen range, or from the start to the day under the pointer while the end is still open.
  let lo: string | null = null;
  let hi: string | null = null;
  if (props.mode === 'range') {
    const { from, to } = props.value;
    const end = to ?? (from ? hover : null);
    if (from && end) [lo, hi] = from <= end ? [from, end] : [end, from];
  }
  const chosen = (date: string) => (props.mode === 'range' ? date === props.value.from || date === props.value.to : date === props.value);
  const band = (date: string) => {
    if (!lo || !hi || lo === hi || date < lo || date > hi) return undefined;
    return date === lo ? 'start' : date === hi ? 'end' : 'in';
  };

  const first = iso(year, month, 1);
  const canPrev = !min || addDays(first, -1) >= min;
  const canNext = !max || addMonths(first, 1) <= max;
  const weeks = monthWeeks(year, month);
  while (weeks.length < 6) weeks.push([null, null, null, null, null, null, null]);

  return (
    <div className="hr-cal">
      <div className="hr-cal__head">
        <IconButton aria-label="Previous month" icon={<ChevronLeft />} size={32} tooltip={false} disabled={!canPrev} onClick={() => setCursor(clamp(addMonths(cursor, -1), min, max))} />
        <div className="hr-cal__title" id={titleId} aria-live="polite">{`${MONTHS[month - 1] ?? ''} ${year}`}</div>
        <IconButton aria-label="Next month" icon={<ChevronRight />} size={32} tooltip={false} disabled={!canNext} onClick={() => setCursor(clamp(addMonths(cursor, 1), min, max))} />
      </div>
      <div ref={gridRef} className="hr-cal__grid" role="grid" aria-labelledby={titleId}>
        <div className="hr-cal__row" role="row">
          {WEEKDAYS.map((w) => (
            <span key={w} className="hr-cal__weekday" role="columnheader" aria-label={w}>{w.slice(0, 2)}</span>
          ))}
        </div>
        {weeks.map((week, i) => (
          <div key={i} className="hr-cal__row" role="row">
            {week.map((date, j) => {
              if (!date) return <span key={`${i}-${j}`} className="hr-cal__blank" role="presentation" />;
              const on = chosen(date);
              const isToday = date === today;
              const [, , d] = parts(date);
              const weekday = WEEKDAYS[j] ?? '';
              return (
                <div key={date} className="hr-cal__cell" role="gridcell" data-range={band(date)} aria-selected={on}>
                  <button
                    type="button"
                    className="hr-cal__day hr-tnum"
                    data-date={date}
                    data-chosen={on || undefined}
                    data-today={isToday || undefined}
                    tabIndex={date === cursor ? 0 : -1}
                    disabled={Boolean((min && date < min) || (max && date > max))}
                    aria-label={`${weekday} ${d} ${MONTHS[month - 1] ?? ''} ${year}${isToday ? ', today' : ''}`}
                    aria-current={isToday ? 'date' : undefined}
                    onClick={() => pick(date)}
                    onKeyDown={(e) => onDayKey(e, date)}
                    onMouseEnter={() => setHover(date)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(date)}
                  >
                    {d}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- the field: a button that opens the calendar ---- */

interface DatePickerShared {
  /** What the date is for: "Post on", "Earnings period". */
  label: string;
  min?: string;
  max?: string;
  placeholder?: string;
  help?: ReactNode;
  hideLabel?: boolean;
  disabled?: boolean;
  /** Gallery only: render with the calendar open. */
  defaultOpen?: boolean;
}

export type DatePickerProps = DatePickerShared &
  (
    | { mode?: 'single'; value: string | null; onChange: (value: string | null) => void }
    | { mode: 'range'; value: DateRange; onChange: (value: DateRange) => void; presets?: DatePreset[] }
  );

/**
 * A date, or a range of dates, chosen from a calendar in a popover. Dates are 'YYYY-MM-DD' strings.
 * Single mode closes when a day is picked. Range mode stays open and offers quick ranges at the left.
 * Layout: hugs its button; never wider than the parent. The calendar portals to <body>.
 */
export function DatePicker(props: DatePickerProps) {
  const { label, min, max, help, hideLabel, disabled, defaultOpen } = props;
  const { controlId, labelId, msgId } = useFieldIds();
  const valueId = `${controlId}-value`;
  const today = toISODate(new Date(useNow()));
  const [open, setOpen] = useState(Boolean(defaultOpen));
  // Remounts the calendar so it jumps to a value that was set from outside it: a quick range, Today, Clear.
  const [jump, setJump] = useState(0);

  let text: string | null;
  if (props.mode === 'range') {
    const { from, to } = props.value;
    text = from && to ? formatDateRange(from, to) : from ? `From ${formatDate(from)}` : null;
  } else text = props.value ? formatDate(props.value) : null;
  const placeholder = props.placeholder ?? (props.mode === 'range' ? 'Choose dates' : 'Choose a date');
  const todayAllowed = clamp(today, min, max) === today;

  let panel: ReactNode;
  if (props.mode === 'range') {
    const { value, onChange, presets = DEFAULT_DATE_PRESETS } = props;
    const count = value.from && value.to ? daysInRange(value.from, value.to) : 0;
    panel = (
      <div className="hr-date__panel">
        <div className="hr-date__presets" role="group" aria-label="Quick ranges">
          {presets.map((p) => {
            const r = p.range(today);
            const range = { from: r.from ? clamp(r.from, min, max) : null, to: r.to ? clamp(r.to, min, max) : null };
            return (
              <button
                key={p.id}
                type="button"
                className="hr-date__preset"
                aria-pressed={range.from === value.from && range.to === value.to}
                onClick={() => {
                  onChange(range);
                  setJump((n) => n + 1);
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="hr-date__main">
          <Calendar key={jump} mode="range" value={value} onChange={onChange} today={today} min={min} max={max} focusOnMount={jump === 0} />
          <div className="hr-date__foot">
            <span className="hr-date__summary hr-tnum" aria-live="polite">
              {count ? `${count} ${count === 1 ? 'day' : 'days'}` : value.from ? 'Choose the end date' : 'Choose the start date'}
            </span>
            {value.from ? (
              <Button size="sm" kind="ghost" onClick={() => { onChange({ from: null, to: null }); setJump((n) => n + 1); }}>Clear</Button>
            ) : null}
            <PopoverClose render={<Button size="sm">Done</Button>} />
          </div>
        </div>
      </div>
    );
  } else {
    const { value, onChange } = props;
    panel = (
      <div className="hr-date__panel">
        <div className="hr-date__main">
          <Calendar key={jump} value={value} onChange={(v) => { onChange(v); setOpen(false); }} today={today} min={min} max={max} focusOnMount={jump === 0} />
          <div className="hr-date__foot">
            <Button size="sm" kind="ghost" disabled={!todayAllowed} onClick={() => { onChange(today); setOpen(false); }}>Today</Button>
            {value ? (
              <Button size="sm" kind="ghost" onClick={() => { onChange(null); setJump((n) => n + 1); }}>Clear</Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <FieldFrame label={label} labelId={labelId} hideLabel={hideLabel} help={help} msgId={msgId} className="hr-date">
      <Popover
        title={label}
        hideTitle
        flush
        open={open}
        onOpenChange={setOpen}
        trigger={
          <button
            type="button"
            id={controlId}
            className="hr-btn hr-date__trigger"
            data-kind="secondary"
            data-size="md"
            data-empty={text ? undefined : ''}
            disabled={disabled}
            aria-labelledby={`${labelId} ${valueId}`}
            aria-describedby={help ? msgId : undefined}
          >
            <span className="hr-btn__icon" aria-hidden="true"><CalendarDays /></span>
            <span className="hr-btn__label hr-tnum" id={valueId}>{text ?? placeholder}</span>
          </button>
        }
      >
        {panel}
      </Popover>
    </FieldFrame>
  );
}
