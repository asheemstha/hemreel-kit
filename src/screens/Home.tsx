import { CircleAlert, CircleCheck, CircleDollarSign, Clock, Plus, Radio, Send, Settings2, Video } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Avatar } from '@/ui/Avatar';
import { Banner } from '@/ui/Banner';
import { Button, ButtonLink } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { SectionHeader } from '@/ui/Divider';
import { EmptyState } from '@/ui/EmptyState';
import { JobList, JobRow } from '@/ui/JobRow';
import { LivePill } from '@/ui/LivePill';
import { Meter } from '@/ui/Meter';
import { PayTerms } from '@/ui/PayTerms';
import { scoreBand } from '@/ui/ScoreBadge';
import { Skeleton } from '@/ui/Skeleton';
import { Spinner } from '@/ui/Spinner';
import { StatCard } from '@/ui/StatCard';
import { TopBar } from '@/ui/TopBar';
import { CLIPS, HOME_COUNTS, STREAMS, WATCHED } from '@/data/fixtures';
import { DEADLINES } from '@/data/deadlines';
import { ACCOUNTS_ALL, type Account } from '@/data/posts';
import { listOf, plural, platformName } from '@/data/words';
import { DismissDialog } from '@/flows/DismissDialog';
import { PostDialog } from '@/flows/PostDialog';
import { SubmitLinkDialog } from '@/flows/SubmitLinkDialog';
import { useNow } from '@/hooks/clock';
import { useCountdown } from '@/hooks/useCountdown';
import { ago, deadlineOf, estimateOf, openPosts, useClipStore, useDue, useSummary, wasLate, type ClipRecord, type NightSummary, type Scenario } from '@/state/clips';
import { ScreenFrame, useFrame, useScreenKeys } from './Frame';

const NOTE = `Wed 18 Nov · ${STREAMS.length} streams · ${CLIPS.length} clips`;
const clipCount = (streamId: string) => CLIPS.filter((c) => c.streamId === streamId).length;
const earn = (clips: ClipRecord[]) => clips.reduce((sum, c) => sum + (estimateOf(c) ?? 0), 0);
const platformsOf = (c: ClipRecord) => listOf(openPosts(c).map((p) => platformName(p.platform)));

/** A dialog the Home screen has open: posting clips, handing in a link, or dismissing a clip that is past its window. */
type Flow = { kind: 'post'; ids: string[] } | { kind: 'submit'; id: string } | { kind: 'dismiss'; id: string };

function HomeTop({ due = true }: { due?: boolean }) {
  const { openHelp } = useFrame();
  const links = useDue();
  return <TopBar title="Home" note={NOTE} due={due ? links : null} onHelp={openHelp} />;
}
/** The top bar of the states that show no clips: the designed countdown stays, because the submit window keeps running. */
function StaticTop({ due = true }: { due?: boolean }) {
  const { openHelp } = useFrame();
  return <TopBar title="Home" note={NOTE} due={due ? { links: HOME_COUNTS.postedDue, deadline: DEADLINES.submit } : null} onHelp={openHelp} />;
}

function LinkDueCard({ clip }: { clip: ClipRecord }) {
  const c = useCountdown(deadlineOf(clip) ?? 0);
  return <StatCard label="Link due" icon={<Clock />} value={c.text} note={`${clip.title} · ${platformsOf(clip)}`} tone="due" />;
}

function Stats({ night }: { night: NightSummary }) {
  const { due, kept, review } = night;
  const first = due[0];
  const bands = { strong: 0, maybe: 0, weak: 0 };
  for (const c of review) bands[scoreBand(c.score)] += 1;
  const strong = review.filter((c) => scoreBand(c.score) === 'strong');
  return (
    <div className="sc-stats">
      {first ? <LinkDueCard clip={first} /> : <StatCard label="Link due" icon={<Clock />} value="None" note="No link is waiting" state="zero" />}
      <StatCard label="To post" icon={<Send />} value={String(kept.length)} note={kept.length ? 'Kept clips ready to post' : 'Kept clips show up here'} state={kept.length ? 'ready' : 'zero'} />
      <StatCard label="To review" icon={<Video />} value={String(review.length)} note={review.length ? `${bands.strong} strong · ${bands.maybe} maybe · ${bands.weak} weak` : 'Found clips show up here'} state={review.length ? 'ready' : 'zero'} />
      <StatCard label="Could earn" icon={<CircleDollarSign />} value={`≈ $${earn(strong)}`} note={strong.length ? `${strong.length} strong at 10K views each. A guess.` : 'No strong clips waiting'} state={strong.length ? 'ready' : 'zero'} />
    </div>
  );
}

function RightColumn() {
  const clix = WATCHED[0];
  const lacy = WATCHED[1];
  return (
    <aside className="sc-home__aside" aria-label="Live and pay">
      <Card header={<SectionHeader title="Live now" note="2 channels" />} divided>
        <div className="sc-live-row">
          <Avatar name={clix.channel} size={34} live />
          <div className="sc-live-row__text">
            <strong>{clix.channel}</strong>
            <span className="hr-tnum">{clix.note} · next check {clix.nextCheck}</span>
          </div>
          <LivePill size={16} />
        </div>
        <div className="sc-live-row">
          <Avatar name={lacy.channel} size={34} live />
          <div className="sc-live-row__text">
            <strong>{lacy.channel}</strong>
            <span className="hr-tnum">Rendering clips · {lacy.renderPct}%</span>
            <Meter value={lacy.renderPct} label="Lacy rendering" valueText={`${lacy.renderPct} percent`} height={5} />
          </div>
          <LivePill size={16} />
        </div>
      </Card>
      <Card header={<SectionHeader title="What each stream pays" />} divided>
        {STREAMS.map((s) => <div key={s.id} className="sc-pad"><PayTerms stream={s} clipCount={clipCount(s.id) || undefined} /></div>)}
      </Card>
    </aside>
  );
}

function NeedsYou({ night, start }: { night: NightSummary; start: (flow: Flow) => void }) {
  const navigate = useNavigate();
  const store = useClipStore();
  const now = useNow();
  const { due, past, failed, kept, review } = night;
  const jobs = due.length + past.length + failed.length + (kept.length ? 1 : 0) + (review.length ? 1 : 0);
  const strong = review.filter((c) => scoreBand(c.score) === 'strong').length;
  const keptEarn = earn(kept);
  return (
    <section aria-labelledby="needs-you">
      <SectionHeader id="needs-you" title="Needs you" note={jobs ? `${plural(jobs, 'job')}, most urgent first` : 'Nothing right now'} />
      {jobs ? (
        <JobList>
          {due.map((c) => {
            const posted = Math.min(...openPosts(c).map((p) => p.postedAt));
            const linked = openPosts(c).every((p) => p.url);
            return (
              <JobRow key={c.id} kind="submit" title={c.title} meta={`Posted to ${platformsOf(c)} ${ago(posted, now)}`} clipIds={[c.id]} deadline={deadlineOf(c) ?? 0}
                actionLabel={linked ? 'Submit link' : 'Paste post link'} onAction={() => start({ kind: 'submit', id: c.id })} onDismiss={() => start({ kind: 'dismiss', id: c.id })} />
            );
          })}
          {past.map((c) => (
            <JobRow key={c.id} kind="past-window" title={c.title} meta={`Window closed ${ago(deadlineOf(c) ?? now, now)}`} clipIds={[c.id]}
              onAction={() => start({ kind: 'submit', id: c.id })} onDismiss={() => start({ kind: 'dismiss', id: c.id })} />
          ))}
          {failed.map((c) => (
            <JobRow key={c.id} kind="post-failed" title={c.title} meta={c.uploads.find((u) => u.state === 'failed')?.error} clipIds={[c.id]}
              onAction={() => c.uploads.filter((u) => u.state === 'failed').forEach((u) => store.retryUpload(c.id, u.platform))} onDetails={() => start({ kind: 'post', ids: [c.id] })} />
          ))}
          {kept.length ? (
            <JobRow kind="post" title={`${plural(kept.length, 'kept clip')}, ready to post`} meta={keptEarn ? `≈ $${keptEarn} at 10K views each` : 'Pool campaign. No estimate.'}
              clipIds={kept.map((c) => c.id)} actionLabel={`Post ${plural(kept.length, 'clip')}`} onAction={() => start({ kind: 'post', ids: kept.map((c) => c.id) })} />
          ) : null}
          {review.length ? <JobRow kind="review" title={`${plural(review.length, 'clip')} to review. ${strong} strong.`} onAction={() => navigate('/review')} /> : null}
        </JobList>
      ) : (
        <div className="sc-placeholder"><CircleCheck aria-hidden="true" /> Nothing needs you right now. New clips and links to submit show up here.</div>
      )}
    </section>
  );
}

function RunningWithoutYou({ night, start }: { night: NightSummary; start: (flow: Flow) => void }) {
  const { posting, submitted } = night;
  const uploads = posting.flatMap((c) => c.uploads.filter((u) => u.state === 'uploading'));
  const pct = uploads.length ? Math.round(uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length) : 0;
  const late = submitted.filter((c) => c.posts.some(wasLate)).length;
  return (
    <section aria-labelledby="running">
      <SectionHeader id="running" title="Running without you" />
      <Card divided>
        <div className="sc-run-row">
          <Avatar name="Lacy" size={28} live />
          <span className="sc-run-row__title">Lacy · rendering clips</span>
          <LivePill size={16} />
          <span className="sc-run-row__meter"><Meter value={HOME_COUNTS.renderingPct} label="Lacy rendering" valueText={`${HOME_COUNTS.renderingPct} percent`} /></span>
          <span className="hr-tnum sc-run-row__value">{HOME_COUNTS.renderingPct}%</span>
        </div>
        {posting.length ? (
          <div className="sc-run-row">
            <Send className="sc-run-row__icon" data-quiet="" aria-hidden="true" />
            <span className="sc-run-row__title">Posting {plural(posting.length, 'clip')}</span>
            <span className="sc-run-row__meter"><Meter value={pct} label="Posting" valueText={`${pct} percent`} /></span>
            <span className="hr-tnum sc-run-row__value">{pct}%</span>
            <Button size="sm" onClick={() => start({ kind: 'post', ids: posting.map((c) => c.id) })}>Show</Button>
          </div>
        ) : null}
        {submitted.length ? (
          <div className="sc-run-row">
            <CircleCheck className="sc-run-row__icon" aria-hidden="true" />
            <span className="sc-run-row__title">{plural(submitted.length, 'link')} submitted</span>
            {late ? <Chip icon={<Clock />}>{late} late</Chip> : <Chip tone="ok" icon={<CircleCheck />}>In time</Chip>}
          </div>
        ) : null}
      </Card>
    </section>
  );
}

function HomeBody({ initial, accounts }: { initial?: Flow; accounts?: Account[] }) {
  const night = useSummary();
  // The flow stays in state while its dialog closes, so the dialog keeps its content during the exit.
  const [flow, setFlow] = useState<Flow | null>(initial ?? null);
  const [open, setOpen] = useState(Boolean(initial));
  const start = (next: Flow) => {
    setFlow(next);
    setOpen(true);
  };
  const first = night.due[0];
  // Enter does the highlighted job: the most urgent link.
  useScreenKeys({ 'global.default': () => { if (first) start({ kind: 'submit', id: first.id }); } });
  return (
    <div className="sc-home">
      <div className="sc-home__main">
        <Stats night={night} />
        <NeedsYou night={night} start={start} />
        <RunningWithoutYou night={night} start={start} />
      </div>
      <RightColumn />
      <PostDialog open={open && flow?.kind === 'post'} onOpenChange={setOpen} clipIds={flow?.kind === 'post' ? flow.ids : []} accounts={accounts} />
      <SubmitLinkDialog open={open && flow?.kind === 'submit'} onOpenChange={setOpen} clipId={flow?.kind === 'submit' ? flow.id : null} />
      <DismissDialog open={open && flow?.kind === 'dismiss'} onOpenChange={setOpen} clipId={flow?.kind === 'dismiss' ? flow.id : null} />
    </div>
  );
}

function HomeFor({ title = 'Home', scenario, flow, accounts }: { title?: string; scenario?: Scenario; flow?: Flow; accounts?: Account[] }) {
  return (
    <ScreenFrame title={title} nav="sidebar" current="home" topBar={<HomeTop />} scenario={scenario}>
      <HomeBody initial={flow} accounts={accounts} />
    </ScreenFrame>
  );
}

export const HomeScreen = () => <HomeFor />;
// The money path, one state per route. Each gets a store of its own (a scenario), so nothing here changes the other screens.
const KEPT = ['c9', 'c10'];
export const HomePost = () => <HomeFor title="Home, post" scenario="default" flow={{ kind: 'post', ids: KEPT }} />;
export const HomePostAll = () => <HomeFor title="Home, post to three accounts" scenario="default" flow={{ kind: 'post', ids: KEPT }} accounts={ACCOUNTS_ALL} />;
export const HomePosting = () => <HomeFor title="Home, posting" scenario="posting" flow={{ kind: 'post', ids: KEPT }} />;
export const HomePostFailed = () => <HomeFor title="Home, a post failed" scenario="post-failed" flow={{ kind: 'post', ids: KEPT }} />;
export const HomeLink = () => <HomeFor title="Home, paste the post link" scenario="default" flow={{ kind: 'submit', id: 'c11' }} />;
export const HomeSubmit = () => <HomeFor title="Home, submit the link" scenario="linked" flow={{ kind: 'submit', id: 'c11' }} />;
export const HomeLate = () => <HomeFor title="Home, submit late" scenario="default" flow={{ kind: 'submit', id: 'c12' }} />;
export const HomeDismiss = () => <HomeFor title="Home, dismiss" scenario="default" flow={{ kind: 'dismiss', id: 'c12' }} />;

export function HomeEmpty() {
  return (
    <ScreenFrame title="Home, empty" nav="sidebar" current="home" bare topBar={<StaticTop due={false} />}>
      <div className="sc-home" data-single="">
        <div className="sc-home__main">
          <div className="sc-stats">
            <StatCard label="Link due" icon={<Clock />} value="None" note="Nothing posted yet" state="zero" />
            <StatCard label="To post" icon={<Send />} value="0" note="Kept clips show up here" state="zero" />
            <StatCard label="To review" icon={<Video />} value="0" note="Found clips show up here" state="zero" />
            <StatCard label="Could earn" icon={<CircleDollarSign />} value="$0" note="Nothing kept yet" state="zero" />
          </div>
          <div className="sc-empty">
            <EmptyState
              icon={<Video />}
              title="Nothing needs you yet."
              primary={<ButtonLink href="/new" kind="primary" size="lg" icon={<Plus />} shortcut="⌘N" ariaKeyShortcuts="Meta+N">New clips</ButtonLink>}
              secondary={<ButtonLink href="/live" kind="secondary" size="lg" icon={<Radio />}>Watch a channel</ButtonLink>}
              hints={[
                { icon: <Video />, text: 'Paste a stream link or drop a video' },
                { icon: <Radio />, text: 'Or let hemreel watch a channel while it is live' },
                { icon: <Clock />, text: 'Posted links are due within 30 min' },
              ]}
            >
              Paste a stream link and hemreel finds the moments worth clipping. Kept clips and links to submit show up here.
            </EmptyState>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

export function HomeLoading() {
  return (
    <ScreenFrame title="Home, loading" nav="sidebar" current="home" bare topBar={<StaticTop due={false} />}>
      <div className="sc-home">
        <div className="sc-home__main" role="status" aria-live="polite">
          <p className="sc-status-line"><Spinner size={16} /> Loading tonight's clips</p>
          <div className="sc-stats" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i}><div className="sc-skel-stat"><Skeleton width="50%" /><Skeleton width="40%" height={24} /><Skeleton width="80%" /></div></Card>
            ))}
          </div>
          <div aria-hidden="true" className="sc-stack">
            <Skeleton width={160} height={16} />
            <Card divided>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="sc-skel-row"><Skeleton shape="thumb" width={48} /><div className="sc-stack sc-grow"><Skeleton width={110} height={20} /><Skeleton width="45%" height={16} /><Skeleton width="30%" /></div><Skeleton shape="button" width={160} height={44} /></div>
              ))}
            </Card>
          </div>
        </div>
        <aside className="sc-home__aside" aria-hidden="true">
          <Skeleton shape="card" height={180} />
          <Skeleton shape="card" height={260} />
        </aside>
      </div>
    </ScreenFrame>
  );
}

export function HomeError() {
  return (
    <ScreenFrame title="Home, error" nav="sidebar" current="home" bare topBar={<StaticTop />}>
      <div className="sc-home">
        <div className="sc-home__main">
          <Banner
            tone="fail"
            title="Couldn't load your clips."
            detail="E_WORKSPACE_READ · placeholder detail"
            actions={<><Button kind="secondary" icon={<Settings2 />}>Run system checks</Button><Button kind="primary">Try again</Button></>}
          >
            Your clips are safe on disk. The submit window keeps running, so the due link is still shown at the top.
          </Banner>
          <div className="sc-stats">
            <StatCard label="Link due" icon={<Clock />} value="" state="not-loaded" />
            <StatCard label="To post" icon={<Send />} value="" state="not-loaded" />
            <StatCard label="To review" icon={<Video />} value="" state="not-loaded" />
            <StatCard label="Could earn" icon={<CircleDollarSign />} value="" state="not-loaded" />
          </div>
          <section aria-labelledby="needs-you-err">
            <SectionHeader id="needs-you-err" title="Needs you" />
            <div className="sc-placeholder"><CircleAlert aria-hidden="true" /> Jobs show up here once your clips load.</div>
          </section>
        </div>
        <aside className="sc-home__aside">
          <Card header={<SectionHeader title="What each stream pays" />} divided>
            {STREAMS.map((s) => <div key={s.id} className="sc-pad"><PayTerms stream={s} /></div>)}
          </Card>
        </aside>
      </div>
    </ScreenFrame>
  );
}
