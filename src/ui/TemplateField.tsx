import { Eye, Plus } from 'lucide-react';
import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { FieldFrame, useFieldIds } from './Field';
import './template-field.css';

export interface TemplateVariableOption {
  /** Written in the template as {token}. */
  token: string;
  /** Shown on the insert button. */
  label: string;
  /** What the preview puts in its place. */
  sample: string;
}

const TOKEN = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

/** Fills every known {token} with its sample. Unknown tokens stay as written. Three or more line breaks collapse to two, as the app does. */
export function renderTemplate(template: string, variables: ReadonlyArray<TemplateVariableOption>): string {
  const samples = new Map(variables.map((v) => [v.token, v.sample]));
  return template
    .replace(TOKEN, (whole: string, token: string) => samples.get(token) ?? whole)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** The {tokens} in a template that are not variables, each once, in the order written. */
export function unknownTokens(template: string, variables: ReadonlyArray<TemplateVariableOption>): string[] {
  const known = new Set(variables.map((v) => v.token));
  const found: string[] = [];
  for (const m of template.matchAll(TOKEN)) {
    const token = m[1];
    if (token && !known.has(token) && !found.includes(token)) found.push(token);
  }
  return found;
}

function unknownMessage(tokens: string[]): string | null {
  const names = tokens.map((t) => `{${t}}`);
  if (names.length === 0) return null;
  if (names.length === 1) return `${names[0]} is not a variable.`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} are not variables.`;
}

export interface TemplateFieldProps {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  variables: ReadonlyArray<TemplateVariableOption>;
  rows?: number;
  help?: ReactNode;
  /** Replaces the built-in "is not a variable" message. */
  error?: ReactNode;
  previewLabel?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  id?: string;
}

/**
 * Text with variables such as {hook} or {hashtags}: write the template, insert variables with the buttons, and see it filled in underneath.
 * Layout: fills the parent's width. The preview grows with the text.
 */
export function TemplateField({ label, value, onChange, variables, rows = 4, help, error, previewLabel = 'Preview', disabled, hideLabel, id }: TemplateFieldProps) {
  const { controlId, msgId } = useFieldIds(id);
  const previewId = useId();
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const touched = useRef(false); // until the person has been in the box, variables go at the end
  const caret = useRef<number | null>(null);
  const shownError = error ?? unknownMessage(unknownTokens(value, variables));
  const preview = renderTemplate(value, variables);

  // After an insert the new text arrives through `value`; then the caret goes just after the inserted variable.
  useLayoutEffect(() => {
    if (caret.current === null) return;
    areaRef.current?.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  }, [value]);

  const insert = (token: string) => {
    const el = areaRef.current;
    if (!el) return;
    const start = touched.current ? el.selectionStart : value.length;
    const end = touched.current ? el.selectionEnd : value.length;
    const piece = `{${token}}`;
    caret.current = start + piece.length;
    onChange(value.slice(0, start) + piece + value.slice(end));
    el.focus();
  };

  return (
    <div className="hr-template">
      <FieldFrame label={label} htmlFor={controlId} hideLabel={hideLabel} help={help} error={shownError} msgId={msgId}>
        <div className="hr-template__box" data-disabled={disabled || undefined}>
          <textarea
            ref={areaRef}
            id={controlId}
            className="hr-template__input"
            rows={rows}
            value={value}
            disabled={disabled}
            spellCheck={false}
            aria-invalid={shownError ? true : undefined}
            aria-describedby={shownError || help ? msgId : undefined}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              touched.current = true;
            }}
          />
          <div className="hr-template__vars" role="group" aria-label="Insert a variable">
            {variables.map((v) => (
              // preventDefault on mouse down keeps focus and the caret in the text while the button is pressed
              <button key={v.token} type="button" className="hr-template__var" disabled={disabled} aria-label={`Insert ${v.label}`} onMouseDown={(e) => e.preventDefault()} onClick={() => insert(v.token)}>
                <Plus aria-hidden="true" />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </FieldFrame>
      <div className="hr-template__preview" role="group" aria-labelledby={previewId}>
        <span className="hr-template__preview-label" id={previewId}>
          <Eye aria-hidden="true" />
          {previewLabel}
        </span>
        <p className="hr-template__preview-text" data-empty={preview ? undefined : ''}>{preview || 'Nothing to show yet.'}</p>
      </div>
    </div>
  );
}
