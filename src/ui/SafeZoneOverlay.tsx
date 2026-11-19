import { SAFE_ZONES, type Platform } from '@/data/fixtures';
import './safe-zone.css';

export const ZONE_LABEL: Record<Platform | 'off', string> = { tiktok: 'TikTok', reels: 'Reels', shorts: 'Shorts', off: 'Off' };

/**
 * Hatched areas where a platform draws its own buttons and text. Approximate: verify against each platform's current guidance.
 * Layout: absolutely positioned. The parent must be `position: relative` and sized to the 9:16 frame (Player does this).
 */
export function SafeZoneOverlay({ platform }: { platform: Platform | 'off' }) {
  if (platform === 'off') return null;
  const z = SAFE_ZONES[platform];
  return (
    <div className="hr-zones" data-platform={platform}>
      <span className="hr-sr-only">{`${ZONE_LABEL[platform]} safe zones shown.`}</span>
      <div className="hr-zones__zone" data-edge="bottom" style={{ top: 0, height: `${z.top}%`, left: 0, right: 0 }} aria-hidden="true">
        <span className="hr-zones__label" data-at="bottom-left">{z.topLabel}</span>
      </div>
      <div
        className="hr-zones__zone"
        data-edge="left"
        style={{ top: `${z.railTop}%`, bottom: `${z.bottom}%`, right: 0, width: `${z.railWidth}%` }}
        aria-hidden="true"
      />
      <div className="hr-zones__zone" data-edge="top" style={{ bottom: 0, height: `${z.bottom}%`, left: 0, right: 0 }} aria-hidden="true">
        <span className="hr-zones__label" data-at="top-left">{z.bottomLabel}</span>
      </div>
    </div>
  );
}
