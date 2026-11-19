import { Link } from 'react-router';
import { Avatar } from './Avatar';
import { LivePill } from './LivePill';
import './stream-row.css';

export interface StreamRowProps {
  name: string;
  subtitle: string;
  live?: boolean;
  /** Clips waiting for review. Shown when the stream is offline. */
  count?: number;
  to?: string;
}

/** A sidebar row for one stream: avatar, name, subtitle, then a count or the LIVE pill. */
export function StreamRow({ name, subtitle, live = false, count, to = '/review' }: StreamRowProps) {
  return (
    <Link to={to} className="hr-stream-row">
      <Avatar name={name} size={22} live={live} on="side" />
      <span className="hr-stream-row__text">
        <span className="hr-stream-row__name">{name}</span>
        <span className="hr-stream-row__sub">{subtitle}</span>
      </span>
      {live ? (
        <LivePill size={16} />
      ) : count !== undefined ? (
        <span className="hr-stream-row__count hr-tnum">
          {count}
          <span className="hr-sr-only"> to review</span>
        </span>
      ) : null}
    </Link>
  );
}
