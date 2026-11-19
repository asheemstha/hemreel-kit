import { CircleAlert, Clock, CornerDownLeft, RotateCw, Send, Play, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { stillFor } from '@/data/stills';
import { Button } from './Button';
import { Chip } from './Chip';
import { Countdown } from './Countdown';
import { Thumb } from './Thumb';
import { ThumbStrip } from './ThumbStrip';
import './job-row.css';

export type JobKind = 'submit' | 'past-window' | 'post-failed' | 'post' | 'review';

export interface JobRowProps {
  kind: JobKind;
  title: ReactNode;
  /** One line of 13 px meta, for example "Posted to TikTok 17 min ago". */
  meta?: ReactNode;
  /** Clip ids for the thumbs (one for submit and past-window, several for post). */
  clipIds?: string[];
  /** Submit rows: deadline in ms since epoch. When it passes the row turns into a past-window row. */
  deadline?: number;
  /** Text and handler for the main action. Defaults follow the kind. */
  actionLabel?: string;
  onAction?: () => void;
  /** Past-window rows: second action. */
  onDismiss?: () => void;
  /** Post-failed rows: opens the upload status, next to "Try again". */
  onDetails?: () => void;
  /** Meta used after a submit row expires. */
  expiredMeta?: ReactNode;
}

const CHIP: Record<JobKind, { tone: 'due' | 'fail' | 'neutral' | 'ink'; icon: ReactNode; text: string }> = {
  submit: { tone: 'due', icon: <Clock />, text: 'Submit link' },
  'past-window': { tone: 'fail', icon: <CircleAlert />, text: 'Past submit window' },
  'post-failed': { tone: 'fail', icon: <CircleAlert />, text: 'Did not post' },
  post: { tone: 'neutral', icon: <Send />, text: 'Post' },
  review: { tone: 'neutral', icon: <Play />, text: 'Review' },
};

/**
 * A row of the Home "Needs you" list: submit a link, a link past its window, an upload that failed, clips to post, clips to review.
 * Wrap rows in JobList.
 */
export function JobRow({ kind: initialKind, title, meta, clipIds = [], deadline, actionLabel, onAction, onDismiss, onDetails, expiredMeta }: JobRowProps) {
  const [expired, setExpired] = useState(false);
  const kind: JobKind = initialKind === 'submit' && expired ? 'past-window' : initialKind;
  const chip = CHIP[kind];
  const shownMeta = initialKind === 'submit' && expired ? (expiredMeta ?? 'The submit window closed just now') : meta;

  return (
    <li className="hr-job" data-kind={kind}>
      <div className="hr-job__media">
        {kind === 'review' ? null : clipIds.slice(0, 3).map((id, i) => (
          <Thumb key={id} src={stillFor(id)} width={kind === 'post' || kind === 'post-failed' ? 36 : 48} selected={kind === 'submit' && i === 0} dim={kind === 'past-window'} />
        ))}
      </div>
      <div className="hr-job__text">
        <Chip tone={chip.tone} icon={chip.icon}>{chip.text}</Chip>
        <div className="hr-job__title">{title}</div>
        {shownMeta ? <div className="hr-job__meta hr-tnum">{shownMeta}</div> : null}
        {kind === 'review' ? <div className="hr-job__strip"><ThumbStrip /></div> : null}
      </div>
      {kind === 'submit' && deadline !== undefined ? (
        <div className="hr-job__slot"><Countdown deadline={deadline} onExpire={() => setExpired(true)} /></div>
      ) : null}
      <div className="hr-job__actions">
        {kind === 'submit' ? (
          <Button kind="primary" size="lg" shortcut="↵" ariaKeyShortcuts="Enter" icon={<CornerDownLeft />} onClick={onAction}>{actionLabel ?? 'Paste post link'}</Button>
        ) : null}
        {kind === 'past-window' ? (
          <>
            <Button kind="ghost" size="lg" icon={<X />} onClick={onDismiss}>Dismiss</Button>
            <Button kind="secondary" size="lg" onClick={onAction}>{initialKind === 'submit' ? 'Submit late' : (actionLabel ?? 'Submit late')}</Button>
          </>
        ) : null}
        {kind === 'post-failed' ? (
          <>
            {onDetails ? <Button kind="ghost" size="lg" onClick={onDetails}>Details</Button> : null}
            <Button kind="secondary" size="lg" icon={<RotateCw />} onClick={onAction}>{actionLabel ?? 'Try again'}</Button>
          </>
        ) : null}
        {kind === 'post' ? <Button kind="secondary" size="lg" icon={<Send />} onClick={onAction}>{actionLabel ?? 'Post clips'}</Button> : null}
        {kind === 'review' ? <Button kind="secondary" size="lg" icon={<Play />} onClick={onAction}>{actionLabel ?? 'Start review'}</Button> : null}
      </div>
    </li>
  );
}

/**
 * The "Needs you" list.
 * Layout: fills the parent's width. Children must be JobRow (`<li>`).
 */
export function JobList({ children, label = 'Needs you' }: { children: ReactNode; label?: string }) {
  return <ul className="hr-joblist" aria-label={label}>{children}</ul>;
}
