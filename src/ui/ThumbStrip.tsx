import { Fragment } from 'react';
import { CLIPS, type Clip } from '@/data/fixtures';
import { stillFor } from '@/data/stills';
import { scoreBand } from './ScoreBadge';
import { Thumb } from './Thumb';
import './thumb-strip.css';

const REVIEW = CLIPS.filter((c) => c.stage === 'review');

/** Clips in score order, grouped by band with a hairline between bands. */
export function ThumbStrip({ clips = REVIEW, label = 'Clips to review' }: { clips?: Clip[]; label?: string }) {
  const sorted = [...clips].sort((a, b) => b.score - a.score);
  return (
    <ul className="hr-thumbstrip" aria-label={label}>
      {sorted.map((c, i) => {
        const band = scoreBand(c.score);
        const before = sorted[i - 1];
        const divider = before !== undefined && scoreBand(before.score) !== band;
        return (
          <Fragment key={c.id}>
            {divider ? <li className="hr-thumbstrip__divider" aria-hidden="true" /> : null}
            <li className="hr-thumbstrip__item" title={c.title}>
              <Thumb src={stillFor(c.id)} width={36} score={c.score} dim={band === 'weak'} />
            </li>
          </Fragment>
        );
      })}
    </ul>
  );
}
