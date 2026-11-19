import { Combobox } from '@base-ui/react/combobox';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Check, ChevronDown, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import './button.css';
import './select.css';

export interface SelectItem {
  value: string;
  label: ReactNode;
  /** Quiet second line or trailing note, for example "3:12:40". */
  note?: ReactNode;
  /** Plain text to search by when `label` is not a string. */
  text?: string;
}

export interface SelectProps {
  label: string;
  items: SelectItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Keep the label for assistive tech only (for example inside a top bar). */
  hideLabel?: boolean;
  icon?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  /** Adds a search box at the top of the list. Use it once a list passes about eight items (projects, channels, workflows). */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Shown when the search matches nothing. */
  emptyText?: string;
  /** Gallery only: render with the popup open. */
  defaultOpen?: boolean;
}

const textOf = (item: SelectItem) => item.text ?? (typeof item.label === 'string' ? item.label : item.value);

/**
 * Trigger looks like a secondary button with chevron-down. The selected item has a check and a --sunk fill.
 * Layout: hugs the trigger; the popup portals to <body>.
 */
export function Select(props: SelectProps) {
  if (props.searchable) return <SearchSelect {...props} />;
  const { label, items, value, defaultValue, onValueChange, hideLabel, icon, placeholder = 'Choose', disabled, defaultOpen } = props;
  return (
    <BaseSelect.Root
      items={items.map((i) => ({ value: i.value, label: i.label }))}
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
        <BaseSelect.Trigger className="hr-btn hr-select__trigger" data-kind="secondary" data-size="md">
          {icon ? <span className="hr-btn__icon" aria-hidden="true">{icon}</span> : null}
          <BaseSelect.Value className="hr-select__value" placeholder={placeholder} />
          <BaseSelect.Icon className="hr-select__chevron"><ChevronDown aria-hidden="true" /></BaseSelect.Icon>
        </BaseSelect.Trigger>
      </div>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="hr-popup-pos" sideOffset={6} alignItemWithTrigger={false} align="start">
          <BaseSelect.Popup className="hr-popup">
            <BaseSelect.List className="hr-popup__list">
              {items.map((item) => (
                <BaseSelect.Item key={item.value} value={item.value} className="hr-popup__item">
                  <BaseSelect.ItemIndicator className="hr-popup__check" keepMounted>
                    <Check aria-hidden="true" />
                  </BaseSelect.ItemIndicator>
                  <BaseSelect.ItemText className="hr-popup__text">{item.label}</BaseSelect.ItemText>
                  {item.note ? <span className="hr-popup__note">{item.note}</span> : null}
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

/** The same trigger and list, with a search box that filters as you type. Arrow keys move, Enter chooses, Esc closes. */
function SearchSelect({ label, items, value, defaultValue, onValueChange, hideLabel, icon, placeholder = 'Choose', disabled, searchPlaceholder = 'Search', emptyText = 'No matches', defaultOpen }: SelectProps) {
  const find = (v: string | undefined) => (v === undefined ? undefined : items.find((i) => i.value === v) ?? null);
  return (
    <Combobox.Root<SelectItem>
      items={items}
      value={find(value)}
      defaultValue={find(defaultValue)}
      onValueChange={(item) => {
        if (item) onValueChange?.(item.value);
      }}
      itemToStringLabel={textOf}
      itemToStringValue={(item) => item.value}
      isItemEqualToValue={(a, b) => a.value === b.value}
      disabled={disabled}
      defaultOpen={defaultOpen}
    >
      <div className="hr-select">
        <Combobox.Label className={hideLabel ? 'hr-sr-only' : 'hr-select__label'}>{label}</Combobox.Label>
        <Combobox.Trigger className="hr-btn hr-select__trigger" data-kind="secondary" data-size="md">
          {icon ? <span className="hr-btn__icon" aria-hidden="true">{icon}</span> : null}
          <span className="hr-select__value">
            <Combobox.Value placeholder={placeholder}>{(item: SelectItem | null) => item?.label ?? placeholder}</Combobox.Value>
          </span>
          <span className="hr-select__chevron" aria-hidden="true"><ChevronDown /></span>
        </Combobox.Trigger>
      </div>
      <Combobox.Portal>
        <Combobox.Positioner className="hr-popup-pos" sideOffset={6} align="start">
          <Combobox.Popup className="hr-popup" aria-label={label}>
            <div className="hr-popup__search">
              <Search aria-hidden="true" />
              <Combobox.Input className="hr-popup__search-input" placeholder={searchPlaceholder} aria-label={`Search ${label.toLowerCase()}`} />
            </div>
            <Combobox.Empty className="hr-popup__empty">{emptyText}</Combobox.Empty>
            <Combobox.List className="hr-popup__list">
              {(item: SelectItem) => (
                <Combobox.Item key={item.value} value={item} className="hr-popup__item">
                  <Combobox.ItemIndicator className="hr-popup__check" keepMounted>
                    <Check aria-hidden="true" />
                  </Combobox.ItemIndicator>
                  <span className="hr-popup__text">{item.label}</span>
                  {item.note ? <span className="hr-popup__note">{item.note}</span> : null}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
