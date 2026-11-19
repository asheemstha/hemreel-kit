import { Info, Minus } from 'lucide-react';
import type { ReactNode } from 'react';
import { FEATURED } from '@/data/fixtures';
import { BandTrack } from './BandTrack';
import { BAND_LABEL, ScoreBadge, scoreBand } from './ScoreBadge';
import './score-card.css';

export interface ScoreSignal { label: string; value: ReactNode }

export const FEATURED_SIGNALS: ScoreSignal[] = [
  { label: 'Chat', value: FEATURED.signals.chat },
  { label: 'Reaction at', value: FEATURED.signals.reactionAt },
  { label: 'Peak', value: FEATURED.signals.peakAt },
  { label: 'Caption words fixed', value: FEATURED.signals.captionWordsFixed },
];

export interface ScoreCardProps {
  /** Omit for an unscored clip. */
  score?: number;
  reason?: ReactNode;
  signals?: ScoreSignal[];
  /** Why there is no score, for example "Daily cap reached." */
  unscoredReason?: string;
}

/**
 * The score as a guess: the number, its band, the reason in plain words, and the note that it is not a promise.
 * Layout: fills the parent's width.
 */
export function ScoreCard({ score, reason = FEATURED.reason, signals = FEATURED_SIGNALS, unscoredReason = 'Daily cap reached.' }: ScoreCardProps) {
  if (score === undefined) {
    return (
      <section className="hr-scorecard" data-unscored="" aria-label="Score">
        <div className="hr-scorecard__unscored">
          <span className="hr-scorecard__dash" aria-hidden="true"><Minus /></span>
          <div className="hr-scorecard__why">
            <div className="hr-scorecard__why-label">Score</div>
            <p className="hr-scorecard__reason">{`Not scored. ${unscoredReason}`}</p>
          </div>
        </div>
        <p className="hr-scorecard__info"><Info aria-hidden="true" />Scoring starts again when the cap resets.</p>
      </section>
    );
  }
  const band = scoreBand(score);
  return (
    <section className="hr-scorecard" data-band={band} aria-label={`Score ${score}, ${BAND_LABEL[band]}`}>
      <div className="hr-scorecard__top">
        <div className="hr-scorecard__score">
          <span className="hr-scorecard__number hr-tnum" aria-hidden="true">{score}</span>
          <ScoreBadge score={score} showWord showNumber={false} />
        </div>
        <div className="hr-scorecard__why">
          <div className="hr-scorecard__why-label">Why this score</div>
          <p className="hr-scorecard__reason">{reason}</p>
        </div>
      </div>
      <BandTrack score={score} />
      {signals.length ? (
        <ul className="hr-scorecard__signals" aria-label="Signals">
          {signals.map((s) => (
            <li key={s.label} className="hr-scorecard__signal hr-tnum">
              {s.label} <strong>{s.value}</strong>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="hr-scorecard__info"><Info aria-hidden="true" />{FEATURED.scoreNote}</p>
    </section>
  );
}
