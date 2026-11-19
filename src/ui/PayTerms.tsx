import { CLIPS, formatEstimate, type Pay, type Stream } from '@/data/fixtures';
import './pay-terms.css';

export function money(v: number): string {
  return `$${Number.isInteger(v) ? v.toLocaleString('en-US') : v.toFixed(2)}`;
}

/** "$1.50 per 1K views" or "$12,500 pool". */
export function payRate(pay: Pay): string {
  return pay.kind === 'pool' ? `${money(pay.pool)} pool` : `${money(pay.per1k)} per 1K views`;
}

/** "$3.50 min, $150 max per clip" or "By share of views. No estimate." */
export function payTerms(pay: Pay): string {
  return pay.kind === 'pool' ? 'By share of views. No estimate.' : `${money(pay.min)} min, ${money(pay.max)} max per clip`;
}

function stageCounts(streamId: string): string {
  const of = (stage: string) => CLIPS.filter((c) => c.streamId === streamId && c.stage === stage).length;
  const parts: string[] = [];
  const review = of('review');
  const kept = of('kept');
  const posted = of('posted') + of('submitted') + of('past-window');
  if (review) parts.push(`${review} to review`);
  if (kept) parts.push(`${kept} kept`);
  if (posted) parts.push(`${posted} posted`);
  return parts.length ? parts.join(' · ') : 'No clips yet';
}

export interface PayTermsProps {
  stream: Stream;
  /** Overrides the counted clips. */
  clipCount?: number;
  /** Overrides the stage counts line. */
  stages?: string;
}

/** What one stream pays. Estimates appear only for per-view campaigns; pool campaigns never show one. */
export function PayTerms({ stream, clipCount, stages }: PayTermsProps) {
  const count = clipCount ?? CLIPS.filter((c) => c.streamId === stream.id).length;
  const estimate = formatEstimate(stream.pay);
  return (
    <div className="hr-pay">
      <div className="hr-pay__head">
        <span className="hr-pay__name">{stream.channel}</span>
        <span className="hr-pay__count hr-tnum">{count} {count === 1 ? 'clip' : 'clips'}</span>
      </div>
      <span className="hr-pay__rate hr-tnum">{payRate(stream.pay)}</span>
      <span className="hr-pay__terms hr-tnum">{payTerms(stream.pay)}</span>
      {estimate ? <span className="hr-pay__terms hr-tnum">{estimate}</span> : null}
      <span className="hr-pay__stages hr-tnum">{stages ?? stageCounts(stream.id)}</span>
    </div>
  );
}
