import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';
import { IconButton } from './IconButton';
import './dialog.css';

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** One or two quiet sentences under the title. */
  description?: ReactNode;
  /** The body. It scrolls on its own when the dialog is taller than the window; the title and the actions stay put. */
  children?: ReactNode;
  /** Actions, right-aligned. Put the primary action last. */
  footer?: ReactNode;
  /** 400, 560 or 720 px wide. Never wider than the window minus 48 px. */
  size?: DialogSize;
  /** When false there is no close button, and Esc and a click outside do nothing: the person has to pick an action. */
  dismissible?: boolean;
  /** The element to focus when the dialog opens. Defaults to the first field or button in the body or footer. */
  initialFocus?: RefObject<HTMLElement | null>;
}

const TABBABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * For a scrolling body: true while its content is taller than its box and nothing inside can take focus.
 * Only then does the body itself need to be in the tab order, so it can be scrolled from the keyboard.
 * (With a field or button inside, tabbing to it scrolls the body, and focus should start there, not on the body.)
 */
export function useScrollStop(): [(node: HTMLElement | null) => void, boolean] {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [needed, setNeeded] = useState(false);
  useLayoutEffect(() => {
    if (!node) return;
    const measure = () => setNeeded(node.scrollHeight > node.clientHeight + 1 && !node.querySelector(TABBABLE));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    for (const child of node.children) ro.observe(child);
    return () => ro.disconnect();
  }, [node]);
  return [setNode, needed];
}

/**
 * A general modal: a title, a body and actions. Use it for a task that needs an answer before the page can go on
 * (edit clip, make a variant, find the facecam, post, paste a link). For a yes or no question use ConfirmDialog;
 * for a panel that leaves the page usable use Drawer or Popover.
 * Focus moves in on open, Tab stays inside, Esc closes, and focus returns to what opened it.
 * Layout: portals to <body> and centres itself over a scrim; place it anywhere in the tree.
 */
export function Dialog({ open, onOpenChange, title, description, children, footer, size = 'md', dismissible = true, initialFocus }: DialogProps) {
  const [bodyRef, bodyNeedsStop] = useScrollStop();
  return (
    <BaseDialog.Root
      open={open}
      disablePointerDismissal={!dismissible}
      onOpenChange={(next, details) => {
        if (!next && !dismissible && (details.reason === 'escape-key' || details.reason === 'outside-press')) {
          details.cancel();
          return;
        }
        onOpenChange(next);
      }}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="hr-dialog__scrim" />
        <BaseDialog.Popup className="hr-dialog" data-size={size} data-dismissible={dismissible || undefined} data-footer={footer ? '' : undefined} initialFocus={initialFocus}>
          <div className="hr-dialog__head">
            <BaseDialog.Title className="hr-dialog__title">{title}</BaseDialog.Title>
            {description ? <BaseDialog.Description className="hr-dialog__desc">{description}</BaseDialog.Description> : null}
          </div>
          {children ? (
            // in the tab order only while it scrolls and holds nothing focusable, so the keyboard can still scroll it
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            <div ref={bodyRef} className="hr-dialog__body" tabIndex={bodyNeedsStop ? 0 : undefined}>{children}</div>
          ) : null}
          {footer ? <div className="hr-dialog__foot">{footer}</div> : null}
          {dismissible ? (
            // last in the markup, so focus starts on the first field or action instead of on Close
            <BaseDialog.Close className="hr-dialog__close" render={<IconButton aria-label="Close" icon={<X />} size={32} tooltip={false} />} />
          ) : null}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/** Closes the dialog it sits in. Wrap a button: <DialogClose render={<Button>Cancel</Button>} />. */
export const DialogClose = BaseDialog.Close;
