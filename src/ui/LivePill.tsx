import './live-pill.css';

/**
 * The only place --live is used besides the avatar ring and the rail dot. Never reuse this shape or colour for anything else.
 * Layout: hugs its text.
 */
export function LivePill({ label = 'LIVE', size = 18 }: { label?: string; size?: 16 | 18 | 20 }) {
  return (
    <span className="hr-live" data-size={size}>
      <span className="hr-live__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
