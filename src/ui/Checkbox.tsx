import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Check, Minus } from 'lucide-react';
import type { ReactNode } from 'react';
import './checkbox.css';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  /** Required when there is no visible label. */
  'aria-label'?: string;
  /** The whole row is the label: a 36 px hit area with hover fill. */
  row?: boolean;
}

/** 16 px box, radius 4. Checked: ink fill with a white check. */
export function Checkbox({ checked, defaultChecked, indeterminate, onCheckedChange, disabled, label, 'aria-label': ariaLabel, row }: CheckboxProps) {
  const box = (
    <BaseCheckbox.Root
      className="hr-checkbox"
      checked={checked}
      defaultChecked={defaultChecked}
      indeterminate={indeterminate}
      onCheckedChange={(v) => onCheckedChange?.(v)}
      disabled={disabled}
      aria-label={label ? undefined : ariaLabel}
    >
      <BaseCheckbox.Indicator className="hr-checkbox__mark" keepMounted={false}>
        {indeterminate ? <Minus aria-hidden="true" /> : <Check aria-hidden="true" />}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
  if (!label) return box;
  return (
    <label className="hr-check-label" data-row={row || undefined} data-disabled={disabled || undefined}>
      {box}
      <span className="hr-check-label__text">{label}</span>
    </label>
  );
}
