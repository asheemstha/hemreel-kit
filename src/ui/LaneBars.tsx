import { useLayoutEffect, useRef, useState } from 'react';
import './lane-bars.css';

export interface LaneBarsProps {
  /** One value per bucket, 0 to 1. Any count: the bars are resampled to the lane's real width. */
  values: readonly number[];
  tone: 'audio' | 'chat';
  /** Lane height in px. */
  height: number;
  /** The selected part, as fractions of the lane [start, end]. Bars outside it fade back. */
  range?: readonly [number, number];
  /** How far playback has got, as a fraction of the lane. Bars inside the range and before it are lit. */
  progress?: number;
}

const BAR = 2; // px
const GAP = 2; // px

/** Resamples to `n` bars: the loudest value in each bucket when there are more values than bars,
 *  linear interpolation when there are fewer, then a light 3-tap smoothing so coarse data never looks stepped. */
export function resampleLevels(values: readonly number[], n: number): number[] {
  if (!values.length || n <= 0) return [];
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    if (values.length >= n) {
      const a = Math.floor((i * values.length) / n);
      const b = Math.max(a + 1, Math.floor(((i + 1) * values.length) / n));
      let m = 0;
      for (let j = a; j < b; j++) m = Math.max(m, values[j] ?? 0);
      out.push(m);
    } else {
      const x = (i / Math.max(1, n - 1)) * (values.length - 1);
      const j = Math.floor(x);
      const f = x - j;
      out.push((values[j] ?? 0) * (1 - f) + (values[Math.min(values.length - 1, j + 1)] ?? 0) * f);
    }
  }
  return out.map((v, i) => ((out[i - 1] ?? v) + 2 * v + (out[i + 1] ?? v)) / 4);
}

/**
 * Audio as a waveform: thin rounded bars, evenly spaced, mirrored around the centre line.
 * Chat as activity: the same bars growing up from the bottom.
 * Drawn in real pixels (one <svg>, one rect per bar), so spacing never stretches with the lane.
 * Decorative: the lane is described in text nearby.
 * Layout: fills the parent's width; the parent needs a width.
 */
export function LaneBars({ values, tone, height, range, progress }: LaneBarsProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = Math.max(0, Math.floor((width + GAP) / (BAR + GAP)));
  const bars = resampleLevels(values, n);
  const mirrored = tone === 'audio';
  const usable = height - 4;
  return (
    <svg ref={ref} className="hr-lane-bars" data-tone={tone} width="100%" height={height} viewBox={`0 0 ${Math.max(1, width)} ${height}`} aria-hidden="true" focusable="false">
      {bars.map((v, i) => {
        const h = Math.max(BAR, (0.1 + 0.9 * Math.pow(Math.min(1, Math.max(0, v)), 0.8)) * usable);
        const x = i * (BAR + GAP);
        const f = (x + BAR / 2) / Math.max(1, width);
        const inRange = !range || (f >= range[0] && f <= range[1]);
        const part = !inRange ? 'out' : progress !== undefined && range && f <= progress ? 'played' : 'in';
        return <rect key={i} data-part={part} x={x} width={BAR} y={mirrored ? (height - h) / 2 : height - 2 - h} height={h} rx={BAR / 2} />;
      })}
    </svg>
  );
}
