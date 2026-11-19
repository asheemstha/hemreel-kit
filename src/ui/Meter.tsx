import './meter.css';

export type MeterVariant = 'default' | 'due' | 'stage';

export interface MeterProps {
  /** 0 to max. Omit for an indeterminate meter. */
  value?: number;
  max?: number;
  label: string;
  /** Spoken value, for example "41 percent" or "13 minutes left". */
  valueText?: string;
  height?: 5 | 6 | 8;
  variant?: MeterVariant;
  /** Hide the label visually (it is always given to assistive tech). */
  className?: string;
}

/** Layout: fills the parent's width. Give the parent a width (it collapses to 0 in a shrink-to-fit parent). */
export function Meter({ value, max = 100, label, valueText, height = 6, variant = 'default', className }: MeterProps) {
  const indeterminate = value === undefined;
  const pct = indeterminate ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={['hr-meter', className].filter(Boolean).join(' ')}
      role="progressbar"
      aria-label={label}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : max}
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuetext={valueText}
      data-h={height}
      data-variant={variant}
      data-indeterminate={indeterminate || undefined}
    >
      <span className="hr-meter__fill" style={indeterminate ? undefined : { width: `${pct}%` }} />
    </div>
  );
}
