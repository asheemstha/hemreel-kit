import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { formatTime, spokenTime } from '@/data/timeline';
import { STILLS } from '@/data/stills';
import { LaneBars } from './LaneBars';
import './timeline.css';

export type DetailHandle = 'in' | 'out' | 'playhead';

export interface TimelineDetailProps {
  windowStart: number;
  windowLength?: number;
  /** Seconds. Each is controlled when given, otherwise it starts from defaultValues. */
  inPoint?: number;
  outPoint?: number;
  playhead?: number;
  defaultValues?: { inPoint: number; outPoint: number; playhead: number };
  onInChange?: (s: number) => void;
  onOutChange?: (s: number) => void;
  onPlayheadChange?: (s: number) => void;
  audio: readonly number[];
  chat: readonly number[];
  peak?: { at: number; label: string };
  /** Gallery only: draw a handle mid-drag. */
  dragging?: DetailHandle;
  /** Ruler step in seconds. */
  rulerStep?: number;
  /** Shortest allowed clip in seconds. */
  minLength?: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const tenth = (v: number) => Math.round(v * 10) / 10;

/**
 * The zoomed 60 s window: filmstrip, audio and chat, with in and out handles and the playhead. Handles move 0.1 s per arrow key, 1 s with Shift.
 * Layout: fills the parent's width. Handles and the playhead are placed in percentages of that width.
 */
export function TimelineDetail({
  windowStart, windowLength = 60, inPoint, outPoint, playhead, defaultValues, onInChange, onOutChange, onPlayheadChange,
  audio, chat, peak, dragging: forced, rulerStep = 10, minLength = 1,
}: TimelineDetailProps) {
  const end = windowStart + windowLength;
  const [inner, setInner] = useState(() => defaultValues ?? { inPoint: windowStart + 15, outPoint: windowStart + 40, playhead: windowStart + 20 });
  const [drag, setDrag] = useState<DetailHandle | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const v = {
    in: clamp(inPoint ?? inner.inPoint, windowStart, end),
    out: clamp(outPoint ?? inner.outPoint, windowStart, end),
    playhead: clamp(playhead ?? inner.playhead, windowStart, end),
  };
  const pct = (s: number) => `${((s - windowStart) / windowLength) * 100}%`;
  const frac = (s: number) => (s - windowStart) / windowLength;
  const range = [frac(v.in), frac(v.out)] as const;
  const active = drag ?? forced ?? null;

  const set = (h: DetailHandle, raw: number) => {
    let s = tenth(raw);
    if (h === 'in') s = clamp(s, windowStart, v.out - minLength);
    else if (h === 'out') s = clamp(s, v.in + minLength, end);
    else s = clamp(s, windowStart, end);
    s = tenth(s);
    if (h === 'in') { if (inPoint === undefined) setInner((x) => ({ ...x, inPoint: s })); onInChange?.(s); }
    if (h === 'out') { if (outPoint === undefined) setInner((x) => ({ ...x, outPoint: s })); onOutChange?.(s); }
    if (h === 'playhead') { if (playhead === undefined) setInner((x) => ({ ...x, playhead: s })); onPlayheadChange?.(s); }
  };
  const fromPointer = (h: DetailHandle, clientX: number) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    set(h, windowStart + ((clientX - rect.left) / rect.width) * windowLength);
  };

  const handleProps = (h: DetailHandle, label: string) => ({
    role: 'slider' as const,
    tabIndex: 0,
    'aria-label': label,
    'aria-valuemin': h === 'out' ? v.in + minLength : windowStart,
    'aria-valuemax': h === 'in' ? v.out - minLength : end,
    'aria-valuenow': v[h],
    'aria-valuetext': spokenTime(v[h]),
    'data-dragging': active === h || undefined,
    style: { left: pct(v[h]) },
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 1 : 0.1;
      const map: Record<string, number> = { ArrowRight: v[h] + step, ArrowUp: v[h] + step, ArrowLeft: v[h] - step, ArrowDown: v[h] - step, Home: windowStart, End: end };
      const next = map[e.key];
      if (next === undefined) return;
      e.preventDefault();
      e.stopPropagation();
      set(h, next);
    },
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.focus();
      setDrag(h);
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => { if (drag === h) fromPointer(h, e.clientX); },
    onPointerUp: (e: PointerEvent<HTMLDivElement>) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); setDrag(null); },
    onPointerCancel: () => setDrag(null),
  });

  const ticks: number[] = [];
  for (let t = Math.ceil(windowStart / rulerStep) * rulerStep; t <= end; t += rulerStep) ticks.push(t);
  const frames = Array.from({ length: 16 }, (_, i) => STILLS[i % STILLS.length]);

  return (
    <div className="hr-tl" data-kind="detail">
      <div className="hr-tl__labels" aria-hidden="true">
        <span className="hr-tl__ruler-gap" />
        <span className="hr-tl__label" data-lane="video">Video</span>
        <span className="hr-tl__label" data-lane="detail-bars">Audio</span>
        <span className="hr-tl__label" data-lane="detail-bars">Chat</span>
      </div>
      <div className="hr-tl__track" data-detail="">
        <div className="hr-tl__ruler" aria-hidden="true">
          {ticks.map((t) => <span key={t} className="hr-tl__tick" style={{ left: pct(t) }}>{formatTime(t)}</span>)}
        </div>
        <div className="hr-tl__area" ref={areaRef}>
          <div className="hr-tl__lane" data-lane="video" aria-hidden="true">
            {frames.map((src, i) => <img key={i} src={src} alt="" className="hr-tl__frame" draggable={false} />)}
          </div>
          <div className="hr-tl__lane" data-lane="detail-bars" aria-hidden="true"><LaneBars values={audio} tone="audio" height={32} range={range} progress={frac(v.playhead)} /></div>
          <div className="hr-tl__lane" data-lane="detail-bars" aria-hidden="true">
            <LaneBars values={chat} tone="chat" height={32} range={range} />
            {peak ? <span className="hr-tl__peak" style={{ left: pct(peak.at) }}>{peak.label}</span> : null}
          </div>
          <span className="hr-tl__veil" style={{ left: 0, width: pct(v.in) }} aria-hidden="true" />
          <span className="hr-tl__veil" style={{ left: pct(v.out), right: 0 }} aria-hidden="true" />
          <div className="hr-tl__handle" data-handle="in" {...handleProps('in', 'Start of the clip')}>
            <span className="hr-tl__grip" />
            {active === 'in' ? <span className="hr-tl__bubble" aria-hidden="true">{formatTime(v.in, { tenths: true })}</span> : null}
          </div>
          <div className="hr-tl__handle" data-handle="out" {...handleProps('out', 'End of the clip')}>
            <span className="hr-tl__grip" />
            {active === 'out' ? <span className="hr-tl__bubble" aria-hidden="true">{formatTime(v.out, { tenths: true })}</span> : null}
          </div>
          <div className="hr-tl__handle" data-handle="playhead" {...handleProps('playhead', 'Playhead')}>
            <span className="hr-tl__cap" />
            {active === 'playhead' ? <span className="hr-tl__bubble" aria-hidden="true">{formatTime(v.playhead, { tenths: true })}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
