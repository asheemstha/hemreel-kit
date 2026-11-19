import { Minus, Plus } from 'lucide-react';
import { useEffect, useId, useRef, type MouseEvent, type PointerEvent } from 'react';
import { TIMING } from '@/styles/timing';
import { Kbd } from './Kbd';
import './stepper.css';

export interface StepperProps {
  /** "Start" or "End". Also names the buttons: "Start earlier", "Start later". */
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  format: (value: number) => string;
  /** Keycap shown after the group, for example "I". */
  shortcut?: string;
  disabled?: boolean;
  /** Words for the two buttons. Defaults to "earlier" and "later". */
  lessWord?: string;
  moreWord?: string;
}

const round = (v: number) => Math.round(v * 1000) / 1000;

/**
 * Minus, a two-line readout, plus. Holding a button repeats. Buttons disable at the limits.
 * Layout: hugs its content (fixed-width readout).
 */
export function Stepper({ label, value, onChange, min, max, step = 0.1, format, shortcut, disabled, lessWord = 'earlier', moreWord = 'later' }: StepperProps) {
  const id = useId();
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  const timers = useRef<{ wait?: number; every?: number }>({});

  const stop = () => {
    window.clearTimeout(timers.current.wait);
    window.clearInterval(timers.current.every);
    timers.current = {};
  };
  useEffect(() => stop, []);

  const nudge = (dir: -1 | 1) => {
    const next = round(Math.min(max, Math.max(min, valueRef.current + dir * step)));
    if (next === valueRef.current) {
      stop();
      return;
    }
    valueRef.current = next;
    onChange(next);
  };

  const start = (dir: -1 | 1) => (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    stop();
    nudge(dir);
    timers.current.wait = window.setTimeout(() => {
      timers.current.every = window.setInterval(() => nudge(dir), TIMING.repeatEvery);
    }, TIMING.repeatWait);
  };
  // Pointer presses are handled on pointerdown; a click with detail 0 comes from the keyboard (Enter or Space).
  const keyClick = (dir: -1 | 1) => (e: MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0) nudge(dir);
  };

  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <div className="hr-stepper-wrap">
      <fieldset className="hr-stepper" aria-labelledby={`${id}-l`} data-disabled={disabled || undefined}>
        <button type="button" className="hr-stepper__btn" aria-label={`${label} ${lessWord}`} disabled={disabled || atMin}
          onPointerDown={start(-1)} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onClick={keyClick(-1)}>
          <Minus aria-hidden="true" />
        </button>
        <span className="hr-stepper__readout">
          <span className="hr-stepper__label" id={`${id}-l`}>{label}</span>
          <output className="hr-stepper__value" aria-live="polite">{format(value)}</output>
        </span>
        <button type="button" className="hr-stepper__btn" aria-label={`${label} ${moreWord}`} disabled={disabled || atMax}
          onPointerDown={start(1)} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onClick={keyClick(1)}>
          <Plus aria-hidden="true" />
        </button>
      </fieldset>
      {shortcut ? <Kbd decorative hint>{shortcut}</Kbd> : null}
    </div>
  );
}
