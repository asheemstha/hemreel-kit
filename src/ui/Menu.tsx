import { Menu as BaseMenu } from '@base-ui/react/menu';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ButtonKind, ButtonSize } from './Button';
import { Kbd } from './Kbd';
import './button.css';
import './select.css';

export interface MenuItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Keycap shown at the right, for example "⌘D". */
  shortcut?: string;
  onSelect?: () => void;
  /** Destructive: --fail text. Always paired with a word such as "Delete". */
  danger?: boolean;
  disabled?: boolean;
}

export interface MenuProps {
  triggerLabel: ReactNode;
  items: Array<MenuItem | 'separator'>;
  kind?: ButtonKind;
  size?: ButtonSize;
  icon?: ReactNode;
  /** Gallery only: render with the popup open. */
  defaultOpen?: boolean;
  align?: 'start' | 'end';
}

/** A button that opens a list of actions. Same popup surface as Select. */
export function Menu({ triggerLabel, items, kind = 'secondary', size = 'md', icon, defaultOpen, align = 'start' }: MenuProps) {
  return (
    <BaseMenu.Root defaultOpen={defaultOpen} modal={false}>
      <BaseMenu.Trigger className="hr-btn hr-select__trigger" data-kind={kind} data-size={size}>
        {icon ? <span className="hr-btn__icon" aria-hidden="true">{icon}</span> : null}
        <span className="hr-btn__label">{triggerLabel}</span>
        <span className="hr-select__chevron" aria-hidden="true"><ChevronDown /></span>
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner className="hr-popup-pos" sideOffset={6} align={align}>
          <BaseMenu.Popup className="hr-popup">
            {items.map((item, i) =>
              item === 'separator' ? (
                <BaseMenu.Separator key={`sep-${i}`} className="hr-popup__sep" />
              ) : (
                <BaseMenu.Item key={item.id} className="hr-popup__item" onClick={item.onSelect} disabled={item.disabled} data-danger={item.danger || undefined}>
                  {item.icon ? <span className="hr-popup__icon" aria-hidden="true">{item.icon}</span> : null}
                  <span className="hr-popup__text">{item.label}</span>
                  {item.shortcut ? <span className="hr-popup__kbd"><Kbd decorative>{item.shortcut}</Kbd></span> : null}
                </BaseMenu.Item>
              ),
            )}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
