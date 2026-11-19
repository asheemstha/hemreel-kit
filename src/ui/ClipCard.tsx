import { CircleAlert, CircleCheck, Clock, ImageOff, Send } from 'lucide-react';
import { Children, type ReactNode } from 'react';
import { POST_PLATFORMS, type ClipStage, type PostPlatform } from '@/data/fixtures';
import { useCountdown } from '@/hooks/useCountdown';
import { Checkbox } from './Checkbox';
import { Chip, type ChipTone } from './Chip';
import { ScoreBadge } from './ScoreBadge';
import { Skeleton } from './Skeleton';
import './clip-card.css';

export interface ClipCardClip {
  id: string;
  title: string;
  score: number;
  seconds: number;
  stage: ClipStage;
  /** Where it came from: "Tomo". */
  streamLabel?: string;
}

export interface ClipCardProps {
  clip: ClipCardClip;
  /** A 9:16 still. Without one the card shows an empty frame. */
  still?: string;
  platforms?: PostPlatform[];
  /** "≈ $15 at 10K views". Only for campaigns that pay per view; pass null for pool campaigns. */
  estimate?: string | null;
  selected?: boolean;
  /** Pass it to make the card selectable: a checkbox appears over the still on hover and focus. */
  onSelectedChange?: (selected: boolean) => void;
  /** Keep the checkbox on screen: set it on every card while anything in the grid is selected. */
  selecting?: boolean;
  onOpen?: () => void;
  /** Buttons or a menu under the text: Keep and Skip, Post, More. */
  actions?: ReactNode;
  /** Posted clips: the deadline for submitting the link, in ms since epoch. */
  due?: number;
  /** Weak or skipped clips: the still is dimmed. */
  dim?: boolean;
}

const STAGE_CHIP: Partial<Record<ClipStage, { tone: ChipTone; icon: ReactNode; text: string }>> = {
  kept: { tone: 'neutral', icon: <CircleCheck />, text: 'Kept' },
  posted: { tone: 'neutral', icon: <Send />, text: 'Posted' },
  submitted: { tone: 'ok', icon: <CircleCheck />, text: 'Submitted' },
  'past-window': { tone: 'fail', icon: <CircleAlert />, text: 'Past window' },
};

function DueTimer({ deadline }: { deadline: number }) {
  const { text, expired } = useCountdown(deadline);
  if (expired) return <Chip tone="fail" icon={<CircleAlert />}>Past window</Chip>;
  return <Chip tone="due" icon={<Clock />}>{`${text} to submit`}</Chip>;
}

/**
 * One clip in a grid: the still, its score and length, the title, where it is posted, what it could earn, and its actions.
 * The title opens the clip (and so does a click on the still); the checkbox and the actions are separate targets.
 * Layout: fills its grid cell (use ClipGrid). The selected ring draws 4 px outside the still, inside the card's own padding.
 */
export function ClipCard({ clip, still, platforms, estimate, selected, onSelectedChange, selecting, onOpen, actions, due, dim }: ClipCardProps) {
  const stage = STAGE_CHIP[clip.stage];
  const posted = platforms?.length ? POST_PLATFORMS.filter((p) => platforms.includes(p.value)).map((p) => p.short).join(', ') : '';
  const meta = [clip.streamLabel, posted].filter(Boolean).join(' · ');
  return (
    <article className="hr-clip-card" data-selected={selected || undefined} data-selecting={selecting || undefined} data-dim={dim || undefined}>
      <div className="hr-clip-card__still" data-surface="stage">
        {still ? <img src={still} alt="" draggable={false} /> : <ImageOff className="hr-clip-card__empty" aria-hidden="true" />}
        <span className="hr-clip-card__len hr-tnum">{`${clip.seconds} s`}</span>
      </div>
      <span className="hr-clip-card__score"><ScoreBadge score={clip.score} /></span>
      {onSelectedChange ? (
        <span className="hr-clip-card__check">
          <Checkbox checked={Boolean(selected)} onCheckedChange={onSelectedChange} aria-label={`Select ${clip.title}`} />
        </span>
      ) : null}
      <div className="hr-clip-card__body">
        {onOpen ? (
          <button type="button" className="hr-clip-card__open" aria-label={`Open clip ${clip.title}`} onClick={onOpen}>
            <span className="hr-clip-card__title">{clip.title}</span>
          </button>
        ) : (
          <p className="hr-clip-card__title">{clip.title}</p>
        )}
        {meta ? <p className="hr-clip-card__meta">{meta}</p> : null}
        {estimate ? <p className="hr-clip-card__estimate hr-tnum">{estimate}</p> : null}
        {due !== undefined || stage ? (
          <div className="hr-clip-card__chips">
            {due !== undefined ? <DueTimer deadline={due} /> : stage ? <Chip tone={stage.tone} icon={stage.icon}>{stage.text}</Chip> : null}
          </div>
        ) : null}
        {actions ? <div className="hr-clip-card__actions">{actions}</div> : null}
      </div>
    </article>
  );
}

/** The loading stand-in for a ClipCard, in the same shape. Hidden from assistive tech: the grid carries the "Loading" label. */
export function ClipCardSkeleton() {
  return (
    <div className="hr-clip-card" data-loading="" aria-hidden="true">
      <div className="hr-clip-card__still" />
      <div className="hr-clip-card__body">
        <Skeleton width="86%" />
        <Skeleton width="54%" />
      </div>
    </div>
  );
}

export interface ClipGridProps {
  /** Accessible name of the list: "Clips to review". */
  label: string;
  children: ReactNode;
  /** Announce "Loading clips" while the children are skeletons. */
  loading?: boolean;
}

/**
 * A grid of ClipCards: columns of at least 168 px, as many as fit.
 * Layout: fills the parent's width.
 */
export function ClipGrid({ label, children, loading }: ClipGridProps) {
  if (loading) {
    return (
      <div className="hr-clip-grid" role="status" aria-label={`Loading ${label.toLowerCase()}`}>
        {children}
      </div>
    );
  }
  return (
    <div className="hr-clip-grid" role="list" aria-label={label}>
      {Children.map(children, (child) => (child === null || child === undefined || child === false ? null : <div role="listitem" className="hr-clip-grid__item">{child}</div>))}
    </div>
  );
}
