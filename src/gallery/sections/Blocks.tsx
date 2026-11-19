import { Captions, Check, Image, LayoutPanelTop, Megaphone, MessageSquareText, ScanSearch, Send, SkipForward } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { DEADLINES } from '@/data/deadlines';
import { CLIPS, FEATURED, STREAMS, formatEstimate, type Clip } from '@/data/fixtures';
import { stillFor } from '@/data/stills';
import { useSelection } from '@/hooks/useSelection';
import { Accordion } from '@/ui/Accordion';
import { BackLink, Breadcrumb } from '@/ui/Breadcrumb';
import { BulkAction, BulkBar } from '@/ui/BulkBar';
import { Button } from '@/ui/Button';
import { ClipCard, ClipCardSkeleton, ClipGrid } from '@/ui/ClipCard';
import { CopyButton } from '@/ui/CopyButton';
import { InlineEdit } from '@/ui/InlineEdit';
import { LogViewer, type LogLine } from '@/ui/LogViewer';
import { LoadMore, Pagination } from '@/ui/Pagination';
import { PipelineSteps, type PipelineStep } from '@/ui/PipelineSteps';
import { Tabs } from '@/ui/Tabs';
import { ToastHost, useToast } from '@/ui/Toast';
import { GalleryGroup, GallerySection, Row, Specimen, Stack } from '../Specimen';

const noop = () => {};
const REVIEW = CLIPS.filter((c) => c.stage === 'review');
const stream = (c: Clip) => STREAMS.find((s) => s.id === c.streamId);
const estimate = (c: Clip) => {
  const s = stream(c);
  return s ? formatEstimate(s.pay) : null;
};
const clipById = (id: string) => CLIPS.find((c) => c.id === id) ?? CLIPS[0]!;
const card = (c: Clip) => ({ ...c, streamLabel: stream(c)?.channel });

/* ---- Tabs ---- */

function ClipTitles({ stage, empty }: { stage: Clip['stage'] | 'posted-any'; empty: string }) {
  const list = CLIPS.filter((c) => (stage === 'posted-any' ? c.stage === 'posted' || c.stage === 'past-window' : c.stage === stage));
  if (list.length === 0) return <p className="g-section__note">{empty}</p>;
  return (
    <ul className="g-stack" data-gap="8">
      {list.map((c) => <li key={c.id}>{`${c.title} · ${c.seconds} s · ${stream(c)?.channel ?? ''}`}</li>)}
    </ul>
  );
}

const INBOX_TABS = [
  { value: 'review', label: 'To review', count: 8, panel: <ClipTitles stage="review" empty="Nothing to review." /> },
  { value: 'kept', label: 'Kept', count: 2, panel: <ClipTitles stage="kept" empty="Nothing kept yet." /> },
  { value: 'posted', label: 'Posted', count: 2, panel: <ClipTitles stage="posted-any" empty="Nothing posted yet." /> },
  { value: 'submitted', label: 'Submitted', count: 2, panel: <ClipTitles stage="submitted" empty="Nothing submitted yet." /> },
];

/* ---- Accordion ---- */

const WORKFLOW_SECTIONS = [
  { id: 'find', title: 'Find moments', icon: <ScanSearch />, summary: '12 clips, 20 to 30 s each', children: 'Looks for chat spikes and loud reactions, then keeps the 12 strongest moments. Clips run 20 to 30 seconds with at least 45 seconds between them.' },
  { id: 'layout', title: 'Layout and facecam', icon: <LayoutPanelTop />, summary: 'Facecam on top', children: 'The facecam takes the top third and gameplay fills the rest. The facecam box was found on the sample frame and can be moved.' },
  { id: 'captions', title: 'Captions', icon: <Captions />, summary: 'Arial Black, 2 words at a time', children: 'Burned in at the middle of the frame, white with a black outline. The word being said pops in yellow. Swear words are bleeped out.' },
  { id: 'overlays', title: 'Overlays', icon: <Image />, summary: 'Campaign logo, top right', children: 'The campaign logo sits in the top right corner at 18% of the width for the whole clip.' },
  { id: 'campaign', title: 'Campaign', icon: <Megaphone />, summary: '$1.50 per 1K views', children: 'Tomo launch night pays $1.50 per 1K views, with a $3.50 minimum and a $150 maximum per clip. Links are due 30 minutes after posting.' },
  { id: 'copy', title: 'Post copy', icon: <MessageSquareText />, summary: '#ad first, then 3 tags', children: FEATURED.caption },
];

/* ---- Pagination ---- */

function LivePager({ pages, start, label }: { pages: number; start: number; label: string }) {
  const [page, setPage] = useState(start);
  return <Pagination page={page} pageCount={pages} onPageChange={setPage} label={label} />;
}

function LiveLoadMore() {
  const [shown, setShown] = useState(48);
  return <LoadMore shown={shown} total={212} onLoadMore={() => setShown((v) => Math.min(212, v + 24))} />;
}

/* ---- PipelineSteps ---- */

const FINDING: PipelineStep[] = [
  { id: 'queued', label: 'Queued', state: 'done' },
  { id: 'download', label: 'Downloading', state: 'done', detail: '3:12:40 of video, 4.2 GB' },
  { id: 'chat', label: 'Reading chat', state: 'done', detail: '18,204 messages' },
  { id: 'transcribe', label: 'Transcribing', state: 'running', progress: 41, detail: '1:19:00 of 3:12:40' },
  { id: 'find', label: 'Finding moments', state: 'queued' },
  { id: 'score', label: 'Scoring', state: 'queued' },
];
const RENDER_FAILED: PipelineStep[] = [
  { id: 'find', label: 'Finding moments', state: 'done', detail: 'Found 12 moments. 8 strong.' },
  { id: 'score', label: 'Scoring', state: 'skipped', detail: 'AI scoring is off in Settings.' },
  { id: 'render', label: 'Rendering', state: 'failed', detail: 'Stopped on clip 4 of 10. There is no space left on the disk.' },
  { id: 'done', label: 'Done', state: 'queued' },
];
const ALL_DONE: PipelineStep[] = [
  { id: 'download', label: 'Downloading', state: 'done' },
  { id: 'find', label: 'Finding moments', state: 'done', detail: 'Found 12 moments. 8 strong.' },
  { id: 'render', label: 'Rendering', state: 'done', detail: '10 of 10 clips' },
  { id: 'done', label: 'Done', state: 'done' },
];
const WAITING: PipelineStep[] = FINDING.map((s) => ({ id: s.id, label: s.label, state: 'queued' }));
const UNKNOWN: PipelineStep[] = [
  { id: 'queued', label: 'Queued', state: 'done' },
  { id: 'download', label: 'Downloading', state: 'running', detail: 'Waiting for the stream to answer' },
  { id: 'find', label: 'Finding moments', state: 'queued' },
];

/* ---- InlineEdit ---- */

function LiveName({ initial, label, size, disabled, defaultEditing, maxLength }: { initial: string; label: string; size?: 'title' | 'heading' | 'body'; disabled?: boolean; defaultEditing?: boolean; maxLength?: number }) {
  const [name, setName] = useState(initial);
  return <InlineEdit value={name} onSave={setName} label={label} size={size} disabled={disabled} defaultEditing={defaultEditing} maxLength={maxLength} />;
}

/* ---- ClipCard ---- */

/** Single cards are shown at grid width, not at the full width of the specimen. */
function OneCard({ children }: { children: ReactNode }) {
  return <div style={{ width: 184, display: 'flex' }}>{children}</div>;
}

const keepSkip = (
  <>
    <Button size="sm" icon={<Check />}>Keep</Button>
    <Button size="sm" kind="ghost" icon={<SkipForward />}>Skip</Button>
  </>
);

function LiveCard({ id }: { id: string }) {
  const [on, setOn] = useState(false);
  const c = clipById(id);
  return <ClipCard clip={card(c)} still={stillFor(c.id)} estimate={estimate(c)} selected={on} onSelectedChange={setOn} onOpen={noop} actions={keepSkip} />;
}

function ReviewGrid() {
  const ids = REVIEW.map((c) => c.id);
  const sel = useSelection(ids, ['c2', 'c3']);
  return (
    <Stack gap={16}>
      <ClipGrid label="Clips to review">
        {REVIEW.map((c) => (
          <ClipCard
            key={c.id}
            clip={card(c)}
            still={stillFor(c.id)}
            estimate={estimate(c)}
            selected={sel.isSelected(c.id)}
            selecting={sel.count > 0}
            onSelectedChange={(on) => sel.toggle(c.id, on)}
            onOpen={noop}
            dim={c.score < 40}
          />
        ))}
      </ClipGrid>
      <Row>
        <BulkBar count={sel.count} onClear={sel.clear} inline label="Actions for the selected clips">
          <BulkAction icon={<Check />} onClick={sel.clear}>Keep</BulkAction>
          <BulkAction icon={<SkipForward />} onClick={sel.clear}>Skip</BulkAction>
          <BulkAction danger onClick={sel.clear}>Delete</BulkAction>
        </BulkBar>
        {sel.count === 0 ? <p className="g-section__note">Tick a clip and the bulk bar appears here.</p> : null}
      </Row>
    </Stack>
  );
}

/* ---- LogViewer ---- */

const RUN_LOG: LogLine[] = [
  { t: '21:04:11', level: 'info', text: 'Queued Tomo · GTA VI launch night with the workflow Tomo launch night.' },
  { t: '21:04:12', level: 'info', text: '[download] Destination: sources/tomo-gta-vi-launch-night.mp4' },
  { t: '21:06:40', level: 'info', text: '[download] 41.0% of 4.20GiB at 11.92MiB/s ETA 03:28' },
  { t: '21:10:09', level: 'info', text: '[download] 100% of 4.20GiB in 05:57' },
  { t: '21:10:10', level: 'info', text: 'Read 18,204 chat messages.' },
  { t: '21:10:11', level: 'info', text: 'Transcribing 3:12:40 of audio.' },
  { t: '21:31:52', level: 'warn', text: 'The audio drops out from 2:41:10 to 2:41:55. No captions for that stretch.' },
  { t: '21:38:03', level: 'info', text: 'Found 12 moments. 8 strong.' },
  { t: '21:38:04', level: 'info', text: 'Rendering 10 clips.' },
  { t: '21:41:47', level: 'error', text: 'ffmpeg exited with code 1 on clip 4 of 10: av_interleaved_write_frame(): No space left on device' },
  { t: '21:41:47', level: 'info', text: 'Stopped. 3 of 10 clips are rendered and safe to review.' },
];
const MORE_LINES: LogLine[] = [
  { t: '21:52:30', level: 'info', text: 'Freed 12.4 GB by removing 3 old source videos.' },
  { t: '21:52:31', level: 'info', text: 'Rendering clip 4 of 10 again.' },
  { t: '21:53:02', level: 'info', text: 'frame= 720 fps= 58 time=00:00:24.00 speed=1.94x' },
  { t: '21:53:03', level: 'info', text: 'Clip 4 of 10 rendered.' },
];

function LiveLog() {
  const [lines, setLines] = useState(RUN_LOG);
  const add = () => setLines((prev) => [...prev, MORE_LINES[(prev.length - RUN_LOG.length) % MORE_LINES.length] ?? MORE_LINES[0]!]);
  return (
    <Stack gap={12}>
      <LogViewer title="Run log" lines={lines} maxHeight={188} onSave={noop} />
      <Row>
        <Button size="sm" onClick={add}>Add a line</Button>
        <p className="g-section__note">Scroll the log up, then add lines: it stops following and offers a way back.</p>
      </Row>
    </Stack>
  );
}

/** The real thing: fixed at the bottom centre. Keep shows a toast, which sits above the bar. */
function FloatingBulk() {
  const [on, setOn] = useState(false);
  const toast = useToast();
  return (
    <>
      <Button aria-pressed={on} onClick={() => setOn((v) => !v)}>{on ? 'Hide the floating bar' : 'Show it floating'}</Button>
      {on ? (
        <BulkBar count={2} onClear={() => setOn(false)} label="Bulk actions, floating example">
          <BulkAction icon={<Check />} onClick={() => toast.show({ message: '2 clips kept.', actionLabel: 'Undo', actionShortcut: '⌘Z', onAction: () => {} })}>Keep</BulkAction>
          <BulkAction icon={<SkipForward />}>Skip</BulkAction>
          <BulkAction danger>Delete</BulkAction>
        </BulkBar>
      ) : null}
    </>
  );
}

export function BlocksSection() {
  return (
    <GalleryGroup id="blocks" title="Navigation and content">
      <GallerySection id="tabs" title="Tabs" note="Page-level tabs with counts and a panel each. One soft pill slides to the chosen tab. Arrow keys move, Home and End jump.">
        <Specimen label="inbox · four tabs with counts and panels" wide surface="bg">
          <Tabs label="Inbox" tabs={INBOX_TABS} />
        </Specimen>
        <Specimen label="no counts · one disabled" surface="bg">
          <Tabs
            label="Project"
            defaultValue="clips"
            tabs={[
              { value: 'moments', label: 'Moments', panel: '12 moments found. 8 strong.' },
              { value: 'clips', label: 'Clips', panel: '10 clips rendered, 8 left to review.' },
              { value: 'log', label: 'Log', panel: 'No log for this run.', disabled: true },
            ]}
          />
        </Specimen>
      </GallerySection>

      <GallerySection id="accordion" title="Accordion" note="Sections that open and close. The quiet summary stands in for a closed section.">
        <Specimen label="workflow sections · several can be open" wide surface="bg">
          <Accordion items={WORKFLOW_SECTIONS} defaultOpen={['captions']} level={4} />
        </Specimen>
        <Specimen label="one at a time · no icons" surface="bg">
          <Accordion
            multiple={false}
            level={4}
            defaultOpen={['why']}
            items={[
              { id: 'why', title: 'Why this score', children: FEATURED.reason },
              { id: 'words', title: 'Caption words', summary: '2 fixed', children: 'Two misheard words were fixed before the captions were burned in.' },
            ]}
          />
        </Specimen>
        <Specimen label="disabled section" surface="bg">
          <Accordion level={4} items={[{ id: 'overlays', title: 'Overlays', summary: 'Add a campaign first', disabled: true, children: 'Nothing to set yet.' }]} />
        </Specimen>
      </GallerySection>

      <GallerySection id="breadcrumb" title="Breadcrumb, BackLink" note="The last crumb is the current page and does not link.">
        <Specimen label="project, then clip" wide>
          <Breadcrumb
            label="Breadcrumb, clip"
            items={[{ label: 'Projects', href: '#breadcrumb' }, { label: 'Tomo · GTA VI launch night', href: '#breadcrumb' }, { label: FEATURED.hook }]}
          />
        </Specimen>
        <Specimen label="two levels">
          <Breadcrumb label="Breadcrumb, workflow" items={[{ label: 'Workflows', href: '#breadcrumb' }, { label: 'Tomo launch night' }]} />
        </Specimen>
        <Specimen label="back link">
          <BackLink href="#breadcrumb">Back to projects</BackLink>
        </Specimen>
      </GallerySection>

      <GallerySection id="pagination" title="Pagination, LoadMore" note="Pagination for lists someone jumps around in. LoadMore for grids read top to bottom.">
        <Specimen label="12 pages · live · first page, then a middle page with a gap on both sides" wide>
          <Row gap={24}>
            <LivePager pages={12} start={1} label="Pages, projects" />
            <LivePager pages={12} start={6} label="Pages, history" />
          </Row>
        </Specimen>
        <Specimen label="four pages · no gaps"><LivePager pages={4} start={2} label="Pages, workflows" /></Specimen>
        <Specimen label="load more · live" surface="bg"><LiveLoadMore /></Specimen>
        <Specimen label="load more · loading" surface="bg"><LoadMore shown={48} total={212} onLoadMore={noop} loading /></Specimen>
        <Specimen label="load more · everything shown" surface="bg"><LoadMore shown={212} total={212} onLoadMore={noop} /></Specimen>
      </GallerySection>

      <GallerySection id="pipeline-steps" title="PipelineSteps" note="What a job is doing. The full list for a progress screen, or one compact row for a project card.">
        <Specimen label="vertical · transcribing at 41%">
          <PipelineSteps label="Finding moments in Tomo · GTA VI launch night" steps={FINDING} />
        </Specimen>
        <Specimen label="vertical · failed, with a skipped step">
          <PipelineSteps label="Rendering clips for Tomo · GTA VI launch night" steps={RENDER_FAILED} />
        </Specimen>
        <Specimen label="vertical · amount of work unknown">
          <PipelineSteps label="Downloading Lacy · Live 19:40" steps={UNKNOWN} />
        </Specimen>
        <Specimen label="horizontal · queued, running, failed, done">
          <Stack gap={16}>
            <PipelineSteps orientation="horizontal" label="Dom · Heist practice" steps={WAITING} />
            <PipelineSteps orientation="horizontal" label="Tomo · GTA VI launch night" steps={FINDING} />
            <PipelineSteps orientation="horizontal" label="Tomo · GTA VI launch night, render" steps={RENDER_FAILED} />
            <PipelineSteps orientation="horizontal" label="Lacy · Live 19:40" steps={ALL_DONE} />
          </Stack>
        </Specimen>
      </GallerySection>

      <GallerySection id="copy-button" title="CopyButton" note="Press it: the icon turns into a check and the label reads Copied for a moment. The width does not change.">
        <Specimen label="caption · post link">
          <Row>
            <CopyButton text={FEATURED.caption} label="Copy caption" />
            <CopyButton text="https://www.tiktok.com/@yourhandle/video/7301" label="Copy link" kind="ghost" />
          </Row>
        </Specimen>
        <Specimen label="size md · icon only">
          <Row>
            <CopyButton text={FEATURED.caption} size="md" />
            <CopyButton text={FEATURED.caption} iconOnly label="Copy caption" />
          </Row>
        </Specimen>
        <Specimen label="the clipboard refuses · press it">
          <CopyButton text={() => { throw new Error('The clipboard is blocked'); }} label="Copy error detail" />
        </Specimen>
        <Specimen label="disabled">
          <CopyButton text="" label="Copy link" disabled />
        </Specimen>
      </GallerySection>

      <GallerySection id="inline-edit" title="InlineEdit" note="Click the name, or press Enter or F2 on it. Enter saves, Esc cancels, an empty name is not saved.">
        <Specimen label="title · project name"><LiveName initial="Tomo · GTA VI launch night" label="project name" size="title" /></Specimen>
        <Specimen label="heading · workflow name"><LiveName initial="Tomo launch night" label="workflow name" size="heading" maxLength={60} /></Specimen>
        <Specimen label="body · moment title"><LiveName initial={FEATURED.hook} label="moment title" /></Specimen>
        <Specimen label="editing"><LiveName initial="Dom heist practice" label="workflow name, editing example" size="heading" defaultEditing /></Specimen>
        <Specimen label="a long name wraps"><LiveName initial="Tomo plays the first six hours of GTA VI with chat picking every car" label="long project name" size="heading" /></Specimen>
        <Specimen label="disabled"><LiveName initial="Lacy pool" label="locked workflow name" size="heading" disabled /></Specimen>
      </GallerySection>

      <GallerySection id="clip-card" title="ClipCard, ClipGrid" note="The title opens the clip, and so does the still. The checkbox and the actions are separate targets.">
        <Specimen label="to review · selectable · Keep and Skip" surface="bg" center>
          <OneCard><LiveCard id="c1" /></OneCard>
        </Specimen>
        <Specimen label="selected" surface="bg" center>
          <OneCard>
            <ClipCard clip={card(clipById('c2'))} still={stillFor('c2')} estimate={estimate(clipById('c2'))} selected selecting onSelectedChange={noop} onOpen={noop} />
          </OneCard>
        </Specimen>
        <Specimen label="posted · link due" surface="bg" center>
          <OneCard>
            <ClipCard clip={card(clipById('c11'))} still={stillFor('c11')} platforms={['tiktok']} due={DEADLINES.submit} onOpen={noop} actions={<Button size="sm" icon={<Send />}>Submit link</Button>} />
          </OneCard>
        </Specimen>
        <Specimen label="submitted · posted to four platforms" surface="bg" center>
          <OneCard>
            <ClipCard clip={card(clipById('c13'))} still={stillFor('c13')} platforms={['tiktok', 'reels', 'shorts', 'x']} estimate={estimate(clipById('c13'))} onOpen={noop} />
          </OneCard>
        </Specimen>
        <Specimen label="past window" surface="bg" center>
          <OneCard>
            <ClipCard clip={card(clipById('c12'))} still={stillFor('c12')} platforms={['tiktok']} onOpen={noop} />
          </OneCard>
        </Specimen>
        <Specimen label="weak (dim)" surface="bg" center>
          <OneCard><ClipCard clip={card(clipById('c8'))} still={stillFor('c8')} dim onOpen={noop} /></OneCard>
        </Specimen>
        <Specimen label="kept" surface="bg" center>
          <OneCard><ClipCard clip={card(clipById('c9'))} still={stillFor('c9')} estimate={estimate(clipById('c9'))} onOpen={noop} /></OneCard>
        </Specimen>
        <Specimen label="no still yet" surface="bg" center>
          <OneCard><ClipCard clip={card(clipById('c10'))} onOpen={noop} /></OneCard>
        </Specimen>
        <Specimen label="loading" surface="bg" center>
          <OneCard><ClipGrid label="Clips" loading><ClipCardSkeleton /></ClipGrid></OneCard>
        </Specimen>
        <Specimen label="grid of the eight clips to review · tick some and the bulk bar appears" wide surface="bg">
          <ReviewGrid />
        </Specimen>
      </GallerySection>

      <GallerySection id="bulk-bar" title="BulkBar, BulkAction" note="Shown inline here. In the app it floats at the bottom centre. Left and Right move between its buttons; Esc clears.">
        <Specimen label="3 clips selected" wide surface="bg" center>
          <BulkBar count={3} onClear={noop} inline label="Bulk actions, three clips">
            <BulkAction icon={<Check />}>Keep</BulkAction>
            <BulkAction icon={<SkipForward />}>Skip</BulkAction>
            <BulkAction icon={<Send />}>Post</BulkAction>
            <BulkAction danger>Delete</BulkAction>
          </BulkBar>
        </Specimen>
        <Specimen label="1 project selected · an action that is not available" wide surface="bg" center>
          <BulkBar count={1} noun="project" onClear={noop} inline label="Bulk actions, one project">
            <BulkAction icon={<Send />} disabled>Post</BulkAction>
            <BulkAction danger>Delete</BulkAction>
          </BulkBar>
        </Specimen>
        <Specimen label="floating (live) · press Keep to see a toast stack above it" center>
          <ToastHost><FloatingBulk /></ToastHost>
        </Specimen>
      </GallerySection>

      <GallerySection id="log-viewer" title="LogViewer" note="A light panel, no monospace. Warnings and errors carry the word. It follows the newest line until you scroll up.">
        <Specimen label="a failed render · live" wide surface="bg">
          <LiveLog />
        </Specimen>
        <Specimen label="empty" surface="bg">
          <LogViewer title="Check log" lines={[]} />
        </Specimen>
      </GallerySection>
    </GalleryGroup>
  );
}
