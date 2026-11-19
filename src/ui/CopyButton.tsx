import { Check, CircleAlert, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { TIMING } from '@/styles/timing';
import { Button, type ButtonKind, type ButtonSize } from './Button';
import { IconButton } from './IconButton';
import './copy-button.css';

type CopyState = 'idle' | 'copied' | 'failed';

export interface CopyButtonProps {
  /** The text to copy, or a function that builds it when the button is pressed. */
  text: string | (() => string);
  label?: string;
  copiedLabel?: string;
  kind?: ButtonKind;
  size?: ButtonSize;
  /** Draw only the icon. The label becomes the accessible name and tooltip. */
  iconOnly?: boolean;
  onCopied?: (text: string) => void;
  disabled?: boolean;
}

const FAILED_LABEL = "Couldn't copy";

/**
 * Copies text, then says so: the icon turns into a check and the label reads "Copied" for a moment. If the clipboard refuses, it says that instead.
 * Layout: hugs its label. The width is that of the longer of the two labels, so it does not jump when it confirms.
 */
export function CopyButton({ text, label = 'Copy', copiedLabel = 'Copied', kind = 'secondary', size = 'sm', iconOnly, onCopied, disabled }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const settle = (next: CopyState) => {
    setState(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), TIMING.copied);
  };
  const copy = async () => {
    try {
      const value = typeof text === 'function' ? text() : text;
      await navigator.clipboard.writeText(value);
      settle('copied');
      onCopied?.(value);
    } catch {
      settle('failed');
    }
  };

  const icon = state === 'copied' ? <Check key="ok" className="hr-copy__pop" /> : state === 'failed' ? <CircleAlert key="no" className="hr-copy__pop" /> : <Copy key="copy" />;
  const now = state === 'copied' ? copiedLabel : state === 'failed' ? FAILED_LABEL : label;
  // The live region speaks the result once; the button's own name changes too.
  const live = <span className="hr-sr-only" role="status">{state === 'idle' ? '' : now}</span>;

  if (iconOnly) {
    return (
      <>
        <IconButton aria-label={now} icon={icon} size={size === 'sm' ? 32 : 36} kind={kind === 'secondary' ? 'secondary' : 'ghost'} onClick={copy} disabled={disabled} data-state={state} />
        {live}
      </>
    );
  }
  return (
    <>
      <Button kind={kind} size={size} onClick={copy} disabled={disabled} data-state={state}>
        {state === 'failed' ? (
          <span className="hr-copy__face">{icon}{FAILED_LABEL}</span>
        ) : (
          // Both faces share one cell, so the button is as wide as the wider one, and each is centred in it.
          <span className="hr-copy__faces">
            <span className="hr-copy__face" aria-hidden={state !== 'idle' || undefined}><Copy />{label}</span>
            <span className="hr-copy__face" aria-hidden={state !== 'copied' || undefined}>{state === 'copied' ? <Check className="hr-copy__pop" /> : <Check />}{copiedLabel}</span>
          </span>
        )}
      </Button>
      {live}
    </>
  );
}
