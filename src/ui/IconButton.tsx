import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Tooltip, type TooltipSide } from './Tooltip';
import './icon-button.css';

export type IconButtonKind = 'ghost' | 'secondary' | 'stage' | 'accent';
export type IconButtonSize = 32 | 36 | 40 | 44;

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Required: the button has no visible text. Also used as the tooltip label. */
  'aria-label': string;
  icon: ReactNode;
  kind?: IconButtonKind;
  size?: IconButtonSize;
  /** Round, used on the video stage. */
  round?: boolean;
  shortcut?: string;
  ariaKeyShortcuts?: string;
  tooltipSide?: TooltipSide;
  /** Set false to drop the tooltip (for example when a visible label sits next to it). */
  tooltip?: boolean;
  tooltipOpen?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, kind = 'ghost', size = 36, round, shortcut, ariaKeyShortcuts, tooltipSide = 'top', tooltip = true, tooltipOpen, className, type = 'button', ...rest },
  ref,
) {
  const button = (
    <button
      ref={ref}
      type={type}
      className={['hr-iconbtn', className].filter(Boolean).join(' ')}
      data-kind={kind}
      data-size={size}
      data-round={round || undefined}
      aria-keyshortcuts={ariaKeyShortcuts ?? shortcut}
      {...rest}
    >
      <span className="hr-iconbtn__icon" aria-hidden="true">{icon}</span>
    </button>
  );
  if (!tooltip) return button;
  return (
    <Tooltip label={rest['aria-label']} shortcut={shortcut} side={tooltipSide} defaultOpen={tooltipOpen}>
      {button}
    </Tooltip>
  );
});
