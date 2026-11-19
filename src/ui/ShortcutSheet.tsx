import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { KEYMAP, type KeyScope } from '@/data/keymap';
import { Kbd } from './Kbd';
import './shortcut-sheet.css';

const COLUMNS: Array<{ scope: KeyScope; title: string }> = [
  { scope: 'review', title: 'Clip review' },
  { scope: 'moments', title: 'Moments editor' },
  { scope: 'global', title: 'Anywhere' },
];

/** Splits "⌘1 to ⌘4" and "← →" into separate keycaps, keeping the words. */
function Keys({ keys }: { keys: string }) {
  const parts = keys.split(' ');
  return (
    <span className="hr-sheet__keys">
      {parts.map((p, i) => (p === 'to' ? <span key={i} className="hr-sheet__to">to</span> : <Kbd key={i}>{p}</Kbd>))}
    </span>
  );
}

export interface ShortcutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Every key in hemreel, rendered from KEYMAP so the sheet can never drift from the real bindings.
 * Layout: a modal dialog portalled to <body>; place it anywhere.
 */
export function ShortcutSheet({ open, onOpenChange }: ShortcutSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => onOpenChange(o)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="hr-sheet__scrim" />
        <Dialog.Popup className="hr-sheet">
          <div className="hr-sheet__head">
            <Dialog.Title className="hr-sheet__title">Keyboard shortcuts</Dialog.Title>
            <Dialog.Description className="hr-sheet__desc">
              Letter keys do nothing while you are typing in a field. Keys marked proposed may change.
            </Dialog.Description>
            <Dialog.Close className="hr-sheet__close" aria-label="Close, Esc">
              <X aria-hidden="true" />
              <Kbd decorative>Esc</Kbd>
            </Dialog.Close>
          </div>
          <div className="hr-sheet__cols">
            {COLUMNS.map((col) => (
              <section key={col.scope} className="hr-sheet__col" aria-labelledby={`sheet-${col.scope}`}>
                <h3 className="hr-sheet__col-title" id={`sheet-${col.scope}`}>{col.title}</h3>
                <dl className="hr-sheet__list">
                  {KEYMAP.filter((k) => k.scope === col.scope).map((k) => (
                    <div key={k.id} className="hr-sheet__row">
                      <dt className="hr-sheet__label">
                        {k.label}
                        {k.source === 'proposed' ? <span className="hr-sheet__proposed">proposed</span> : null}
                      </dt>
                      <dd className="hr-sheet__key"><Keys keys={k.keys} /></dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
