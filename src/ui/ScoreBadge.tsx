import './score-badge.css';

export type Band = 'strong' | 'maybe' | 'weak';
export const BAND_LABEL: Record<Band, string> = { strong: 'Strong', maybe: 'Maybe', weak: 'Weak' };

/** Strong 65 to 100, Maybe 40 to 64, Weak 0 to 39. A score is an AI guess, so bands never use status colours. */
export function scoreBand(score: number): Band {
  return score >= 65 ? 'strong' : score >= 40 ? 'maybe' : 'weak';
}

const BARS: Record<Band, number> = { strong: 3, maybe: 2, weak: 1 };

export function BandBars({ band, size = 12 }: { band: Band; size?: number }) {
  const n = BARS[band];
  return (
    <svg className="hr-bars" width={size} height={Math.round((size * 11) / 12)} viewBox="0 0 12 11" fill="currentColor" aria-hidden="true">
      <rect x="0" y="7" width="3" height="4" rx=".8" />
      <rect x="4.5" y="3.5" width="3" height="7.5" rx=".8" opacity={n >= 2 ? 1 : 0.28} />
      <rect x="9" y="0" width="3" height="11" rx=".8" opacity={n >= 3 ? 1 : 0.28} />
    </svg>
  );
}

/** Layout: hugs its content. */
export function ScoreBadge({ score, showWord = false, showNumber = true }: { score: number; showWord?: boolean; showNumber?: boolean }) {
  const band = scoreBand(score);
  return (
    <span className="hr-score hr-tnum" data-band={band}>
      <span className="hr-sr-only">{`Score ${score}, ${BAND_LABEL[band]}`}</span>
      <BandBars band={band} />
      {showNumber ? <span aria-hidden="true">{score}</span> : null}
      {showWord ? <span className="hr-score__word" aria-hidden="true">{BAND_LABEL[band]}</span> : null}
    </span>
  );
}
