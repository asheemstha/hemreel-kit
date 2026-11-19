import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Tabs } from '@base-ui/react/tabs';
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import './segmented.css';

export interface SegmentedItem<T extends string> {
  value: T;
  label: ReactNode;
  /** Shown after the label in tabular numbers, for example "All 8". */
  count?: number;
}

export interface SegmentedProps<T extends string> {
  /** Accessible name of the group. */
  label: string;
  items: Array<SegmentedItem<T>>;
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  variant?: 'default' | 'stage';
  /** 'radio' for a setting (default). 'tabs' for a filter that switches what a list shows. */
  as?: 'tabs' | 'radio';
  disabled?: boolean;
}

const NAV_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']);

/** Keeps arrow, Home and End keys inside the group so page hotkeys never see them. */
const contain = (e: KeyboardEvent) => {
  if (NAV_KEYS.has(e.key)) e.stopPropagation();
};

/**
 * A track of 28 px options. Arrow keys move, Home and End jump.
 * Layout: hugs its items; never wider than the parent. If the items do not fit, give the parent more room or fewer items: it does not scroll.
 */
export function Segmented<T extends string>({ label, items, value, defaultValue, onValueChange, variant = 'default', as = 'radio', disabled }: SegmentedProps<T>) {
  const [inner, setInner] = useState<T | undefined>(defaultValue ?? items[0]?.value);
  const current = value ?? inner;
  const change = (v: T) => {
    if (value === undefined) setInner(v);
    onValueChange?.(v);
  };
  // Base UI moves with the arrows; Home and End jump to the first and last option (WAI-ARIA radio group and tabs patterns).
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    contain(e);
    if (e.key !== 'Home' && e.key !== 'End') return;
    const target = e.key === 'Home' ? items[0] : items[items.length - 1];
    if (!target || disabled) return;
    e.preventDefault();
    change(target.value);
    const nodes = e.currentTarget.querySelectorAll<HTMLElement>('.hr-seg__item');
    (e.key === 'Home' ? nodes[0] : nodes[nodes.length - 1])?.focus();
  };
  // The selection is one pill that slides and resizes to the chosen item, rather than each item swapping its background.
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const el = track.querySelector<HTMLElement>('.hr-seg__item[data-checked], .hr-seg__item[data-active]');
      setThumb(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    track.querySelectorAll('.hr-seg__item').forEach((n) => ro.observe(n));
    return () => ro.disconnect();
  }, [current, items]);
  // No slide on first paint: the pill appears in place, then animates on later changes.
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const pill = (
    <span
      className="hr-seg__thumb"
      aria-hidden="true"
      data-ready={ready || undefined}
      data-hidden={thumb ? undefined : ''}
      style={thumb ? { transform: `translateX(${thumb.x}px)`, width: thumb.w } : undefined}
    />
  );
  const content = (item: SegmentedItem<T>) => (
    <>
      <span>{item.label}</span>
      {item.count !== undefined ? <span className="hr-seg__count hr-tnum">{item.count}</span> : null}
    </>
  );

  if (as === 'tabs') {
    return (
      <Tabs.Root value={current} onValueChange={(v) => change(v as T)} className="hr-seg" data-variant={variant} onKeyDown={onKeyDown}>
        <Tabs.List ref={trackRef} className="hr-seg__track" aria-label={label} activateOnFocus loopFocus={false}>
          {pill}
          {items.map((item) => (
            <Tabs.Tab key={item.value} value={item.value} className="hr-seg__item" disabled={disabled}>
              {content(item)}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.Root>
    );
  }

  return (
    <RadioGroup
      value={current}
      onValueChange={(v) => change(v as T)}
      aria-label={label}
      disabled={disabled}
      ref={trackRef}
      className="hr-seg hr-seg__track"
      data-variant={variant}
      data-disabled={disabled || undefined}
      onKeyDown={onKeyDown}
    >
      {pill}
      {items.map((item) => (
        <Radio.Root key={item.value} value={item.value} className="hr-seg__item">
          {content(item)}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
