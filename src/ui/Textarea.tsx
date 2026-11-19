import { CircleAlert } from 'lucide-react';
import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import './textarea.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode;
  id?: string;
  /** Footer row for the character count and checks. */
  footer?: ReactNode;
  /** Makes it invalid: --fail border, icon and this message. */
  error?: ReactNode;
  hideLabel?: boolean;
}

/**
 * Same edge and radius as Field, 14.5 px / 1.5, no resize handle. Two lines by default.
 * Layout: fills the parent's width.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, id, footer, error, hideLabel, rows = 2, className, ...rest },
  ref,
) {
  const autoId = useId();
  const areaId = id ?? `t${autoId}`;
  const footId = `${areaId}-foot`;
  const errId = `${areaId}-err`;
  const describedBy = [error ? errId : null, footer ? footId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={['hr-textarea', className].filter(Boolean).join(' ')} data-invalid={error ? '' : undefined}>
      <label htmlFor={areaId} className={hideLabel ? 'hr-sr-only' : 'hr-textarea__label'}>{label}</label>
      <textarea ref={ref} id={areaId} rows={rows} className="hr-textarea__input" aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...rest} />
      {footer ? <div className="hr-textarea__footer" id={footId}>{footer}</div> : null}
      {error ? (
        <p className="hr-textarea__error" id={errId}>
          <CircleAlert aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
});
