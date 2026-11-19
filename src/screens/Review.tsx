import { ArrowLeft, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/ui/Button';
import { CaptionEditor } from '@/ui/CaptionEditor';
import { Card } from '@/ui/Card';
import { DecisionBar } from '@/ui/DecisionBar';
import { SectionHeader } from '@/ui/Divider';
import { EarnBox } from '@/ui/EarnBox';
import { Field } from '@/ui/Field';
import { ProgressPips } from '@/ui/ProgressPips';
import { QueueList, QueueRow } from '@/ui/QueueRow';
import { ScoreCard } from '@/ui/ScoreCard';
import { scoreBand, type Band } from '@/ui/ScoreBadge';
import { Segmented } from '@/ui/Segmented';
import { Skeleton } from '@/ui/Skeleton';
import { Toast, useToast } from '@/ui/Toast';
import { TopBar } from '@/ui/TopBar';
import { TrimRow } from '@/ui/TrimRow';
import { VideoStage, nextZone, type StageState, type ZoneSetting } from '@/ui/VideoStage';
import { CLIPS, FEATURED, STREAMS, estimateAt10k, type Clip } from '@/data/fixtures';
import { PostDialog } from '@/flows/PostDialog';
import { useClipStore, useDue, useSummary } from '@/state/clips';
import { stillFor } from '@/data/stills';
import { parseTimecode } from '@/ui/TrimRow';
import { ScreenFrame, ScreenShell, useFrame, useScreenKeys } from './Frame';

type Decision = 'kept' | 'skipped';
type Filter = 'all' | Band;
export type ReviewVariant = 'live' | 'empty' | 'loading' | 'error';

const QUEUE: Clip[] = CLIPS.filter((c) => c.stage === 'review');
const stream = (id: string) => STREAMS.find((s) => s.id === id);
const COUNTS = { strong: QUEUE.filter((c) => scoreBand(c.score) === 'strong').length, maybe: QUEUE.filter((c) => scoreBand(c.score) === 'maybe').length, weak: QUEUE.filter((c) => scoreBand(c.score) === 'weak').length };
// Placeholder reasons for clips other than the featured one: the fixtures only carry a reason for c1 (brief section 13).
const REASON: Record<Band, string> = {
  strong: 'Chat picks up fast and the reaction lands early. Reason text for this clip is a placeholder.',
  maybe: 'Some chat movement, but the reaction comes late. Reason text for this clip is a placeholder.',
  weak: 'Quiet chat and no clear reaction. Reason text for this clip is a placeholder.',
};
const FEATURED_START = parseTimecode(FEATURED.start);
const FEATURED_END = parseTimecode(FEATURED.end);

function ReviewTop({ filter, setFilter, decisions, currentIndex }: { filter: Filter; setFilter: (f: Filter) => void; decisions: Record<string, Decision>; currentIndex: number }) {
  const { openHelp } = useFrame();
  const due = useDue();
  const kept = Object.values(decisions).filter((d) => d === 'kept').length;
  const skipped = Object.values(decisions).filter((d) => d === 'skipped').length;
  return (
    <TopBar
      title="Review"
      left={
        <Segmented<Filter>
          label="Show clips"
          value={filter}
          onValueChange={setFilter}
          items={[
            { value: 'all', label: 'All', count: QUEUE.length },
            { value: 'strong', label: 'Strong', count: COUNTS.strong },
            { value: 'maybe', label: 'Maybe', count: COUNTS.maybe },
            { value: 'weak', label: 'Weak', count: COUNTS.weak },
          ]}
        />
      }
      right={
        <>
          <ProgressPips states={QUEUE.map((c) => decisions[c.id] ?? 'todo')} current={currentIndex} />
          <span className="sc-topcount hr-tnum">{kept} kept · {skipped} skipped</span>
        </>
      }
      due={due}
      onHelp={openHelp}
    />
  );
}

function ClipDetails({ clip, trim, setTrim, hookRef, captionId }: { clip: Clip; trim: [number, number]; setTrim: (t: [number, number]) => void; hookRef: React.RefObject<HTMLInputElement | null>; captionId: string }) {
  const s = stream(clip.streamId);
  const featured = clip.id === FEATURED.clipId;
  const band = scoreBand(clip.score);
  return (
    <div className="sc-review__details sc-clip-enter" key={clip.id}>
      <div className="sc-clip-head">
        <p className="sc-clip-head__stream">{s ? `${s.channel} · ${s.title}` : ''}</p>
        <h2 className="sc-clip-head__title">{clip.title}</h2>
        <p className="sc-clip-head__time hr-tnum">
          {featured ? `${FEATURED.length} · ${FEATURED.start.slice(0, 7)} to ${FEATURED.end.slice(0, 7)}` : `${clip.seconds} s`}
        </p>
      </div>
      {s ? <EarnBox pay={s.pay} /> : null}
      <ScoreCard score={clip.score} reason={featured ? FEATURED.reason : REASON[band]} signals={featured ? undefined : []} />
      <Field ref={hookRef} id="hook-text" label="Hook" defaultValue={featured ? FEATURED.hook : clip.title} shortcut="E" key={`hook-${clip.id}`} help="Burned into the first 3 s." />
      <CaptionEditor key={`cap-${clip.id}`} id={captionId} initial={featured ? FEATURED.caption : `${clip.title.toUpperCase()}. ${s?.channel ?? ''} in GTA 6 #ad #gta6 #fyp`} />
      <TrimRow start={trim[0]} end={trim[1]} onChange={(a, b) => setTrim([a, b])} />
    </div>
  );
}

function ReviewBody({ variant }: { variant: ReviewVariant }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  // Decisions start from the clip store, so coming back to Review shows what was already kept and skipped,
  // and /review/empty (the 'review-done' scenario) opens with the whole queue decided.
  const store = useClipStore();
  const night = useSummary();
  const [posting, setPosting] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, Decision>>(() => {
    const made: Record<string, Decision> = {};
    for (const c of store.getState()) if (c.decision !== 'review' && QUEUE.some((q) => q.id === c.id)) made[c.id] = c.decision;
    return made;
  });
  const [currentId, setCurrentId] = useState<string | null>(() => QUEUE.find((c) => !decisions[c.id])?.id ?? null);
  const history = useRef<string[]>([]);
  const [playing, setPlaying] = useState(false);
  const [zone, setZone] = useState<ZoneSetting>('off');
  const [time, setTime] = useState(7.4);
  const [trim, setTrim] = useState<[number, number]>([FEATURED_START, FEATURED_END]);
  const [focusTick, setFocusTick] = useState(0);
  const hookRef = useRef<HTMLInputElement>(null);
  const captionId = 'caption-text';

  const shown = useMemo(() => QUEUE.filter((c) => filter === 'all' || scoreBand(c.score) === filter), [filter]);
  const current = QUEUE.find((c) => c.id === currentId) ?? null;
  const currentIndex = current ? QUEUE.indexOf(current) : -1;

  // move focus to the new current row after Keep, Skip, J, K or Undo
  useEffect(() => {
    if (!focusTick || !currentId) return;
    document.getElementById(`queue-${currentId}`)?.focus();
  }, [focusTick, currentId]);

  const select = (id: string | null, focus = true) => {
    setCurrentId(id);
    setPlaying(false);
    setTime(0);
    const c = QUEUE.find((x) => x.id === id);
    if (c) setTrim(c.id === FEATURED.clipId ? [FEATURED_START, FEATURED_END] : [FEATURED_START, FEATURED_START + c.seconds]);
    if (focus) setFocusTick((n) => n + 1);
  };

  const nextUnreviewed = (from: string, decided: Record<string, Decision>) => {
    const order = shown.length ? shown : QUEUE;
    const i = order.findIndex((c) => c.id === from);
    for (let k = 1; k <= order.length; k++) {
      const c = order[(i + k) % order.length];
      if (c && !decided[c.id]) return c.id;
    }
    return null;
  };

  const decide = (d: Decision) => {
    if (!current || variant !== 'live') return;
    const next = { ...decisions, [current.id]: d };
    setDecisions(next);
    store.decide(current.id, d);
    history.current.push(current.id);
    select(nextUnreviewed(current.id, next));
    toast.show({ message: d === 'kept' ? 'Kept.' : 'Skipped.', actionLabel: 'Undo', actionShortcut: '⌘Z', onAction: undo });
  };

  function undo() {
    const last = history.current.pop();
    if (!last) return;
    store.decide(last, 'review');
    setDecisions((d) => {
      const copy = { ...d };
      delete copy[last];
      return copy;
    });
    select(last);
  }

  const move = (delta: 1 | -1) => {
    if (!shown.length) return;
    const i = shown.findIndex((c) => c.id === currentId);
    const n = shown[Math.max(0, Math.min(shown.length - 1, (i < 0 ? 0 : i) + delta))];
    if (n) select(n.id);
  };

  useScreenKeys(variant === 'live' ? {
    'review.keep': () => decide('kept'),
    'review.skip': () => decide('skipped'),
    'review.next': () => move(1),
    'review.prev': () => move(-1),
    'review.play': () => setPlaying((p) => !p),
    'review.zone': () => setZone((z) => nextZone(z)),
    'review.hook': () => { hookRef.current?.focus(); hookRef.current?.select(); },
    'review.caption': () => document.getElementById(captionId)?.focus(),
    'review.in': () => setTrim(([, b]) => [Math.min(b - 1, FEATURED_START + time), b]),
    'review.out': () => setTrim(([a]) => [a, Math.max(a + 1, FEATURED_START + time)]),
    'review.undo': () => { undo(); toast.dismiss(); },
  } : {});

  const changeFilter = (f: Filter) => {
    setFilter(f);
    const first = QUEUE.find((c) => (f === 'all' || scoreBand(c.score) === f) && !decisions[c.id]);
    if (first && (!current || (f !== 'all' && scoreBand(current.score) !== f))) select(first.id, false);
  };

  const stageState: StageState = variant === 'loading' ? 'loading' : variant === 'error' ? 'error' : !current ? 'clear' : playing ? 'playing' : 'paused';
  const keptCount = Object.values(decisions).filter((d) => d === 'kept').length;
  const skippedCount = Object.values(decisions).filter((d) => d === 'skipped').length;
  const keptEarn = QUEUE.filter((c) => decisions[c.id] === 'kept').reduce((sum, c) => sum + (estimateAt10k(stream(c.streamId)?.pay ?? { kind: 'pool', pool: 0 }) ?? 0), 0);
  const readyToPost = night.kept.length;

  return (
    <>
      <ScreenShell topBar={<ReviewTop filter={filter} setFilter={changeFilter} decisions={decisions} currentIndex={currentIndex} />}>
      <div className="sc-review">
        <section className="sc-review__queue" aria-labelledby="queue-title">
          <SectionHeader id="queue-title" title="Queue" note={`${shown.length} clips · J and K move`} />
          <QueueList currentId={currentId ?? undefined} order={shown.map((c) => c.id)} onMove={(id) => select(id)}>
            {shown.map((c) => (
              <QueueRow key={c.id} clip={c} streamName={stream(c.streamId)?.channel ?? ''} current={c.id === currentId} decision={decisions[c.id] ?? null} onSelect={(id) => select(id)} tabbable={currentId ? undefined : c === shown[0]} />
            ))}
          </QueueList>
        </section>
        <div className="sc-review__stage">
          <VideoStage
            state={stageState}
            still={current ? stillFor(current.id) : undefined}
            alt={current ? `Preview of ${current.title}` : undefined}
            zone={zone}
            onZoneChange={setZone}
            onPlayingChange={setPlaying}
            time={time}
            duration={current?.id === FEATURED.clipId ? 24.2 : current?.seconds ?? 24.2}
            onSeek={setTime}
            loadingLabel="Loading clip 1 of 8"
            clearCounts={`${keptCount} kept · ${skippedCount} skipped`}
            onSkip={() => decide('skipped')}
          />
        </div>
        <div className="sc-review__side">
          {variant === 'loading' ? (
            <div className="sc-review__details" role="status">
              <span className="hr-sr-only">Loading clip details</span>
              <div aria-hidden="true" className="sc-stack">
                <Skeleton width="40%" /><Skeleton width="70%" height={28} /><Skeleton width="50%" />
                <Skeleton shape="card" height={84} /><Skeleton shape="card" height={220} /><Skeleton shape="block" /><Skeleton shape="card" height={140} />
              </div>
            </div>
          ) : current ? (
            <ClipDetails clip={current} trim={trim} setTrim={setTrim} hookRef={hookRef} captionId={captionId} />
          ) : (
            <div className="sc-review__details">
              <Card>
                <div className="sc-done">
                  <h2 className="sc-clip-head__title hr-tnum">{keptCount} kept. {skippedCount} skipped.</h2>
                  <p className="sc-done__earn hr-tnum">≈ ${keptEarn} at 10K views each</p>
                  <p className="sc-done__note">{readyToPost} kept clips are ready to post</p>
                  <div className="sc-done__actions">
                    <Button kind="secondary" size="lg" icon={<ArrowLeft />} onClick={() => navigate('/home')}>Back to Home</Button>
                    <Button kind="primary" size="lg" icon={<Send />} disabled={!readyToPost} onClick={() => setPosting(true)}>Post {readyToPost} kept {readyToPost === 1 ? 'clip' : 'clips'}</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
          {variant === 'empty' ? null : (
            <div className="sc-review__decide">
              <DecisionBar state={variant === 'loading' ? 'loading' : variant === 'error' ? 'keep-off' : 'ready'} onKeep={() => decide('kept')} onSkip={() => decide('skipped')} />
            </div>
          )}
        </div>
      </div>
      </ScreenShell>
      <PostDialog open={posting} onOpenChange={setPosting} clipIds={night.kept.map((c) => c.id)} />
      {variant === 'empty' ? <Toast message="Skipped." actionLabel="Undo" actionShortcut="⌘Z" onAction={() => {}} onDismiss={() => {}} persistent /> : null}
    </>
  );
}

function ReviewScreenFor({ variant, title, helpOpen }: { variant: ReviewVariant; title: string; helpOpen?: boolean }) {
  // The top bar reads the session state, so ReviewBody renders the shell itself.
  return (
    <ScreenFrame title={title} nav="rail" current="review" scope="review" helpOpen={helpOpen} scenario={variant === 'empty' ? 'review-done' : undefined}>
      <ReviewBody variant={variant} />
    </ScreenFrame>
  );
}

export const ReviewScreen = () => <ReviewScreenFor variant="live" title="Review" />;
export const ReviewEmpty = () => <ReviewScreenFor variant="empty" title="Review, queue clear" />;
export const ReviewLoading = () => <ReviewScreenFor variant="loading" title="Review, loading" />;
export const ReviewError = () => <ReviewScreenFor variant="error" title="Review, clip did not render" />;
export const ReviewKeys = () => <ReviewScreenFor variant="live" title="Review, shortcuts" helpOpen />;
