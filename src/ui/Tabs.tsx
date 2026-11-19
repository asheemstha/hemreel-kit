import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import './tabs.css';

export interface TabItem {
  value: string;
  label: string;
  /** Shown after the label in tabular numbers, for example "To review 8". */
  count?: number;
  panel: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** Accessible name of the tab list, for example "Inbox". */
  label: string;
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Keep hidden panels in the DOM, so what they hold (scroll position, typed text) survives a switch. */
  keepMounted?: boolean;
}

const NAV_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']);

/**
 * Page-level tabs with counts and a panel each: what a whole page shows (Inbox: To review, Kept, Posted, Submitted).
 * For a small filter inside a toolbar use Segmented. Arrow keys move, Home and End jump.
 * Layout: the tab row hugs its tabs and wraps when they do not fit; the panel fills the parent's width.
 */
export function Tabs({ label, tabs, value, defaultValue, onValueChange, keepMounted }: TabsProps) {
  const [inner, setInner] = useState<string | undefined>(defaultValue ?? tabs.find((t) => !t.disabled)?.value);
  const current = value ?? inner;
  const change = (v: string) => {
    if (value === undefined) setInner(v);
    onValueChange?.(v);
  };
  // Arrow, Home and End keys stay inside the tab list, so page hotkeys never see them.
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!NAV_KEYS.has(e.key)) return;
    e.stopPropagation();
    if (e.key !== 'Home' && e.key !== 'End') return;
    const enabled = tabs.filter((t) => !t.disabled);
    const target = e.key === 'Home' ? enabled[0] : enabled[enabled.length - 1];
    if (!target) return;
    e.preventDefault();
    change(target.value);
    e.currentTarget.querySelector<HTMLElement>(`[data-tab="${CSS.escape(target.value)}"]`)?.focus();
  };

  // The selection is one soft pill that slides and resizes to the active tab. It follows the tab onto a second row if the tabs wrap.
  const listRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const el = list.querySelector<HTMLElement>('.hr-tabs__tab[data-active]');
      setThumb(el ? { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight } : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    list.querySelectorAll('.hr-tabs__tab').forEach((n) => ro.observe(n));
    return () => ro.disconnect();
  }, [current, tabs]);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <BaseTabs.Root className="hr-tabs" value={current} onValueChange={(v) => change(String(v))}>
      <BaseTabs.List ref={listRef} className="hr-tabs__list" aria-label={label} activateOnFocus onKeyDown={onKeyDown}>
        <span
          className="hr-tabs__thumb"
          aria-hidden="true"
          data-ready={ready || undefined}
          data-hidden={thumb ? undefined : ''}
          style={thumb ? { transform: `translate(${thumb.x}px, ${thumb.y}px)`, width: thumb.w, height: thumb.h } : undefined}
        />
        {tabs.map((t) => (
          <BaseTabs.Tab key={t.value} value={t.value} className="hr-tabs__tab" data-tab={t.value} disabled={t.disabled}>
            <span>{t.label}</span>
            {t.count !== undefined ? <span className="hr-tabs__count hr-tnum">{t.count}</span> : null}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      {tabs.map((t) => (
        <BaseTabs.Panel key={t.value} value={t.value} className="hr-tabs__panel" keepMounted={keepMounted}>
          {t.panel}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
