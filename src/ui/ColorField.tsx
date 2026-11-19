import { ChevronDown } from 'lucide-react';
import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { CAPTION_PALETTE, type Swatch } from '@/data/captionStyle';
import { Field, FieldFrame, useFieldIds } from './Field';
import { Popover } from './Popover';
import './color-field.css';

/** "#fe1", "fe1", "#FFEE11" and "ffee11" all become "#FFEE11". Anything else is null. */
export function normalizeHex(text: string): string | null {
  const t = text.trim().replace(/^#/, '');
  if (/^[0-9a-f]{6}$/i.test(t)) return `#${t.toUpperCase()}`;
  if (/^[0-9a-f]{3}$/i.test(t)) return `#${[...t].map((c) => c + c).join('').toUpperCase()}`;
  return null;
}

const COLUMNS = 6;
const HEX_ERROR = 'Use 6 letters and numbers, for example #FFE100.'; // example copy, not a UI colour. check-tokens: allow

export interface ColorFieldProps {
  /** What the colour is for: "Caption text", "Highlight", "Background". */
  label: string;
  /** Hex colour. */
  value: string;
  onValueChange: (hex: string) => void;
  /** Colours offered in the palette: hex strings, or { value, name } to give each a spoken name. */
  swatches?: ReadonlyArray<string | Swatch>;
  help?: ReactNode;
  hideLabel?: boolean;
  disabled?: boolean;
  /** Gallery only: render with the palette open. */
  defaultOpen?: boolean;
}

/**
 * A colour as a swatch button that opens a palette and a hex field. Never the OS colour picker.
 * Layout: the button hugs its content (swatch, hex, chevron). The palette portals to <body>.
 */
export function ColorField({ label, value, onValueChange, swatches = CAPTION_PALETTE, help, hideLabel, disabled, defaultOpen }: ColorFieldProps) {
  const { controlId, labelId, msgId } = useFieldIds();
  const valueId = `${controlId}-value`;
  const current = normalizeHex(value) ?? value.toUpperCase();
  const options: Swatch[] = swatches.map((s) => (typeof s === 'string' ? { value: normalizeHex(s) ?? s, name: s.toUpperCase() } : { value: normalizeHex(s.value) ?? s.value, name: s.name }));

  // The hex box holds what the person typed. It follows the value whenever the value changes from outside (a swatch, the parent).
  const [draft, setDraft] = useState({ text: current, from: current, checked: false });
  if (draft.from !== current) setDraft({ text: current, from: current, checked: false });
  const typed = normalizeHex(draft.text);
  const commit = (hex: string, text: string) => {
    setDraft({ text, from: hex, checked: false });
    if (hex !== current) onValueChange(hex);
  };
  const onHexChange = (text: string) => {
    const full = /^#?[0-9a-f]{6}$/i.test(text.trim()) ? normalizeHex(text) : null;
    if (full) commit(full, text);
    else setDraft((d) => ({ ...d, text, checked: d.checked && normalizeHex(text) === null }));
  };
  // Blur or Enter accepts the short form too ("#fe1"), or shows what is wrong.
  const settle = () => {
    if (typed) commit(typed, typed);
    else setDraft((d) => ({ ...d, checked: true }));
  };

  const gridRef = useRef<HTMLDivElement>(null);
  const selectedIndex = options.findIndex((o) => o.value === current);
  const onSwatchKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -COLUMNS, ArrowDown: COLUMNS }[e.key];
    if (step === undefined && e.key !== 'Home' && e.key !== 'End') return;
    // arrows belong to the palette, not to page hotkeys
    e.stopPropagation();
    e.preventDefault();
    const buttons = [...(gridRef.current?.querySelectorAll<HTMLButtonElement>('.hr-color__swatch') ?? [])];
    const from = buttons.indexOf(e.currentTarget);
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : (from < 0 ? 0 : from) + (step ?? 0);
    const next = options[to];
    if (!next) return;
    buttons[to]?.focus();
    commit(next.value, next.value);
  };

  return (
    <FieldFrame label={label} labelId={labelId} hideLabel={hideLabel} help={help} msgId={msgId} className="hr-color">
      <Popover
        title={label}
        width={232}
        defaultOpen={defaultOpen}
        trigger={
          <button type="button" id={controlId} className="hr-color__trigger" disabled={disabled} aria-labelledby={`${labelId} ${valueId}`} aria-describedby={help ? msgId : undefined}>
            <span className="hr-color__dot" style={{ '--swatch': current } as CSSProperties} aria-hidden="true" />
            <span className="hr-color__hex hr-tnum" id={valueId}>{current}</span>
            <ChevronDown className="hr-color__chevron" aria-hidden="true" />
          </button>
        }
      >
        <div ref={gridRef} className="hr-color__grid" role="radiogroup" aria-label={`${label} colours`}>
          {options.map((o, i) => {
            const on = o.value === current;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={o.name === o.value ? o.value : `${o.name}, ${o.value}`}
                tabIndex={on || (selectedIndex < 0 && i === 0) ? 0 : -1}
                className="hr-color__swatch"
                style={{ '--swatch': o.value } as CSSProperties}
                onClick={() => commit(o.value, o.value)}
                onKeyDown={onSwatchKey}
              />
            );
          })}
        </div>
        <Field
          label={`${label} hex`}
          hideLabel
          value={draft.text}
          maxLength={7}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="hr-color__hexfield hr-tnum"
          error={draft.checked && !typed ? HEX_ERROR : undefined}
          onChange={(e) => onHexChange(e.target.value)}
          onBlur={settle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') settle();
          }}
        />
      </Popover>
    </FieldFrame>
  );
}
