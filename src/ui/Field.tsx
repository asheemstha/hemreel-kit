import { CircleAlert } from 'lucide-react';
import { forwardRef, useId, useLayoutEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Kbd } from './Kbd';
import './field.css';

export type FieldType = 'text' | 'url' | 'money';
export type FieldSize = 40 | 44 | 48;

/** The ids a labelled control needs: one for the control, one for its label, one for the help or error line. */
export function useFieldIds(id?: string): { controlId: string; labelId: string; msgId: string } {
  const auto = useId();
  const controlId = id ?? `f${auto}`;
  return { controlId, labelId: `${controlId}-label`, msgId: `${controlId}-msg` };
}

export interface FieldFrameProps {
  label: ReactNode;
  /** Id of the one input the label names. Leave it out for a group of controls, and point the group at `labelId` with aria-labelledby. */
  htmlFor?: string;
  labelId?: string;
  hideLabel?: boolean;
  /** Quiet text at the right of the label row, for example the live value "62%". */
  aside?: ReactNode;
  help?: ReactNode;
  /** Makes the control invalid and replaces the help line with this message and an icon. */
  error?: ReactNode;
  /** Id of the help or error line. Put it in the control's aria-describedby when either is set. */
  msgId: string;
  className?: string;
  children: ReactNode;
}

/**
 * The frame every labelled control shares: label above, the control, then help or an error below.
 * Use it for new inputs so labels, help and errors look and read the same everywhere.
 * Layout: fills the parent's width. The control inside decides its own width.
 */
export function FieldFrame({ label, htmlFor, labelId, hideLabel, aside, help, error, msgId, className, children }: FieldFrameProps) {
  const labelClass = hideLabel ? 'hr-sr-only' : 'hr-field__label';
  const labelNode = htmlFor
    ? <label htmlFor={htmlFor} id={labelId} className={labelClass}>{label}</label>
    : <span id={labelId} className={labelClass}>{label}</span>;
  return (
    <div className={['hr-field', className].filter(Boolean).join(' ')} data-invalid={error ? '' : undefined}>
      {aside && !hideLabel ? (
        <div className="hr-field__head">
          {labelNode}
          <span className="hr-field__aside hr-tnum">{aside}</span>
        </div>
      ) : labelNode}
      {children}
      {error ? (
        <p className="hr-field__msg" id={msgId} data-error="">
          <CircleAlert aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : help ? (
        <p className="hr-field__msg" id={msgId}>{help}</p>
      ) : null}
    </div>
  );
}

export interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode;
  id?: string;
  type?: FieldType;
  size?: FieldSize;
  /** A 16 px lucide-react icon drawn at the left in --ink-3. */
  icon?: ReactNode;
  /** Keycap shown at the right, for example "E". */
  shortcut?: string;
  /** Controls that sit inside the field at the right: a clear button, a reveal button, a unit. The text makes room for them. */
  trailing?: ReactNode;
  /** Mask the text like a password (API keys). */
  mask?: boolean;
  help?: ReactNode;
  /** Makes the field invalid: --fail tint, icon and this message. */
  error?: ReactNode;
  hideLabel?: boolean;
}

/**
 * Label above, 40 px input (44 and 48 variants), help or error below.
 * Layout: fills the parent's width. Wrap it in a sized container to make it narrower.
 */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, id, type = 'text', size = 40, icon, shortcut, trailing, mask, help, error, hideLabel, className, style, ...rest },
  ref,
) {
  const { controlId, msgId } = useFieldIds(id);
  const invalid = Boolean(error);
  const lead = type === 'money' ? <span className="hr-field__currency">$</span> : icon;
  // Trailing controls sit over the right edge of the input, so the text is padded by their measured width.
  const actionsRef = useRef<HTMLSpanElement>(null);
  const [actionsW, setActionsW] = useState(0);
  const hasTrailing = Boolean(trailing);
  useLayoutEffect(() => {
    const el = actionsRef.current;
    if (!el) return;
    const measure = () => setActionsW(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasTrailing]);
  return (
    <FieldFrame label={label} htmlFor={controlId} hideLabel={hideLabel} help={help} error={error} msgId={msgId} className={className}>
      <div className="hr-field__control" data-size={size} data-lead={lead ? '' : undefined} data-trail={shortcut && !hasTrailing ? '' : undefined}>
        {lead ? <span className="hr-field__lead" aria-hidden="true">{lead}</span> : null}
        <input
          ref={ref}
          id={controlId}
          className="hr-field__input"
          type={mask ? 'password' : type === 'money' ? 'text' : type}
          inputMode={type === 'money' ? 'decimal' : type === 'url' ? 'url' : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={error || help ? msgId : undefined}
          aria-keyshortcuts={shortcut}
          spellCheck={type === 'text' && !mask ? undefined : false}
          style={hasTrailing ? { ...style, paddingRight: actionsW + 10 } : style}
          {...rest}
        />
        {hasTrailing ? (
          <span ref={actionsRef} className="hr-field__actions">{trailing}</span>
        ) : shortcut ? (
          <span className="hr-field__trail"><Kbd decorative hint>{shortcut}</Kbd></span>
        ) : null}
      </div>
    </FieldFrame>
  );
});
