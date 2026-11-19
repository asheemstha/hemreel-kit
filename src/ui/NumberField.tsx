import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import { Minus, Plus } from 'lucide-react';
import { useRef, type PointerEvent, type ReactNode } from 'react';
import { FieldFrame, useFieldIds } from './Field';
import './number-field.css';

export interface NumberFieldProps {
  label: ReactNode;
  id?: string;
  value?: number | null;
  defaultValue?: number;
  /** `null` while the field is empty. */
  onValueChange?: (value: number | null) => void;
  /** Fires when typing ends (blur) or a step lands: the moment to save. */
  onValueCommitted?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Short unit drawn right after the number: "s", "min", "clips". */
  unit?: string;
  /** The unit in full for assistive tech, for example "seconds". Without it the short unit is read. */
  unitLabel?: string;
  /** Number formatting, for example { maximumFractionDigits: 1 }. */
  format?: Intl.NumberFormatOptions;
  help?: ReactNode;
  /** Makes the field invalid: --fail tint, icon and this message. */
  error?: ReactNode;
  disabled?: boolean;
  size?: 40 | 44;
  /** Fill the parent's width. The control hugs its content otherwise. */
  block?: boolean;
  hideLabel?: boolean;
}

/**
 * A typed number with its unit and minus / plus buttons: clips to find, clip length, check interval.
 * Arrow keys step, Shift steps by 10, holding a button repeats. Typing is free and the value clamps to min and max on blur.
 * Layout: the control hugs its content (132 px, wider for long numbers); pass `block` to fill. The label and help line take the parent's width.
 */
export function NumberField({
  label, id, value, defaultValue, onValueChange, onValueCommitted, min, max, step = 1, unit, unitLabel, format, help, error, disabled, size = 40, block, hideLabel,
}: NumberFieldProps) {
  const { controlId, msgId } = useFieldIds(id);
  const unitId = `${controlId}-unit`;
  const inputRef = useRef<HTMLInputElement>(null);
  const name = typeof label === 'string' ? ` ${label.charAt(0).toLowerCase()}${label.slice(1)}` : '';
  const describedBy = [unit ? unitId : null, error || help ? msgId : null].filter(Boolean).join(' ') || undefined;
  // A press on the unit or the empty part of the field goes to the number, like pressing a text field anywhere.
  const focusNumber = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || (e.target instanceof Element && e.target.closest('button, input'))) return;
    e.preventDefault();
    inputRef.current?.focus();
  };
  return (
    <FieldFrame label={label} htmlFor={controlId} hideLabel={hideLabel} help={help} error={error} msgId={msgId}>
      <BaseNumberField.Root
        id={controlId}
        className="hr-numfield"
        data-size={size}
        data-block={block || undefined}
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        format={format}
        disabled={disabled}
        onValueChange={(v) => onValueChange?.(v)}
        onValueCommitted={(v) => onValueCommitted?.(v)}
      >
        <BaseNumberField.Group className="hr-numfield__group" aria-disabled={disabled || undefined} onPointerDown={focusNumber}>
          <span className="hr-numfield__value">
            <BaseNumberField.Input ref={inputRef} className="hr-numfield__input" aria-describedby={describedBy} aria-invalid={error ? true : undefined} />
            {unit ? (
              <span className="hr-numfield__unit" id={unitId}>
                {unitLabel ? <><span aria-hidden="true">{unit}</span><span className="hr-sr-only">{unitLabel}</span></> : unit}
              </span>
            ) : null}
          </span>
          <span className="hr-numfield__steps">
            <BaseNumberField.Decrement className="hr-numfield__btn" aria-label={`Decrease${name}`}>
              <Minus aria-hidden="true" />
            </BaseNumberField.Decrement>
            <BaseNumberField.Increment className="hr-numfield__btn" aria-label={`Increase${name}`}>
              <Plus aria-hidden="true" />
            </BaseNumberField.Increment>
          </span>
        </BaseNumberField.Group>
      </BaseNumberField.Root>
    </FieldFrame>
  );
}
