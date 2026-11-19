import { forwardRef, type ReactNode } from 'react';
import './player.css';

export type PlayerSize = 'review' | 'moments' | 'small';

export interface PlayerProps {
  /** 387 × 688 (review), 191 × 340 (moments result), 174 × 310 (small preview). */
  size?: PlayerSize;
  /** A still shown while there is no footage. In the gallery this is the only picture. */
  still?: string;
  /** A real video file. The kit never loads one; the app passes it in. */
  src?: string;
  /** Describes the clip for screen readers, for example "Clip preview: He did not see that coming". */
  alt?: string;
  /** Overlays drawn above the footage, such as the SafeZoneOverlay. */
  children?: ReactNode;
  /** Stand-in content when there is no picture: loading, error, queue clear. */
  placeholder?: ReactNode;
}

/**
 * The 9:16 frame. Burned-in hook and captions are part of the footage, so the player never draws them.
 * Layout: fixed size per `size` (387×688, 191×340, 174×310). Overlays go in as children.
 */
export const Player = forwardRef<HTMLVideoElement, PlayerProps>(function Player({ size = 'review', still, src, alt = 'Clip preview', children, placeholder }, ref) {
  let media: ReactNode = null;
  if (placeholder) media = <div className="hr-player__placeholder">{placeholder}</div>;
  else if (src) media = <video ref={ref} className="hr-player__media" src={src} poster={still} playsInline muted aria-label={alt} />;
  else if (still) media = <img key={still} className="hr-player__media" src={still} alt={alt} draggable={false} />;
  return (
    <div className="hr-player" data-size={size}>
      {media}
      {placeholder ? null : children}
    </div>
  );
});
