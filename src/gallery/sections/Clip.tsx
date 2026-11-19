import { CircleCheck, CircleDollarSign, Clock, Keyboard, Link2, Plus, Radio, Send, Signal, Video } from 'lucide-react';
import { useState } from 'react';
import { CLIPS, STREAMS } from '@/data/fixtures';
import { DEADLINES } from '@/data/deadlines';
import { Banner } from '@/ui/Banner';
import { BandTrack } from '@/ui/BandTrack';
import { Button } from '@/ui/Button';
import { Countdown } from '@/ui/Countdown';
import { DecisionBar } from '@/ui/DecisionBar';
import { EarnBox } from '@/ui/EarnBox';
import { EmptyState } from '@/ui/EmptyState';
import { JobList, JobRow } from '@/ui/JobRow';
import { ProgressPips } from '@/ui/ProgressPips';
import { QueueList, QueueRow } from '@/ui/QueueRow';
import { ScoreCard } from '@/ui/ScoreCard';
import { ShortcutSheet } from '@/ui/ShortcutSheet';
import { StatCard } from '@/ui/StatCard';
import { ThumbStrip } from '@/ui/ThumbStrip';
import { Toast, ToastHost, useToast } from '@/ui/Toast';
import { GalleryGroup, GallerySection, Row, Specimen, Stack } from '../Specimen';

const REVIEW = CLIPS.filter((c) => c.stage === 'review');
const streamName = (id: string) => STREAMS.find((s) => s.id === id)?.channel ?? '';
const noop = () => {};

function LiveQueue() {
  const [current, setCurrent] = useState('c2');
  const sample = REVIEW.slice(0, 4);
  return (
    <QueueList currentId={current} order={sample.map((c) => c.id)} onMove={setCurrent}>
      {sample.map((c) => (
        <QueueRow key={c.id} clip={c} streamName={streamName(c.streamId)} current={c.id === current} onSelect={setCurrent} />
      ))}
    </QueueList>
  );
}

function ToastDemo() {
  const toast = useToast();
  return (
    <Row gap={8}>
      <Button onClick={() => toast.show({ message: 'Skipped.', actionLabel: 'Undo', actionShortcut: '⌘Z', onAction: noop })}>Show "Skipped."</Button>
      <Button onClick={() => toast.show({ message: 'Kept.', actionLabel: 'Undo', actionShortcut: '⌘Z', onAction: noop })}>Show "Kept."</Button>
      <Button kind="ghost" onClick={() => toast.show({ message: 'Link copied.' })}>Plain message</Button>
      <Button kind="ghost" onClick={() => toast.show({ message: "Couldn't post to TikTok.", tone: 'error', actionLabel: 'Try again', onAction: noop })}>Show an error</Button>
      <Button
        kind="ghost"
        onClick={() => {
          // A stand-in for a render job: the toast stays up and fills, then says it is done and leaves on its own.
          let done = 0;
          toast.show({ message: 'Rendering 0 of 10 clips', progress: 0 });
          const id = window.setInterval(() => {
            done += 1;
            if (done < 10) toast.update({ message: `Rendering ${done} of 10 clips`, progress: done * 10 });
            else {
              window.clearInterval(id);
              toast.show({ message: '10 clips rendered.' });
            }
          }, 500);
        }}
      >
        Show a render
      </Button>
    </Row>
  );
}

function SheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon={<Keyboard />} shortcut="?" ariaKeyShortcuts="Shift+Slash" onClick={() => setOpen(true)}>Open the shortcut sheet</Button>
      <ShortcutSheet open={open} onOpenChange={setOpen} />
    </>
  );
}

export function ClipSection() {
  return (
    <GalleryGroup id="clip" title="Clip and review">
      <GallerySection id="stat-card" title="StatCard" note="Value 26 px tabular. Note on one line with an ellipsis.">
        <Specimen label="default" surface="bg">
          <StatCard label="To review" icon={<Video />} value="8" note="4 strong · 3 maybe · 1 weak" />
        </Specimen>
        <Specimen label="due" surface="bg">
          <StatCard label="Link due" icon={<Clock />} value="13:02" note="Ran out of road · TikTok" tone="due" />
        </Specimen>
        <Specimen label="zero" surface="bg">
          <Stack gap={8}>
            <StatCard label="To post" icon={<Send />} value="None" note="Kept clips show up here" state="zero" />
            <StatCard label="Could earn" icon={<CircleDollarSign />} value="$0" note="Nothing kept yet" state="zero" />
          </Stack>
        </Specimen>
        <Specimen label="not loaded" surface="bg">
          <StatCard label="To review" icon={<Video />} value="8" state="not-loaded" />
        </Specimen>
      </GallerySection>

      <GallerySection id="job-row" title="JobRow" note="Home &quot;Needs you&quot; rows, most urgent first.">
        <Specimen label="submit link · past submit window · post · review" wide surface="bg">
          <JobList>
            <JobRow kind="submit" title="Ran out of road" meta="Posted to TikTok 17 min ago" clipIds={['c11']} deadline={DEADLINES.submit} />
            <JobRow kind="past-window" title="The long way round" meta="Window closed 11 min ago" clipIds={['c12']} />
            <JobRow kind="post-failed" title="Wrong boat" meta="TikTok did not answer. Nothing was posted." clipIds={['c10']} onDetails={() => {}} />
            <JobRow kind="post" title="2 kept clips, ready to post" meta="≈ $25 at 10K views each" clipIds={['c9', 'c10']} actionLabel="Post 2 clips" />
            <JobRow kind="review" title="8 clips to review. 4 strong." />
          </JobList>
        </Specimen>
        <Specimen label="submit link that has just expired (flips to past window)" wide surface="bg">
          <JobList label="Expired example">
            <JobRow kind="submit" title="Ran out of road" meta="Posted to TikTok 31 min ago" clipIds={['c11']} deadline={DEADLINES.expired} />
          </JobList>
        </Specimen>
      </GallerySection>

      <GallerySection id="countdown" title="Countdown" note="Ticks every second from a deadline. Under 5 min it is announced once a minute.">
        <Specimen label="13:02"><Countdown deadline={DEADLINES.submit} /></Specimen>
        <Specimen label="under 5 min"><Countdown deadline={DEADLINES.underFive} /></Specimen>
        <Specimen label="under 1 min"><Countdown deadline={DEADLINES.underOne} /></Specimen>
        <Specimen label="expired"><Countdown deadline={DEADLINES.expired} /></Specimen>
      </GallerySection>

      <GallerySection id="thumb-strip" title="ThumbStrip" note="Bands 4, 3, 1 with hairlines between them.">
        <Specimen label="8 clips" wide><ThumbStrip /></Specimen>
      </GallerySection>

      <GallerySection id="queue-row" title="QueueRow" note="A listbox. Up and Down move here; J and K on the review screen.">
        <Specimen label="live: current, strong, maybe" surface="side"><LiveQueue /></Specimen>
        <Specimen label="weak (dim) · decided kept · decided skipped" surface="side">
          <QueueList label="Decided examples">
            <QueueRow clip={REVIEW[7]!} streamName="Tomo" tabbable />
            <QueueRow clip={REVIEW[1]!} streamName="Tomo" decision="kept" />
            <QueueRow clip={REVIEW[5]!} streamName="Dom" decision="skipped" />
          </QueueList>
        </Specimen>
      </GallerySection>

      <GallerySection id="progress-pips" title="ProgressPips">
        <Specimen label="start"><ProgressPips states={Array(8).fill('todo')} current={0} /></Specimen>
        <Specimen label="mid-session"><ProgressPips states={['kept', 'kept', 'skipped', 'todo', 'todo', 'todo', 'todo', 'todo']} current={3} /></Specimen>
        <Specimen label="all decided"><ProgressPips states={['kept', 'kept', 'kept', 'kept', 'kept', 'kept', 'skipped', 'skipped']} current={-1} /></Specimen>
      </GallerySection>

      <GallerySection id="score-card" title="ScoreCard" note="A guess, never a promise. Bands in ink, grey and dashed.">
        <Specimen label="strong" surface="bg"><ScoreCard score={91} /></Specimen>
        <Specimen label="maybe" surface="bg"><ScoreCard score={58} reason="Chat picks up but the reaction comes late, around 9 s." signals={[{ label: 'Chat', value: '2×' }, { label: 'Reaction at', value: '9.1 s' }]} /></Specimen>
        <Specimen label="weak" surface="bg"><ScoreCard score={22} reason="Quiet chat and no clear reaction. Mostly driving." signals={[{ label: 'Chat', value: '1×' }]} /></Specimen>
        <Specimen label="unscored" surface="bg"><ScoreCard /></Specimen>
      </GallerySection>

      <GallerySection id="band-track" title="BandTrack" note="Weak 39%, Maybe 25%, Strong the rest. Marker at score%.">
        <Specimen label="91"><BandTrack score={91} /></Specimen>
        <Specimen label="52"><BandTrack score={52} /></Specimen>
        <Specimen label="22"><BandTrack score={22} /></Specimen>
      </GallerySection>

      <GallerySection id="earn-box" title="EarnBox" note="Estimates only for per-view campaigns.">
        <Specimen label="per view"><EarnBox pay={STREAMS[0]!.pay} /></Specimen>
        <Specimen label="pool"><EarnBox pay={STREAMS[1]!.pay} /></Specimen>
      </GallerySection>

      <GallerySection id="decision-bar" title="DecisionBar" note="Keep 56 px, the biggest target on the screen.">
        <Specimen label="default"><DecisionBar /></Specimen>
        <Specimen label="keep off until render"><DecisionBar state="keep-off" /></Specimen>
        <Specimen label="loading"><DecisionBar state="loading" /></Specimen>
      </GallerySection>

      <GallerySection id="toast" title="Toast" note="Ink pill at bottom centre. Pauses on hover or focus. The newest replaces the one on screen.">
        <Specimen label='"Skipped." with Undo' center><Toast inline persistent message="Skipped." actionLabel="Undo" actionShortcut="⌘Z" onAction={noop} onDismiss={noop} /></Specimen>
        <Specimen label='"Kept." with Undo' center><Toast inline persistent message="Kept." actionLabel="Undo" actionShortcut="⌘Z" onAction={noop} onDismiss={noop} /></Specimen>
        <Specimen label="plain message" center><Toast inline persistent message="Link copied." onDismiss={noop} /></Specimen>
        <Specimen label="error: stays until dismissed, with and without an action" wide center>
          <Row gap={16}>
            <Toast inline tone="error" message="Couldn't post to TikTok." actionLabel="Try again" onAction={noop} onDismiss={noop} />
            <Toast inline tone="error" message="The clipping engine stopped." onDismiss={noop} />
          </Row>
        </Specimen>
        <Specimen label="progress: stays until 100%, with and without Cancel" wide center>
          <Row gap={16}>
            <Toast inline message="Rendering 4 of 10 clips" progress={41} onDismiss={noop} />
            <Toast inline message="Downloading the stream" progress={72} actionLabel="Cancel" onAction={noop} onDismiss={noop} />
          </Row>
        </Specimen>
        <Specimen label="live: stacked, newest replaces" wide>
          <ToastHost><ToastDemo /></ToastHost>
        </Specimen>
      </GallerySection>

      <GallerySection id="shortcut-sheet" title="ShortcutSheet" note="Opens with ?, closes with Esc, traps focus, returns focus on close.">
        <Specimen label="open (live)" center tall><SheetDemo /></Specimen>
      </GallerySection>

      <GallerySection id="banner" title="Banner">
        <Specimen label="fail" wide>
          <Banner tone="fail" title="Couldn't load your clips." detail="E_WORKSPACE_READ · placeholder detail" actions={<><Button kind="secondary">Run system checks</Button><Button kind="secondary">Try again</Button></>}>
            The submit window keeps running. Links still due are shown at the top.
          </Banner>
        </Specimen>
        <Specimen label="due" wide>
          <Banner tone="due" title="1 link due in 13:02." actions={<Button kind="secondary" icon={<Link2 />}>Paste post link</Button>}>
            Submit it to the campaign before the 30 min window closes.
          </Banner>
        </Specimen>
        <Specimen label="neutral" wide>
          <Banner tone="neutral" title="Scoring is paused." actions={<Button kind="ghost">Open settings</Button>}>Daily cap reached. Clips still render without a score.</Banner>
        </Specimen>
      </GallerySection>

      <GallerySection id="empty-state" title="EmptyState">
        <Specimen label="Home empty" wide surface="bg">
          <EmptyState
            level={3}
            icon={<Video />}
            title="Nothing needs you yet."
            primary={<Button kind="primary" icon={<Plus />} shortcut="⌘N" ariaKeyShortcuts="Meta+N">New clips</Button>}
            secondary={<Button icon={<Radio />}>Watch a channel</Button>}
            hints={[{ icon: <Link2 />, text: 'Paste a stream link' }, { icon: <Video />, text: 'Drop a video file' }, { icon: <Radio />, text: 'Watch a channel while it is live' }]}
          >
            Paste a stream link or watch a channel. Moments show up here, scored and ready to review.
          </EmptyState>
        </Specimen>
        <Specimen label="review queue clear" wide surface="bg">
          <EmptyState
            level={3}
            icon={<CircleCheck />}
            title="Queue is clear."
            primary={<Button kind="primary" icon={<Send />}>Post 8 kept clips</Button>}
            secondary={<Button>Back to Home</Button>}
            hints={[{ icon: <CircleCheck />, text: '6 kept' }, { icon: <Signal />, text: '8 kept clips are ready to post' }, { icon: <Clock />, text: 'Submit within 30 min of posting' }]}
          >
            6 kept. 2 skipped. ≈ $80 at 10K views each.
          </EmptyState>
        </Specimen>
      </GallerySection>
    </GalleryGroup>
  );
}
