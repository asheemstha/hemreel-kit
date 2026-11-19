import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useId, type ReactNode } from 'react';
import './radio-card.css';

export interface RadioCardGroupProps {
  /** Accessible name of the group. */
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** 'row': cards side by side (workflows). 'stack': one above the other (cap behaviour). */
  layout?: 'row' | 'stack';
  disabled?: boolean;
  children: ReactNode;
}

export function RadioCardGroup({ label, value, defaultValue, onValueChange, layout = 'row', disabled, children }: RadioCardGroupProps) {
  return (
    <RadioGroup
      className="hr-radiocards"
      data-layout={layout}
      aria-label={label}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => onValueChange?.(v as string)}
      disabled={disabled}
    >
      {children}
    </RadioGroup>
  );
}

export interface RadioCardProps {
  value: string;
  title: ReactNode;
  /** Description lines under the title. */
  children?: ReactNode;
  /** Trailing detail at the right of the title, for example pay terms. */
  meta?: ReactNode;
  disabled?: boolean;
}

/** A card that is one radio option. Selected: --accent-tint fill, 1.5 px ink border, 18 px ring dot. */
export function RadioCard({ value, title, children, meta, disabled }: RadioCardProps) {
  const id = useId();
  return (
    <label className="hr-radiocard" data-disabled={disabled || undefined}>
      <Radio.Root value={value} className="hr-radiocard__radio" aria-labelledby={`${id}-t`} aria-describedby={children || meta ? `${id}-d` : undefined} disabled={disabled}>
        <Radio.Indicator className="hr-radiocard__dot" keepMounted />
      </Radio.Root>
      <span className="hr-radiocard__body">
        <span className="hr-radiocard__head">
          <span className="hr-radiocard__title" id={`${id}-t`}>{title}</span>
        </span>
        {children || meta ? (
          <span className="hr-radiocard__desc" id={`${id}-d`}>
            {meta ? <span className="hr-radiocard__meta">{meta}</span> : null}
            {children}
          </span>
        ) : null}
      </span>
    </label>
  );
}
