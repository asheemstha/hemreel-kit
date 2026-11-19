import { useState } from 'react';
import { formatTime, type Moment } from '@/data/timeline';
import { Card } from './Card';
import { Checkbox } from './Checkbox';
import { SectionHeader } from './Divider';
import { ScoreBadge, scoreBand } from './ScoreBadge';
import './moment-list.css';

export interface MomentListProps {
  moments: readonly Moment[];
  /** The moment open in the editor. Controlled when given. */
  currentId?: string;
  defaultCurrentId?: string;
  onCurrentChange?: (id: string) => void;
  /** Ids of selected moments. Controlled when given. */
  selected?: ReadonlySet<string>;
  onSelectedChange?: (id: string, selected: boolean) => void;
}

/**
 * "Found 12 moments. 8 strong." Each row: checkbox, start time, title, length, score.
 * Layout: fills its parent and scrolls the rows. The parent needs a definite height (for example a flex column child with `min-height: 0`).
 */
export function MomentList({ moments, currentId, defaultCurrentId, onCurrentChange, selected, onSelectedChange }: MomentListProps) {
  const [innerCurrent, setInnerCurrent] = useState(defaultCurrentId ?? moments[0]?.id ?? '');
  const [innerSelected, setInnerSelected] = useState<ReadonlySet<string>>(() => new Set(moments.filter((m) => m.selected).map((m) => m.id)));
  const current = currentId ?? innerCurrent;
  const sel = selected ?? innerSelected;
  const strong = moments.filter((m) => scoreBand(m.score) === 'strong').length;

  const setCurrent = (id: string) => {
    if (currentId === undefined) setInnerCurrent(id);
    onCurrentChange?.(id);
  };
  const toggle = (id: string, v: boolean) => {
    if (selected === undefined) {
      setInnerSelected((s) => {
        const next = new Set(s);
        if (v) next.add(id);
        else next.delete(id);
        return next;
      });
    }
    onSelectedChange?.(id, v);
  };

  return (
    <Card
      className="hr-moments"
      padded={false}
      header={<SectionHeader title={`Found ${moments.length} moments. ${strong} strong.`} note={<span className="hr-tnum">{sel.size} selected</span>} level={2} />}
    >
      <ul className="hr-moments__list" aria-label="Moments">
        {moments.map((m) => {
          const isSel = sel.has(m.id);
          const isCurrent = m.id === current;
          return (
            <li key={m.id} className="hr-moments__row" data-current={isCurrent || undefined} data-selected={isSel || undefined}>
              <Checkbox checked={isSel} onCheckedChange={(v) => toggle(m.id, v)} aria-label={`Select ${m.title}`} />
              <span className="hr-moments__time">{formatTime(m.start)}</span>
              <button type="button" className="hr-moments__title" aria-current={isCurrent || undefined} onClick={() => setCurrent(m.id)}>
                {m.title}
              </button>
              <span className="hr-moments__len hr-tnum">{Math.round(m.end - m.start)} s</span>
              <ScoreBadge score={m.score} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
