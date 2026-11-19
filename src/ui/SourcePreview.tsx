import { useId, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import { SOURCE_FRAME } from '@/data/stills';
import './source-preview.css';

import type { FacecamPlacement } from './FacecamLayout';
export type { FacecamPlacement };

/** A region of the 16:9 source frame, in percent of its width and height. */
export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SourcePreviewProps {
  layout: FacecamPlacement;
  /** Rendered width in px. 604 on the Moments screen; the height follows 16:9. */
  width?: number;
  facecam?: Region;
  gameplay?: Region;
  onFacecamChange?: (r: Region) => void;
  onGameplayChange?: (r: Region) => void;
}

/** Where the facecam sits in the source, and the 9:16 slice of gameplay under it. */
export const DEFAULT_FACECAM: Region = { x: 2.1, y: 64.8, w: 25, h: 31.5 };
/** With the facecam band the gameplay slice is 1080 × 1216, about 50% of a 16:9 frame's width. Without it the slice is the full 9:16, about 31.6%. */
export const DEFAULT_GAMEPLAY: Region = { x: 30, y: 0, w: 50, h: 100 };
export const DEFAULT_GAMEPLAY_FULL: Region = { x: 34.2, y: 0, w: 31.6, h: 100 };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const fit = (r: Region): Region => {
  const w = clamp(r.w, 8, 100);
  const h = clamp(r.h, 8, 100);
  return { w, h, x: clamp(r.x, 0, 100 - w), y: clamp(r.y, 0, 100 - h) };
};
const round = (n: number) => Math.round(n * 10) / 10;

interface RegionBoxProps {
  name: string;
  kind: 'facecam' | 'gameplay';
  region: Region;
  onChange: (r: Region) => void;
  frameRef: RefObject<HTMLDivElement | null>;
  hintId: string;
}

function RegionBox({ name, kind, region, onChange, frameRef, hintId }: RegionBoxProps) {
  const drag = useRef<{ mode: 'move' | 'resize'; x: number; y: number; start: Region } | null>(null);
  const [active, setActive] = useState(false);

  const begin = (mode: 'move' | 'resize') => (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode, x: e.clientX, y: e.clientY, start: region };
    setActive(true);
  };
  const move = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    const rect = frameRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    const dx = ((e.clientX - d.x) / rect.width) * 100;
    const dy = ((e.clientY - d.y) / rect.height) * 100;
    if (d.mode === 'move') onChange(fit({ ...d.start, x: d.start.x + dx, y: d.start.y + dy }));
    else {
      // resize from the bottom-right corner, keeping the region's shape so the output crop never stretches
      const k = Math.max((d.start.w + dx) / d.start.w, (d.start.h + dy) / d.start.h);
      const s = clamp(k, 8 / Math.min(d.start.w, d.start.h), Math.min((100 - d.start.x) / d.start.w, (100 - d.start.y) / d.start.h));
      onChange(fit({ ...d.start, w: d.start.w * s, h: d.start.h * s }));
    }
  };
  const end = (e: PointerEvent<HTMLElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current = null;
    setActive(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const dirs: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const dir = dirs[e.key];
    if (!dir) return;
    e.preventDefault();
    e.stopPropagation();
    const step = e.shiftKey ? 5 : 1;
    if (e.altKey) {
      // Alt + Right or Down grows, Alt + Left or Up shrinks, keeping the shape
      const grow = dir[0] + dir[1];
      const s = (region.w + grow * step) / region.w;
      const next = { ...region, w: region.w * s, h: region.h * s };
      if (next.x + next.w > 100 || next.y + next.h > 100 || next.w < 8 || next.h < 8) return;
      onChange(fit(next));
    } else onChange(fit({ ...region, x: region.x + dir[0] * step, y: region.y + dir[1] * step }));
  };

  const style = { left: `${region.x}%`, top: `${region.y}%`, width: `${region.w}%`, height: `${region.h}%` };
  return (
    <div className="hr-source__region" data-kind={kind} data-active={active || undefined} style={style}>
      <button
        type="button"
        className="hr-source__move"
        aria-label={`${name}. Left ${round(region.x)}%, top ${round(region.y)}%, ${round(region.w)}% wide.`}
        aria-describedby={hintId}
        onKeyDown={onKeyDown}
        onPointerDown={begin('move')}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <span className="hr-source__label">{name}</span>
      </button>
      <span
        className="hr-source__handle"
        aria-hidden="true"
        onPointerDown={begin('resize')}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      />
    </div>
  );
}

/**
 * The 16:9 source frame with the facecam and gameplay crop regions. Drag to move, drag the corner to resize, arrow keys nudge.
 * Layout: fixed 16:9 at `width` px (604 by default).
 */
export function SourcePreview({ layout, width = 604, facecam, gameplay, onFacecamChange, onGameplayChange }: SourcePreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const maskId = useId();
  const hintId = useId();
  const [fc, setFc] = useState<Region>(DEFAULT_FACECAM);
  // the gameplay slice has a different shape with and without the facecam band, so each layout keeps its own
  const [gpBy, setGpBy] = useState<Record<'band' | 'full', Region>>({ band: DEFAULT_GAMEPLAY, full: DEFAULT_GAMEPLAY_FULL });
  const gpKey = layout === 'off' ? 'full' : 'band';
  const face = facecam ?? fc;
  const game = gameplay ?? gpBy[gpKey];
  const regions = layout === 'off' ? [game] : [game, face];

  return (
    <div className="hr-source" style={{ width }}>
      <div className="hr-source__frame" ref={frameRef}>
        <img className="hr-source__img" src={SOURCE_FRAME} alt="Source frame from the stream" draggable={false} />
        <svg className="hr-source__dim" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <mask id={maskId}>
              <rect width="100" height="100" fill="white" />
              {regions.map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="black" />)}
            </mask>
          </defs>
          <rect width="100" height="100" mask={`url(#${maskId})`} />
        </svg>
        <RegionBox
          name="Gameplay crop"
          kind="gameplay"
          region={game}
          frameRef={frameRef}
          hintId={hintId}
          onChange={(r) => { if (!gameplay) setGpBy((s) => ({ ...s, [gpKey]: r })); onGameplayChange?.(r); }}
        />
        {layout !== 'off' ? (
          <RegionBox
            name="Facecam"
            kind="facecam"
            region={face}
            frameRef={frameRef}
            hintId={hintId}
            onChange={(r) => { if (!facecam) setFc(r); onFacecamChange?.(r); }}
          />
        ) : null}
      </div>
      <p id={hintId} className="hr-sr-only">Arrow keys move the region, Shift moves it further, Alt with an arrow key resizes it.</p>
    </div>
  );
}
