import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { formatTime, spokenTime, STREAM_LENGTH_S, type Moment } from '@/data/timeline';
import { scoreBand } from './ScoreBadge';
import { LaneBars } from './LaneBars';
import './timeline.css';

export interface TimelineOverviewProps {
  moments: readonly Moment[];
  currentId: string;
  /** Start of the detail window, in seconds. Controlled when given. */
  windowStart?: number;
  defaultWindowStart?: number;
  windowLength?: number;
  onWindowChange?: (start: number) => void;
  /** Stream length in seconds. */
  length?: number;
  audio: readonly number[];
  chat: readonly number[];
  /** Ruler step in seconds. */
  rulerStep?: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const hm = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;

/**
 * The whole stream at a glance: moment pins, audio and chat. The outlined box is the detail window; click, drag or use the arrow keys to move it.
 * Layout: fills the parent's width. Pins and the window are placed in percentages of that width.
 */
export function TimelineOverview({
  moments, currentId, windowStart, defaultWindowStart = 0, windowLength = 60, onWindowChange, length = STREAM_LENGTH_S, audio, chat, rulerStep = 1800,
}: TimelineOverviewProps) {
  const [inner, setInner] = useState(defaultWindowStart);
  const [drag, setDrag] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const maxStart = length - windowLength;
  const start = clamp(windowStart ?? inner, 0, maxStart);
  const pct = (s: number) => `${(s / length) * 100}%`;

  const set = (v: number) => {
    const next = Math.round(clamp(v, 0, maxStart));
    if (windowStart === undefined) setInner(next);
    onWindowChange?.(next);
  };
  const fromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    set(((clientX - rect.left) / rect.width) * length - windowLength / 2);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 60 : 10;
    const map: Record<string, number> = {
      ArrowRight: start + step, ArrowUp: start + step, ArrowLeft: start - step, ArrowDown: start - step,
      PageUp: start + 300, PageDown: start - 300, Home: 0, End: maxStart,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    set(next);
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    setDrag(true);
    fromPointer(e.clientX);
  };
  const end = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDrag(false);
  };

  const ticks: number[] = [];
  for (let t = 0; t < length; t += rulerStep) ticks.push(t);

  return (
    <div className="hr-tl" data-kind="overview">
      <div className="hr-tl__labels" aria-hidden="true">
        <span className="hr-tl__ruler-gap" />
        <span className="hr-tl__label" data-lane="moments">Moments</span>
        <span className="hr-tl__label" data-lane="overview-bars">Audio</span>
        <span className="hr-tl__label" data-lane="overview-bars">Chat</span>
      </div>
      <div
        className="hr-tl__track"
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Detail window position"
        aria-valuemin={0}
        aria-valuemax={maxStart}
        aria-valuenow={start}
        aria-valuetext={`${spokenTime(start)} to ${spokenTime(start + windowLength)}`}
        data-dragging={drag || undefined}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => { if (drag) fromPointer(e.clientX); }}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div className="hr-tl__ruler" aria-hidden="true">
          {ticks.map((t) => <span key={t} className="hr-tl__tick" style={{ left: pct(t) }}>{hm(t)}</span>)}
        </div>
        <div className="hr-tl__lane" data-lane="moments" aria-hidden="true">
          {moments.map((m) => {
            const band = scoreBand(m.score);
            const kind = m.id === currentId ? 'current' : !m.selected ? 'unselected' : band === 'strong' ? 'strong' : 'maybe';
            return <span key={m.id} className="hr-tl__pin" data-kind={kind} style={{ left: pct(m.start) }} />;
          })}
        </div>
        <div className="hr-tl__lane" data-lane="overview-bars" aria-hidden="true"><LaneBars values={audio} tone="audio" height={26} /></div>
        <div className="hr-tl__lane" data-lane="overview-bars" aria-hidden="true"><LaneBars values={chat} tone="chat" height={26} /></div>
        <span className="hr-tl__window" style={{ left: pct(start), width: pct(windowLength) }} aria-hidden="true" />
      </div>
      <span className="hr-tl__end hr-tnum" aria-hidden="true">{formatTime(length)}</span>
    </div>
  );
}
