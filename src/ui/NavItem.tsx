import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Kbd } from './Kbd';
import { LivePill } from './LivePill';
import './nav-item.css';

export interface NavItemProps {
  icon: ReactNode;
  label: string;
  /** Route to link to. Without it the item is a button and needs onClick. */
  to?: string;
  onClick?: () => void;
  current?: boolean;
  /** Trailing slot, one of: a count, an accent badge, a LivePill label, or a keycap. */
  count?: number;
  badge?: ReactNode;
  live?: string;
  shortcut?: string;
  ariaKeyShortcuts?: string;
}

/** A 36 px navigation row. Current: filled --nav-selected background and aria-current="page". */
export function NavItem({ icon, label, to, onClick, current, count, badge, live, shortcut, ariaKeyShortcuts }: NavItemProps) {
  let trailing: ReactNode = null;
  if (live) trailing = <LivePill label={live} size={16} />;
  else if (badge !== undefined) trailing = <span className="hr-nav__badge hr-tnum">{badge}</span>;
  else if (count !== undefined) trailing = <span className="hr-nav__count hr-tnum">{count}</span>;
  else if (shortcut) trailing = <Kbd decorative hint>{shortcut}</Kbd>;

  const body = (
    <>
      <span className="hr-nav__icon" aria-hidden="true">{icon}</span>
      <span className="hr-nav__label">{label}</span>
      {trailing ? <span className="hr-nav__trail">{trailing}</span> : null}
    </>
  );
  const shared = {
    className: 'hr-nav',
    'data-current': current || undefined,
    'aria-keyshortcuts': ariaKeyShortcuts ?? shortcut,
  };
  if (to !== undefined) {
    return (
      <Link to={to} aria-current={current ? 'page' : undefined} {...shared}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} {...shared}>
      {body}
    </button>
  );
}
