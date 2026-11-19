import { Slider as BaseSlider } from '@base-ui/react/slider';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { FieldFrame, useFieldIds } from './Field';
import './slider.css';

export interface SliderProps {
  label: ReactNode;
  id?: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Fires once when a drag ends or a key is pressed: the moment to save. */
  onValueCommitted?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Value to text, for example (v) => `${v} s`. Shown at the right of the label and read out as the value. */
  format?: (value: number) => string;
  help?: ReactNode;
  disabled?: boolean;
  /** Values that get a small tick under the track. A drag that lands close to one snaps to it. The arrow keys never snap, so every value stays reachable. */
  marks?: readonly number[];
  /** Keep the label for assistive tech only. The live value is hidden with it. */
  hideLabel?: boolean;
}

/** How close a drag must come to a mark to snap, as a share of the whole range. */
const SNAP_REACH = 0.02;

/** The nearest mark when `value` is within `reach` of one, else the value unchanged. */
export function snapToMark(value: number, marks: readonly number[], reach: number): number {
  let best = value;
  let bestGap = reach;
  for (const mark of marks) {
    const gap = Math.abs(mark - value);
    if (gap <= bestGap) {
      best = mark;
      bestGap = gap;
    }
  }
  return best;
}

/**
 * A value picked by feel on a light surface: clip length, gameplay pan, caption size. (On the video stage use Scrubber.)
 * Arrow keys step, Shift or Page Up and Page Down take big steps, Home and End jump to the ends.
 * Layout: fills the parent's width. Give the parent a width; it collapses in a shrink-to-fit parent.
 */
export function Slider({ label, id, value, defaultValue, onValueChange, onValueCommitted, min = 0, max = 100, step = 1, format, help, disabled, marks, hideLabel }: SliderProps) {
  const { labelId, msgId } = useFieldIds(id);
  const [inner, setInner] = useState(defaultValue ?? min);
  const current = value ?? inner;
  const say = (v: number) => (format ? format(v) : String(v));
  const span = max - min || 1;
  const settle = (v: number, byKeyboard: boolean) => (marks?.length && !byKeyboard ? snapToMark(v, marks, span * SNAP_REACH) : v);
  return (
    <FieldFrame label={label} labelId={labelId} hideLabel={hideLabel} aside={say(current)} help={help} msgId={msgId}>
      <BaseSlider.Root
        className="hr-slider"
        value={current}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        thumbAlignment="edge"
        onValueChange={(v, details) => {
          const next = settle(v, details.reason === 'keyboard');
          if (value === undefined) setInner(next);
          onValueChange?.(next);
        }}
        onValueCommitted={(v, details) => onValueCommitted?.(settle(v, details.reason === 'keyboard'))}
      >
        <BaseSlider.Control className="hr-slider__control">
          <BaseSlider.Track className="hr-slider__track">
            <BaseSlider.Indicator className="hr-slider__fill" />
            <BaseSlider.Thumb
              className="hr-slider__thumb"
              aria-labelledby={labelId}
              aria-describedby={help ? msgId : undefined}
              getAriaValueText={(_formatted, v) => say(v)}
            />
          </BaseSlider.Track>
          {marks?.map((mark) => (
            <span key={mark} className="hr-slider__mark" aria-hidden="true" style={{ '--p': String((mark - min) / span) } as CSSProperties} />
          ))}
        </BaseSlider.Control>
      </BaseSlider.Root>
    </FieldFrame>
  );
}
