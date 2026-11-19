import { CircleAlert } from 'lucide-react';
import { Stepper } from './Stepper';
import './trim-row.css';

/** "1:27:09.2" from seconds. */
export function formatTimecode(seconds: number): string {
  const t = Math.max(0, Math.round(seconds * 10) / 10);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const ss = s.toFixed(1).padStart(4, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** "1:27:09.2" to seconds. */
export function parseTimecode(tc: string): number {
  return tc.split(':').reduce((acc, part) => acc * 60 + Number(part), 0);
}

export interface TrimRowProps {
  /** Seconds into the source. */
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
  /** How far either point may move, in seconds into the source. */
  sourceMin?: number;
  sourceMax?: number;
  /** When the campaign sets a minimum length, a shorter clip shows a --fail note. */
  campaignMinSeconds?: number;
  /** Shortest clip the steppers allow. */
  minLength?: number;
}

/** "Trim" label, Start with I, End with O, and the length in mono at the right. Steps of 0.1 s. */
export function TrimRow({ start, end, onChange, sourceMin = start - 60, sourceMax = end + 60, campaignMinSeconds, minLength = 1 }: TrimRowProps) {
  const length = Math.round((end - start) * 10) / 10;
  const short = campaignMinSeconds !== undefined && length < campaignMinSeconds;
  return (
    <div className="hr-trim">
      <div className="hr-trim__row">
        <span className="hr-trim__label">Trim</span>
        <Stepper label="Start" value={start} min={sourceMin} max={end - minLength} format={formatTimecode} shortcut="I" onChange={(v) => onChange(v, end)} />
        <Stepper label="End" value={end} min={start + minLength} max={sourceMax} format={formatTimecode} shortcut="O" onChange={(v) => onChange(start, v)} />
        <span className="hr-trim__length hr-tnum" data-short={short || undefined}>
          <span className="hr-sr-only">Length </span>
          {length.toFixed(1)} s
        </span>
      </div>
      {short ? (
        <p className="hr-trim__warn">
          <CircleAlert aria-hidden="true" />
          Shorter than the {campaignMinSeconds} s campaign minimum.
        </p>
      ) : null}
    </div>
  );
}
