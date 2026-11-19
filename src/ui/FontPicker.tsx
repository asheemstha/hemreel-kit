import { Select as BaseSelect } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import { CAPTION_FONTS, captionFontStack } from '@/data/captionStyle';
import './button.css';
import './select.css';
import './font-picker.css';

export interface FontOption {
  value: string;
  /** The font's name as shown to the person. */
  label: string;
  /** CSS font-family the option is drawn in. */
  family: string;
}

export interface FontPickerProps {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Font names (drawn with the caption font stack), or { value, label, family } for anything else. */
  fonts?: ReadonlyArray<string | FontOption>;
  /** Text every option is drawn with, for example the clip's hook. Without it each option shows its own name. */
  sample?: string;
  hideLabel?: boolean;
  disabled?: boolean;
  /** Gallery only: render with the list open. */
  defaultOpen?: boolean;
}

/**
 * Choose a caption font. Every option is drawn in its own font, so the list is the preview.
 * Layout: hugs the trigger, like Select. The list portals to <body>.
 */
export function FontPicker({ label, value, defaultValue, onValueChange, fonts = CAPTION_FONTS, sample, hideLabel, disabled, defaultOpen }: FontPickerProps) {
  const options: FontOption[] = fonts.map((f) => (typeof f === 'string' ? { value: f, label: f, family: captionFontStack(f) } : f));
  const byValue = new Map(options.map((o) => [o.value, o]));
  return (
    <BaseSelect.Root
      items={options.map((o) => ({ value: o.value, label: o.label }))}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => {
        if (typeof v === 'string') onValueChange?.(v);
      }}
      disabled={disabled}
      defaultOpen={defaultOpen}
      modal={false}
    >
      <div className="hr-select">
        <BaseSelect.Label className={hideLabel ? 'hr-sr-only' : 'hr-select__label'}>{label}</BaseSelect.Label>
        <BaseSelect.Trigger className="hr-btn hr-select__trigger hr-font__trigger" data-kind="secondary" data-size="md">
          <BaseSelect.Value className="hr-select__value" placeholder="Choose a font">
            {(v: string | null) => {
              const o = v ? byValue.get(v) : undefined;
              return o ? <span className="hr-font__name" style={{ fontFamily: o.family }}>{o.label}</span> : 'Choose a font';
            }}
          </BaseSelect.Value>
          <BaseSelect.Icon className="hr-select__chevron"><ChevronDown aria-hidden="true" /></BaseSelect.Icon>
        </BaseSelect.Trigger>
      </div>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="hr-popup-pos" sideOffset={6} alignItemWithTrigger={false} align="start">
          <BaseSelect.Popup className="hr-popup">
            <BaseSelect.List className="hr-popup__list">
              {options.map((o) => (
                <BaseSelect.Item key={o.value} value={o.value} label={o.label} className="hr-popup__item hr-font__item">
                  <BaseSelect.ItemIndicator className="hr-popup__check" keepMounted>
                    <Check aria-hidden="true" />
                  </BaseSelect.ItemIndicator>
                  <BaseSelect.ItemText className="hr-popup__text hr-font__name" style={{ fontFamily: o.family }}>{sample ?? o.label}</BaseSelect.ItemText>
                  {sample ? <span className="hr-popup__note">{o.label}</span> : null}
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
