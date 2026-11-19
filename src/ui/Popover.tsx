import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ReactElement, ReactNode } from 'react';
import './popover.css';

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverProps {
  /** The element that opens the popover. Must be a button (or link) that accepts a ref. */
  trigger: ReactElement;
  /** Names the popover for assistive tech. Shown as its heading unless `hideTitle` is set. */
  title: string;
  hideTitle?: boolean;
  children: ReactNode;
  side?: PopoverSide;
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fixed width in px. Without it the popover hugs its content. */
  width?: number;
  /** Drop the 12 px padding, for content that brings its own (a list, a calendar). */
  flush?: boolean;
  className?: string;
}

/**
 * A small panel anchored to a button: filters, a colour palette, a calendar, an account switcher.
 * It is not modal: the page stays usable, Esc or a click outside closes it, and focus returns to the trigger.
 * For a list of actions use Menu; for a choice that needs an answer use Dialog.
 * Layout: the trigger stays where you put it; the panel portals to <body> and sits above dialogs.
 */
export function Popover({ trigger, title, hideTitle, children, side = 'bottom', align = 'start', open, defaultOpen, onOpenChange, width, flush, className }: PopoverProps) {
  return (
    <BasePopover.Root open={open} defaultOpen={defaultOpen} onOpenChange={(o) => onOpenChange?.(o)}>
      <BasePopover.Trigger render={trigger} />
      <BasePopover.Portal>
        <BasePopover.Positioner className="hr-popover-pos" side={side} align={align} sideOffset={8} collisionPadding={12}>
          <BasePopover.Popup className={['hr-popover', className].filter(Boolean).join(' ')} data-flush={flush || undefined} style={width ? { width } : undefined}>
            <BasePopover.Title className={hideTitle ? 'hr-sr-only' : 'hr-popover__title'}>{title}</BasePopover.Title>
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

/** Closes the popover it sits in. Wrap a button: <PopoverClose render={<Button>Done</Button>} />. */
export const PopoverClose = BasePopover.Close;
