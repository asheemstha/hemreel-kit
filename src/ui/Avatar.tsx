import './avatar.css';

export type AvatarSize = 20 | 22 | 26 | 28 | 34 | 40;

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  /** Draws the on-air ring: a 2 px gap in the parent's background, then 2 px --live. */
  live?: boolean;
  /** Background behind the avatar, used for the ring gap. Defaults to --surface. */
  on?: 'surface' | 'side' | 'bg' | 'accent-tint' | 'nav-selected';
}

/**
 * A circle with the channel's initial. Decorative: the name is always written next to it.
 * Layout: the live ring draws 4 px outside the circle; leave room in tight rows and avoid `overflow: hidden` on the parent. Set `on` to the parent's background so the gap matches.
 */
export function Avatar({ name, size = 28, live = false, on = 'surface' }: AvatarProps) {
  return (
    <span className="hr-avatar" data-size={size} data-live={live || undefined} data-on={on} aria-hidden="true">
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
