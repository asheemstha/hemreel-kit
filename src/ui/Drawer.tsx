import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useScrollStop } from './Dialog';
import { IconButton } from './IconButton';
import './drawer.css';

export type DrawerSide = 'right' | 'left';
export type DrawerWidth = 360 | 480 | 640;

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** One quiet line under the title, for example "Dom · Heist practice · 2:04:11". */
  description?: ReactNode;
  /** The body. It scrolls on its own; the title and the footer stay put. */
  children?: ReactNode;
  /** Actions pinned to the bottom, right-aligned. */
  footer?: ReactNode;
  side?: DrawerSide;
  /** 360, 480 or 640 px wide. Never wider than the window minus 24 px. */
  width?: DrawerWidth;
  /**
   * Modal (default): a scrim covers the page, Tab stays inside, and a click outside closes it.
   * Not modal: no scrim, the page stays usable and its hotkeys keep working, and only Esc or the close button closes it.
   */
  modal?: boolean;
}

/**
 * A panel that slides in from the side of the window, for things you read next to the page: logs, clip details, run history.
 * Built on the Dialog primitive rather than Base UI's swipe drawer, so dragging to select text never dismisses it.
 * Layout: portals to <body>, full height with a 12 px gap to the window edges; place it anywhere in the tree.
 * A drawer that is not modal sits under dialogs and menus (--z-drawer) and carries `data-nonmodal`.
 */
export function Drawer({ open, onOpenChange, title, description, children, footer, side = 'right', width = 480, modal = true }: DrawerProps) {
  const [bodyRef, bodyNeedsStop] = useScrollStop();
  return (
    <BaseDialog.Root open={open} onOpenChange={(next) => onOpenChange(next)} modal={modal} disablePointerDismissal={!modal}>
      <BaseDialog.Portal>
        {modal ? <BaseDialog.Backdrop className="hr-drawer__scrim" /> : null}
        <BaseDialog.Popup className="hr-drawer" data-side={side} data-w={width} data-nonmodal={modal ? undefined : ''} data-footer={footer ? '' : undefined}>
          <div className="hr-drawer__head">
            <BaseDialog.Title className="hr-drawer__title">{title}</BaseDialog.Title>
            {description ? <BaseDialog.Description className="hr-drawer__desc">{description}</BaseDialog.Description> : null}
          </div>
          {/* in the tab order only while it scrolls and holds nothing focusable, so the keyboard can still scroll it */}
          {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
          <div ref={bodyRef} className="hr-drawer__body" tabIndex={bodyNeedsStop ? 0 : undefined}>{children}</div>
          {footer ? <div className="hr-drawer__foot">{footer}</div> : null}
          <BaseDialog.Close className="hr-drawer__close" render={<IconButton aria-label="Close" icon={<X />} size={32} tooltip={false} />} />
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/** Closes the drawer it sits in. Wrap a button: <DrawerClose render={<Button>Done</Button>} />. */
export const DrawerClose = BaseDialog.Close;
