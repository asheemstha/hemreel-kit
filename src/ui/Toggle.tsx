import { Switch } from '@base-ui/react/switch';
import { useId, type ReactNode } from 'react';
import './toggle.css';

export interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** Required when there is no visible label. */
  'aria-label'?: string;
}

/**
 * 40×24 switch. On: ink fill and white knob. Off: surface fill, --edge border and knob.
 * Layout: hugs the switch and label; the description wraps to the parent's width.
 */
export function Toggle({ checked, defaultChecked, onCheckedChange, label, description, disabled, 'aria-label': ariaLabel }: ToggleProps) {
  const id = useId();
  const descId = description ? `${id}-desc` : undefined;
  const control = (
    <Switch.Root
      className="hr-toggle__switch"
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(v) => onCheckedChange?.(v)}
      disabled={disabled}
      aria-label={label ? undefined : ariaLabel}
      aria-describedby={descId}
    >
      <Switch.Thumb className="hr-toggle__knob" />
    </Switch.Root>
  );
  if (!label) return control;
  return (
    <div className="hr-toggle" data-disabled={disabled || undefined}>
      <label className="hr-toggle__row">
        {control}
        <span className="hr-toggle__label">{label}</span>
      </label>
      {description ? <p className="hr-toggle__desc" id={descId}>{description}</p> : null}
    </div>
  );
}
