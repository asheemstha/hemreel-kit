import { ArrowRight, Check, CornerDownLeft, Link2, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Divider, SectionHeader } from '@/ui/Divider';
import { DropZone } from '@/ui/DropZone';
import { Field } from '@/ui/Field';
import { RadioCard, RadioCardGroup } from '@/ui/RadioCard';
import { StepList } from '@/ui/StepList';
import { TopBar } from '@/ui/TopBar';
import { payRate, payTerms } from '@/ui/PayTerms';
import { STREAMS, formatEstimate } from '@/data/fixtures';
import { useDue } from '@/state/clips';
import { ScreenFrame, useFrame } from './Frame';

const WORKFLOWS = [
  { value: 'tomo', title: 'Tomo launch night', streamId: 'tomo' },
  { value: 'lacy', title: 'Lacy pool', streamId: 'lacy' },
  { value: 'dom', title: 'Dom heist practice', streamId: 'dom' },
];

const STEPS = [
  { title: 'Download the VOD and chat replay', note: 'Dom · Heist practice · 2:04:11' },
  { title: 'Find hype moments', note: 'Chat spikes, loud audio, facecam reactions' },
  { title: 'Crop to 9:16, facecam on top', note: 'Gameplay below, captions burned in' },
  { title: 'Score each clip 0 to 100', note: 'Strong, Maybe or Weak. An AI guess.' },
  { title: 'Queue them for your review', note: 'Keep or skip, then post to TikTok, Reels, Shorts' },
];

function Top() {
  const { openHelp } = useFrame();
  const due = useDue();
  return <TopBar title="New clips" note="Paste a link or drop a file" due={due} onHelp={openHelp} />;
}

/** Fixed stand-in: "the link was just checked". Real detection is out of scope for the kit. */
function DetectedSource() {
  return (
    <div className="sc-detected">
      <Avatar name="Dom" size={34} />
      <div className="sc-detected__text">
        <strong>Dom · Heist practice</strong>
        <span className="hr-tnum">Twitch VOD · 2:04:11 · chat replay found</span>
      </div>
      <Chip tone="ok" icon={<Check />}>Link works</Chip>
    </div>
  );
}

export function NewClipsScreen() {
  const dom = STREAMS.find((s) => s.id === 'dom');
  return (
    <ScreenFrame title="New clips" nav="sidebar" current="new" topBar={<Top />}>
      <div className="sc-new">
        <div className="sc-new__main">
          <Card as="section" aria-labelledby="step-source" header={<SectionHeader id="step-source" title="1  Source" note="A stream link or a video file" />}>
            <div className="sc-stack sc-gap-16">
              <Field label="Stream link" type="url" icon={<Link2 />} size={44} defaultValue="https://www.twitch.tv/videos/2290417733" help="Twitch, YouTube and Kick links work. Chat replay is used when the platform keeps it." />
              <DetectedSource />
              <Divider label="or" />
              <DropZone />
              <p className="sc-hint">Want hemreel to clip while a channel is live? <Link to="/live" className="sc-link">Watch a channel on Live <ArrowRight aria-hidden="true" /></Link></p>
            </div>
          </Card>
          <Card as="section" aria-labelledby="step-workflow" header={<SectionHeader id="step-workflow" title="2  Workflow" note="How the clips are cut, captioned and posted" />}>
            <RadioCardGroup label="Workflow" defaultValue="dom" layout="row">
              {WORKFLOWS.map((w) => {
                const s = STREAMS.find((x) => x.id === w.streamId);
                return (
                  <RadioCard key={w.value} value={w.value} title={w.title} meta={s ? payRate(s.pay) : undefined}>
                    <span>{s ? payTerms(s.pay) : null}</span>
                    <span>Facecam on top · captions burned in</span>
                    <span>TikTok, Reels, Shorts · #ad added</span>
                  </RadioCard>
                );
              })}
            </RadioCardGroup>
          </Card>
        </div>
        <aside className="sc-new__aside" aria-label="Summary">
          <Card header={<SectionHeader title="What will happen" />}>
            <StepList steps={STEPS} label="What will happen" />
          </Card>
          <Card>
            <dl className="sc-summary">
              <div><dt>Pays</dt><dd className="hr-tnum">{dom ? `${payRate(dom.pay)}. ${formatEstimate(dom.pay) ?? ''}` : ''}</dd></div>
              <div><dt>AI scoring</dt><dd><Sparkles className="sc-inline-icon" aria-hidden="true" /> On · $1.20 of $5.00 used today</dd></div>
            </dl>
          </Card>
          <Button kind="primary" size="xl" icon={<CornerDownLeft />} shortcut="↵" ariaKeyShortcuts="Enter" block>Find moments</Button>
          <p className="sc-hint sc-center">Nothing is posted until you keep a clip.</p>
        </aside>
      </div>
    </ScreenFrame>
  );
}
