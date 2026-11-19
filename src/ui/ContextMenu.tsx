import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import type { KeyboardEvent, ReactElement, ReactNode } from 'react';
import { Kbd } from './Kbd';
import type { MenuItem } from './Menu';
import './select.css';
import './context-menu.css';

export interface ContextMenuProps {
  /** The same item shape as Menu, so one list can feed a "More" button and the right-click menu. */
  items: Array<MenuItem | 'separator'>;
  /** What the menu belongs to: a clip, a project row, a moment. */
  children: ReactNode;
  /** Names the menu for assistive tech, for example "Clip actions". */
  label?: string;
  /**
   * Make the single child element the target itself instead of wrapping it.
   * Needed inside tables and lists, where an extra element would break the markup. The child must pass props and a ref to its root.
   */
  asChild?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A right-click menu around any element. A shortcut, never the only way: offer the same actions in a visible Menu ("More") too.
 * Opens on right click, on a long press, with the context menu key, and with Shift+F10 while focus is inside the target
 * (so the target needs something focusable in it, such as its link or its More button). Arrow keys move, Enter picks, Esc closes.
 * Layout: adds no box of its own. The wrapper uses `display: contents`, so the child keeps its place in a flex or grid parent.
 */
export function ContextMenu({ items, children, label, asChild, disabled, onOpenChange }: ContextMenuProps) {
  // macOS browsers have no key for the context menu, so Shift+F10 is handled here: it replays a right click at the focused element.
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (disabled || e.key !== 'F10' || !e.shiftKey) return;
    const el = e.target instanceof HTMLElement ? e.target : e.currentTarget;
    const box = el.getBoundingClientRect();
    e.preventDefault();
    el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: box.left + Math.min(24, box.width / 2), clientY: box.top + box.height / 2 }));
  };
  return (
    <BaseContextMenu.Root disabled={disabled} onOpenChange={(open) => onOpenChange?.(open)}>
      {asChild
        ? <BaseContextMenu.Trigger render={children as ReactElement} onKeyDown={onKeyDown} />
        : <BaseContextMenu.Trigger className="hr-ctx" onKeyDown={onKeyDown}>{children}</BaseContextMenu.Trigger>}
      <BaseContextMenu.Portal>
        <BaseContextMenu.Positioner className="hr-popup-pos">
          <BaseContextMenu.Popup className="hr-popup" aria-label={label}>
            {items.map((item, i) =>
              item === 'separator' ? (
                <BaseContextMenu.Separator key={`sep-${i}`} className="hr-popup__sep" />
              ) : (
                <BaseContextMenu.Item key={item.id} className="hr-popup__item" onClick={item.onSelect} disabled={item.disabled} data-danger={item.danger || undefined}>
                  {item.icon ? <span className="hr-popup__icon" aria-hidden="true">{item.icon}</span> : null}
                  <span className="hr-popup__text">{item.label}</span>
                  {item.shortcut ? <span className="hr-popup__kbd"><Kbd decorative>{item.shortcut}</Kbd></span> : null}
                </BaseContextMenu.Item>
              ),
            )}
          </BaseContextMenu.Popup>
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    </BaseContextMenu.Root>
  );
}
