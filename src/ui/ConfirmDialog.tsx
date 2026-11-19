import { AlertDialog } from '@base-ui/react/alert-dialog';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { Button } from './Button';
import './dialog.css';
import './confirm-dialog.css';

export type ConfirmTone = 'danger' | 'neutral';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The question, with the thing named: "Delete Tomo · GTA VI launch night?" */
  title: ReactNode;
  /** What happens, in one or two sentences. Say whether it can be undone. */
  children?: ReactNode;
  /** What will be lost, in numbers: "12 clips · 3.2 GB". */
  detail?: ReactNode;
  /** A verb that repeats the title: "Delete project", never "OK" or "Yes". */
  confirmLabel: string;
  cancelLabel?: string;
  /**
   * Runs when the person confirms. Return a promise to keep the dialog open and busy until the work is done.
   * The dialog closes itself afterwards. If the promise rejects it stays open, so the reason can be shown.
   */
  onConfirm: () => void | Promise<void>;
  /** 'danger' for anything that deletes or disconnects. 'neutral' for a choice that only needs a second look. */
  tone?: ConfirmTone;
  /** Icon on the confirm button. Danger defaults to a bin. */
  icon?: ReactNode;
  /** Force the busy look: the confirm button shows a spinner and both buttons are disabled. */
  busy?: boolean;
}

/**
 * Asks before something that deletes, disconnects or cannot be undone: delete a project or a clip, disconnect an account, quit while rendering.
 * Focus starts on Cancel, so Enter never destroys anything by accident. A click outside does nothing; Esc cancels.
 * Layout: portals to <body> and centres itself over a scrim; place it anywhere in the tree.
 */
export function ConfirmDialog({ open, onOpenChange, title, children, detail, confirmLabel, cancelLabel = 'Cancel', onConfirm, tone = 'danger', icon, busy = false }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);
  const working = busy || pending;

  const confirm = async () => {
    const result = onConfirm();
    if (!(result instanceof Promise)) {
      onOpenChange(false);
      return;
    }
    setPending(true);
    try {
      await result;
      onOpenChange(false);
    } catch {
      // stay open: the caller shows what went wrong
    } finally {
      setPending(false);
    }
  };

  const confirmIcon = working ? <LoaderCircle /> : (icon ?? (tone === 'danger' ? <Trash2 /> : undefined));
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next, details) => {
        if (!next && working) {
          details.cancel();
          return;
        }
        onOpenChange(next);
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="hr-dialog__scrim" />
        <AlertDialog.Popup className="hr-dialog hr-confirm" data-footer="" data-tone={tone} initialFocus={cancelRef}>
          <div className="hr-dialog__head">
            <AlertDialog.Title className="hr-dialog__title">{title}</AlertDialog.Title>
            {children ? <AlertDialog.Description className="hr-dialog__desc">{children}</AlertDialog.Description> : null}
            {detail ? <p className="hr-confirm__detail hr-tnum">{detail}</p> : null}
          </div>
          <div className="hr-dialog__foot">
            <Button ref={cancelRef} disabled={working} onClick={() => onOpenChange(false)}>{cancelLabel}</Button>
            <Button kind={tone === 'danger' ? 'danger' : 'dark'} icon={confirmIcon} loading={working} onClick={() => void confirm()}>{confirmLabel}</Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
