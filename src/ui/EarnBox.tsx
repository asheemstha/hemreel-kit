import { estimateAt10k, type Pay } from '@/data/fixtures';
import './earn-box.css';

const money = (v: number) => '$' + (Number.isInteger(v) ? v.toLocaleString('en-US') : v.toFixed(2));

/** Plain-words pay terms, for example "$1.50 per 1K views, $3.50 min, $150 max per clip". */
function earnTerms(pay: Pay): string {
  if (pay.kind === 'pool') return `${money(pay.pool)} pool by share of views`;
  return `${money(pay.per1k)} per 1K views, ${money(pay.min)} min, ${money(pay.max)} max per clip`;
}

/** What a clip could earn. Only per-view campaigns get an estimate. */
export function EarnBox({ pay }: { pay: Pay }) {
  const v = estimateAt10k(pay);
  return (
    <div className="hr-earnbox" data-kind={pay.kind}>
      {v === null ? (
        <div className="hr-earnbox__none">Pool campaign. No estimate.</div>
      ) : (
        <div className="hr-earnbox__line">
          <span className="hr-earnbox__value hr-tnum">{'≈ ' + money(v)}</span>
          <span className="hr-earnbox__at">at 10K views</span>
        </div>
      )}
      <div className="hr-earnbox__terms hr-tnum">{earnTerms(pay)}</div>
    </div>
  );
}
