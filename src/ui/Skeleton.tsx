import type { CSSProperties } from 'react';
import './skeleton.css';

export type SkeletonShape = 'text' | 'thumb' | 'button' | 'avatar' | 'card' | 'block';

/** A pulsing block in --line. Hidden from assistive tech: the loading region carries role="status" and a text label. */
export function Skeleton({ shape = 'text', width, height }: { shape?: SkeletonShape; width?: number | string; height?: number | string }) {
  const style: CSSProperties = {};
  if (width !== undefined) style.width = width;
  if (height !== undefined) style.height = height;
  return <span className="hr-skeleton" data-shape={shape} style={style} aria-hidden="true" />;
}
