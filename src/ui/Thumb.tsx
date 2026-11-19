import { ImageOff } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';
import './thumb.css';

export type ThumbWidth = 27 | 36 | 48;

export interface ThumbProps {
  src?: string;
  width?: ThumbWidth;
  /** Ring: 2 px --surface gap, then 2 px --ink. */
  selected?: boolean;
  /** Opacity .6 for weak or skipped clips. */
  dim?: boolean;
  loading?: boolean;
  score?: number;
  /** Alternative text. Thumbs next to a written title are decorative, so this defaults to empty. */
  alt?: string;
}

/**
 * A 9:16 still on the neutral stage colour.
 * Layout: the selected ring draws 4 px outside the frame. Do not put it in a parent with `overflow: hidden` unless that parent leaves 4 px of padding.
 */
export function Thumb({ src, width = 36, selected, dim, loading, score, alt = '' }: ThumbProps) {
  const frame = (
    <span className="hr-thumb" data-w={width} data-selected={selected || undefined} data-dim={dim || undefined} data-loading={loading || undefined}>
      {loading ? null : src ? <img src={src} alt={alt} draggable={false} /> : <ImageOff className="hr-thumb__empty" aria-hidden="true" />}
    </span>
  );
  if (score === undefined) return frame;
  return (
    <span className="hr-thumb-wrap">
      {frame}
      <ScoreBadge score={score} />
    </span>
  );
}
