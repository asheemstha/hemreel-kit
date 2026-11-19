import { BAND_LABEL, scoreBand } from './ScoreBadge';
import './band-track.css';

/** Where a score sits across the three bands: Weak 0 to 39, Maybe 40 to 64, Strong 65 to 100. */
export function BandTrack({ score }: { score: number }) {
  const band = scoreBand(score);
  const left = Math.max(0, Math.min(100, score));
  return (
    <div className="hr-bandtrack">
      <span className="hr-sr-only">{`Score ${score} of 100, in the ${BAND_LABEL[band]} band`}</span>
      <div className="hr-bandtrack__bar" aria-hidden="true">
        <span className="hr-bandtrack__seg" data-band="weak" />
        <span className="hr-bandtrack__seg" data-band="maybe" />
        <span className="hr-bandtrack__seg" data-band="strong" />
        <span className="hr-bandtrack__marker" style={{ left: `${left}%` }} />
      </div>
      <div className="hr-bandtrack__labels" aria-hidden="true">
        <span data-band="weak" data-on={band === 'weak' || undefined}>Weak</span>
        <span data-band="maybe" data-on={band === 'maybe' || undefined}>Maybe</span>
        <span data-band="strong" data-on={band === 'strong' || undefined}>Strong</span>
      </div>
    </div>
  );
}
