import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { formatTime, spokenTime } from '@/data/timeline';
import './scrubber.css';

export interface ScrubberMarker {
  at: number;
  label: string;
}

export interface ScrubberProps {
  /** Seconds. Controlled when given. */
  value?: number;
  defaultValue?: number;
  /** Clip length in seconds. */
  max: number;
  onChange?: (seconds: number) => void;
  markers?: readonly ScrubberMarker[];
  label?: string;
  /** Gallery only: draw the dragging state. */
  dragging?: boolean;
  disabled?: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The playhead slider on the stage. Arrow keys move 1 s, Shift + arrow 5 s, Home and End jump. */
export function Scrubber({ value, defaultValue = 0, max, onChange, markers = [], label = 'Playhead', dragging: forceDragging, disabled }: ScrubberProps) {
  const [inner, setInner] = useState(defaultValue);
  const [drag, setDrag] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const current = clamp(value ?? inner, 0, max);
  const pct = max > 0 ? (current / max) * 100 : 0;

  const set = (v: number) => {
    const next = Math.round(clamp(v, 0, max) * 10) / 10;
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const fromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    set(((clientX - rect.left) / rect.width) * max);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const step = e.shiftKey ? 5 : 1;
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = current + step;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = current - step;
    else if (e.key === 'PageUp') next = current + 5;
    else if (e.key === 'PageDown') next = current - 5;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = max;
    if (next === null) return;
    e.preventDefault();
    e.stopPropagation();
    set(next);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    setDrag(true);
    fromPointer(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag) fromPointer(e.clientX);
  };
  const end = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDrag(false);
  };

  return (
    <div
      className="hr-scrubber"
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={current}
      aria-valuetext={`${spokenTime(current)} of ${spokenTime(max)}`}
      aria-disabled={disabled || undefined}
      data-dragging={drag || forceDragging || undefined}
      data-markers={markers.length ? '' : undefined}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="hr-scrubber__track" ref={trackRef}>
        <span className="hr-scrubber__played" style={{ width: `${pct}%` }} />
        {markers.map((m) => (
          <span key={`${m.at}-${m.label}`} className="hr-scrubber__marker" style={{ left: `${(m.at / max) * 100}%` }} aria-hidden="true">
            <span className="hr-scrubber__marker-label">{m.label}</span>
          </span>
        ))}
        <span className="hr-scrubber__thumb" style={{ left: `${pct}%` }}>
          {drag || forceDragging ? <span className="hr-scrubber__time" aria-hidden="true">{formatTime(current, { tenths: true })}</span> : null}
        </span>
      </div>
    </div>
  );
}
