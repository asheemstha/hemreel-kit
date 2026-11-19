import { CircleAlert, CircleCheck, Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState, type ReactNode } from 'react';
import { Button } from './Button';
import { Field, useFieldIds } from './Field';
import { IconButton } from './IconButton';
import { Spinner } from './Spinner';
import './secret-field.css';

/** empty: no key yet. saved: a key is stored and not checked. testing, ok, failed: the result of "Test key". */
export type SecretStatus = 'empty' | 'saved' | 'testing' | 'ok' | 'failed';

export interface SecretFieldProps {
  label: ReactNode;
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  status?: SecretStatus;
  /** Replaces the default words for testing, ok and failed. For failed, give the reason: "The key was rejected. Copy it again from the console." */
  statusText?: ReactNode;
  /** Shows "Test key" while there is a key. */
  onTest?: () => void;
  /** Shows "Remove" while there is a key. */
  onRemove?: () => void;
  help?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  /** Gallery only: start with the key shown. */
  defaultRevealed?: boolean;
}

const WORDS: Partial<Record<SecretStatus, string>> = { testing: 'Checking the key', ok: 'Key works', failed: 'The key was rejected' };

/**
 * An API key: masked, with a button to show it, a way to test it and a way to remove it.
 * The key only ever lives in the input's value. The result of a test is a line with an icon and words, read out when it changes.
 * Layout: fills the parent's width. The buttons sit under the field and the test result under the buttons.
 */
export const SecretField = forwardRef<HTMLInputElement, SecretFieldProps>(function SecretField(
  { label, id, value, onValueChange, status = 'empty', statusText, onTest, onRemove, help, placeholder = 'Paste your key', disabled, defaultRevealed = false },
  ref,
) {
  const { controlId, msgId } = useFieldIds(id);
  const statusId = `${controlId}-status`;
  const [revealed, setRevealed] = useState(defaultRevealed);
  const hasKey = value !== '';
  const words = status === 'testing' || status === 'ok' || status === 'failed' ? (statusText ?? WORDS[status]) : null;
  const describedBy = [help ? msgId : null, words ? statusId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="hr-secret" data-status={status}>
      <Field
        ref={ref}
        id={controlId}
        label={label}
        mask={!revealed}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        help={help}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-invalid={status === 'failed' || undefined}
        aria-describedby={describedBy}
        trailing={hasKey ? (
          <IconButton
            size={32}
            icon={revealed ? <EyeOff /> : <Eye />}
            aria-label={revealed ? 'Hide key' : 'Show key'}
            aria-pressed={revealed}
            disabled={disabled}
            onClick={() => setRevealed((v) => !v)}
          />
        ) : undefined}
      />
      <div className="hr-secret__row">
        {hasKey && onTest ? <Button size="sm" onClick={onTest} disabled={disabled || status === 'testing'}>Test key</Button> : null}
        {hasKey && onRemove ? <Button size="sm" kind="ghost" onClick={onRemove} disabled={disabled}>Remove</Button> : null}
        <p className="hr-secret__status" id={statusId} role="status" data-status={words ? status : undefined}>
          {words ? (
            <>
              {status === 'testing' ? <Spinner size={16} /> : status === 'ok' ? <CircleCheck aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}
              <span>{words}</span>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
});
