import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';
import { TIMING } from '@/styles/timing';
import { Kbd } from './Kbd';
import './tooltip.css';

export type TooltipSide = 'top' | 'bottom' | 'right' | 'left';

export interface TooltipProps {
  /** The element that opens the tooltip. Must be a focusable element that accepts a ref. */
  children: ReactElement;
  label: ReactNode;
  shortcut?: string;
  side?: TooltipSide;
  /** Gallery only: keep it open so the state can be seen. */
  defaultOpen?: boolean;
}

/**
 * Ink tooltip with the label and its keycap. Opens after 400 ms. Supplementary only: the trigger also carries an aria-label.
 * Layout: wraps a single focusable element that accepts a ref (a button or link). The popup portals to <body>.
 */
export function Tooltip({ children, label, shortcut, side = 'top', defaultOpen }: TooltipProps) {
  return (
    <BaseTooltip.Root defaultOpen={defaultOpen}>
      <BaseTooltip.Trigger delay={TIMING.tooltipDelay} render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={8} className="hr-tooltip__pos">
          <BaseTooltip.Popup className="hr-tooltip">
            <span>{label}</span>
            {shortcut ? <Kbd tone="ink" decorative>{shortcut}</Kbd> : null}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <BaseTooltip.Provider delay={TIMING.tooltipDelay}>{children}</BaseTooltip.Provider>;
}
