import { CircleAlert, Clock, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import './banner.css';

export type BannerTone = 'fail' | 'due' | 'neutral';

export interface BannerProps {
  tone?: BannerTone;
  title: ReactNode;
  children?: ReactNode;
  /** A mono detail line, for example an error code. */
  detail?: ReactNode;
  actions?: ReactNode;
  /** Override the tone's icon. */
  icon?: ReactNode;
}

const ICON: Record<BannerTone, ReactNode> = { fail: <CircleAlert />, due: <Clock />, neutral: <Info /> };

/**
 * A full-width message. Failures are announced right away with role="alert".
 * Layout: fills the parent's width.
 */
export function Banner({ tone = 'neutral', title, children, detail, actions, icon }: BannerProps) {
  return (
    <div className="hr-banner" data-tone={tone} role={tone === 'fail' ? 'alert' : 'status'}>
      <span className="hr-banner__icon" aria-hidden="true">{icon ?? ICON[tone]}</span>
      <div className="hr-banner__text">
        <div className="hr-banner__title">{title}</div>
        {children ? <div className="hr-banner__body">{children}</div> : null}
        {detail ? <div className="hr-banner__detail">{detail}</div> : null}
      </div>
      {actions ? <div className="hr-banner__actions">{actions}</div> : null}
    </div>
  );
}
