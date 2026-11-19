import { CircleCheck, Copy, Link, Pencil, Search, Trash2, Tv } from 'lucide-react';
import { useState } from 'react';
import { FEATURED } from '@/data/fixtures';
import { CaptionEditor } from '@/ui/CaptionEditor';
import { Checkbox } from '@/ui/Checkbox';
import { DropZone } from '@/ui/DropZone';
import { FacecamLayout } from '@/ui/FacecamLayout';
import { Field } from '@/ui/Field';
import { Menu } from '@/ui/Menu';
import { RadioCard, RadioCardGroup } from '@/ui/RadioCard';
import { Segmented } from '@/ui/Segmented';
import { Select } from '@/ui/Select';
import { SpendMeter } from '@/ui/SpendMeter';
import { Stepper } from '@/ui/Stepper';
import { Textarea } from '@/ui/Textarea';
import { Toggle } from '@/ui/Toggle';
import { formatTimecode, parseTimecode, TrimRow } from '@/ui/TrimRow';
import { GalleryGroup, GallerySection, Row, Specimen, Stack } from '../Specimen';

const START = parseTimecode(FEATURED.start);
const END = parseTimecode(FEATURED.end);
const NO_AD = 'HE DID NOT SEE THAT COMING. Tomo in GTA 6 #gta6 #tomo #fyp';

const STREAMS = [
  { value: 'tomo', label: 'Tomo · GTA VI launch night', note: '3:12:40' },
  { value: 'lacy', label: 'Lacy · Live 19:40', note: 'Live' },
  { value: 'dom', label: 'Dom · Heist practice', note: '2:04:11' },
];

/** Placeholder project names for the long-list example. The three real streams come first. */
const PROJECTS = [
  { value: 'tomo-launch', label: 'Tomo · GTA VI launch night', note: '10 clips' },
  { value: 'lacy-live', label: 'Lacy · Live 19:40', note: 'Live' },
  { value: 'dom-heist', label: 'Dom · Heist practice', note: '4 clips' },
  { value: 'tomo-day2', label: 'Tomo · Day two, first heist', note: '7 clips' },
  { value: 'clix-ranked', label: 'Clix · Ranked grind', note: '12 clips' },
  { value: 'lacy-irl', label: 'Lacy · Car meet', note: '3 clips' },
  { value: 'dom-races', label: 'Dom · Street races', note: '9 clips' },
  { value: 'tomo-chat', label: 'Tomo · Chat picks the mission', note: '6 clips' },
  { value: 'clix-customs', label: 'Clix · Customs with viewers', note: '5 clips' },
  { value: 'dom-stunts', label: 'Dom · Stunt jumps', note: '8 clips' },
];

function LiveStepper({ label, initial, min, max, shortcut }: { label: string; initial: number; min: number; max: number; shortcut?: string }) {
  const [v, setV] = useState(initial);
  return <Stepper label={label} value={v} onChange={setV} min={min} max={max} format={formatTimecode} shortcut={shortcut} />;
}

function LiveTrim({ campaignMinSeconds, start = START, end = END }: { campaignMinSeconds?: number; start?: number; end?: number }) {
  const [range, setRange] = useState({ start, end });
  return <TrimRow start={range.start} end={range.end} onChange={(s, e) => setRange({ start: s, end: e })} campaignMinSeconds={campaignMinSeconds} />;
}

function LiveToggle({ initial, label, description, disabled }: { initial: boolean; label: string; description?: string; disabled?: boolean }) {
  const [on, setOn] = useState(initial);
  return <Toggle checked={on} onCheckedChange={setOn} label={label} description={description} disabled={disabled} />;
}

function Workflows() {
  return (
    <RadioCardGroup label="Workflow" defaultValue="dom" layout="row">
      <RadioCard value="tomo" title="Tomo launch night" meta="$1.50 per 1K views, $3.50 min, $150 max">
        <span>Facecam on top · captions burned in</span>
        <span>TikTok, Reels, Shorts · #ad added</span>
      </RadioCard>
      <RadioCard value="lacy" title="Lacy pool" meta="$12,500 pool by share of views">
        <span>Facecam on top · captions burned in</span>
        <span>TikTok, Reels, Shorts · #ad added</span>
      </RadioCard>
      <RadioCard value="dom" title="Dom heist practice" meta="$1 per 1K views, $10 min, $100 max">
        <span>Facecam on top · captions burned in</span>
        <span>TikTok, Reels, Shorts · #ad added</span>
      </RadioCard>
    </RadioCardGroup>
  );
}

export function FormsSection() {
  const [filter, setFilter] = useState<'all' | 'strong' | 'maybe' | 'weak'>('all');
  return (
    <GalleryGroup id="forms" title="Form controls">
      <GallerySection id="field" title="Field" note="Label above, 40 px filled input, no outline. Help or error below.">
        <Specimen label="empty with placeholder · url">
          <Field label="Stream link" type="url" placeholder="Paste a stream link" icon={<Link />} />
        </Specimen>
        <Specimen label="filled · help">
          <Field label="Hook text" defaultValue={FEATURED.hook} help="Shown in the first 3 seconds." shortcut="E" />
        </Specimen>
        <Specimen label="focused">
          <Field label="Channel" defaultValue="clix" icon={<Tv />} data-focus="" />
        </Specimen>
        <Specimen label="invalid">
          <Field label="Stream link" type="url" defaultValue="twitch.tv/videos/" icon={<Link />} error="This link has no video id. Copy it again from the browser." />
        </Specimen>
        <Specimen label="disabled">
          <Field label="Default hashtags" defaultValue="#ad #fyp" disabled />
        </Specimen>
        <Specimen label="read-only">
          <Field label="Posting account" defaultValue="[YOUR HANDLE]" readOnly />
        </Specimen>
        <Specimen label="money">
          <Field label="Daily spending cap" type="money" defaultValue="5.00" />
        </Specimen>
        <Specimen label="sizes 44 · 48 · hidden label">
          <Stack gap={12}>
            <Field label="Search 44" size={44} placeholder="Search clips" icon={<Search />} />
            <Field label="Search 48" size={48} placeholder="Add a channel" icon={<Tv />} hideLabel />
          </Stack>
        </Specimen>
      </GallerySection>

      <GallerySection id="textarea" title="Textarea" note="14.5 px / 1.5, no resize handle, footer row for count and checks.">
        <Specimen label="two lines (66 px)">
          <Textarea label="Note" placeholder="Anything to remember about this clip" />
        </Specimen>
        <Specimen label="with count">
          <Textarea label="Caption" defaultValue={FEATURED.caption} footer={<span className="hr-tnum">{FEATURED.caption.length} characters</span>} />
        </Specimen>
        <Specimen label="with #ad check">
          <Textarea
            label="Caption"
            defaultValue={FEATURED.caption}
            footer={<><span className="hr-tnum">{FEATURED.caption.length} characters</span><span className="hr-caption__check"><CircleCheck aria-hidden="true" />#ad is in</span></>}
          />
        </Specimen>
        <Specimen label="invalid">
          <Textarea label="Caption" defaultValue={NO_AD} error="Add #ad before posting" footer={<span className="hr-tnum">{NO_AD.length} characters</span>} />
        </Specimen>
      </GallerySection>

      <GallerySection id="toggle" title="Toggle" note="Base UI Switch. 40×24.">
        <Specimen label="on · off">
          <Row gap={16}>
            <LiveToggle initial label="AI scoring" />
            <LiveToggle initial={false} label="Auto-post" />
          </Row>
        </Specimen>
        <Specimen label="disabled">
          <Row gap={16}>
            <LiveToggle initial label="Burn in captions" disabled />
            <LiveToggle initial={false} label="Watch Dom" disabled />
          </Row>
        </Specimen>
        <Specimen label="with label and description">
          <LiveToggle initial label="Score each moment with AI" description="Uses your daily spending cap. A score is a guess, not a promise of views." />
        </Specimen>
      </GallerySection>

      <GallerySection id="segmented" title="Segmented" note="Arrow keys move, Home and End jump.">
        <Specimen label="3 items">
          <Segmented label="Platform" items={[{ value: 'tiktok', label: 'TikTok' }, { value: 'reels', label: 'Reels' }, { value: 'shorts', label: 'Shorts' }]} defaultValue="tiktok" />
        </Specimen>
        <Specimen label="4 items with counts · tabs" wide>
          <Segmented
            label="Band filter"
            as="tabs"
            value={filter}
            onValueChange={setFilter}
            items={[
              { value: 'all', label: 'All', count: 8 },
              { value: 'strong', label: 'Strong', count: 4 },
              { value: 'maybe', label: 'Maybe', count: 3 },
              { value: 'weak', label: 'Weak', count: 1 },
            ]}
          />
        </Specimen>
        <Specimen label="stage" surface="stage">
          <Segmented label="Safe zone" variant="stage" items={[{ value: 'off', label: 'Off' }, { value: 'tiktok', label: 'TikTok' }, { value: 'reels', label: 'Reels' }, { value: 'shorts', label: 'Shorts' }]} defaultValue="tiktok" />
        </Specimen>
        <Specimen label="disabled">
          <Segmented label="Platform" disabled items={[{ value: 'tiktok', label: 'TikTok' }, { value: 'reels', label: 'Reels' }, { value: 'shorts', label: 'Shorts' }]} defaultValue="reels" />
        </Specimen>
      </GallerySection>

      <GallerySection id="checkbox" title="Checkbox" note="Base UI Checkbox. 16 px, 28 px hit area.">
        <Specimen label="checked · unchecked · indeterminate">
          <Row gap={16}>
            <Checkbox defaultChecked aria-label="Keep moment 1" />
            <Checkbox aria-label="Keep moment 2" />
            <Checkbox indeterminate checked aria-label="Select all moments" />
          </Row>
        </Specimen>
        <Specimen label="disabled">
          <Row gap={16}>
            <Checkbox defaultChecked disabled label="Burn in captions" />
            <Checkbox disabled label="Post to Shorts" />
          </Row>
        </Specimen>
        <Specimen label="with label · as a whole-row label">
          <Stack gap={8}>
            <Checkbox defaultChecked label="Same caption on all three" />
            <Checkbox row defaultChecked label="1:27:16  He did not see that coming" />
            <Checkbox row label="2:41:03  Slow drive across the bay" />
          </Stack>
        </Specimen>
      </GallerySection>

      <GallerySection id="radiocard" title="RadioCard" note="Base UI Radio Group. Filled cards, no outline. Selected: --accent-tint fill and a filled dot.">
        <Specimen label="row of three (workflows)" wide>
          <Workflows />
        </Specimen>
        <Specimen label="stacked pair (cap behaviour)">
          <RadioCardGroup label="When the cap is reached" defaultValue="pause" layout="stack">
            <RadioCard value="pause" title="Pause scoring until midnight">Moments are still found and rendered. They show as Not scored.</RadioCard>
            <RadioCard value="ask" title="Ask me first">A banner asks before any more is spent today.</RadioCard>
          </RadioCardGroup>
        </Specimen>
      </GallerySection>

      <GallerySection id="stepper" title="Stepper" note="Hold a button to repeat. Steps of 0.1 s.">
        <Specimen label="Start">
          <LiveStepper label="Start" initial={START} min={START - 60} max={END - 1} />
        </Specimen>
        <Specimen label="End · with trailing keycap">
          <LiveStepper label="End" initial={END} min={START + 1} max={END + 60} shortcut="O" />
        </Specimen>
        <Specimen label="at limit (minus disabled)">
          <LiveStepper label="Start" initial={START} min={START} max={END - 1} shortcut="I" />
        </Specimen>
      </GallerySection>

      <GallerySection id="select" title="Select / Menu" note="Base UI Select and Menu. Click or press Enter to open.">
        <Specimen label="stream picker (Select)" tall>
          <Select label="Stream" hideLabel items={STREAMS} defaultValue="tomo" />
        </Specimen>
        <Specimen label="with visible label" tall>
          <Select label="Workflow" items={[{ value: 'tomo', label: 'Tomo launch night' }, { value: 'lacy', label: 'Lacy pool' }, { value: 'dom', label: 'Dom heist practice' }]} defaultValue="dom" />
        </Specimen>
        <Specimen label="searchable, for long lists (type to filter)" tall>
          <Select label="Project" searchable searchPlaceholder="Search projects" items={PROJECTS} defaultValue="tomo-launch" />
        </Specimen>
        <Specimen label="Edit this workflow (Menu) · separators and keycaps" tall>
          <Menu
            triggerLabel="Edit this workflow"
            icon={<Pencil />}
            items={[
              { id: 'edit', label: 'Edit steps', shortcut: '⌘E' },
              { id: 'rename', label: 'Rename' },
              { id: 'dup', label: 'Duplicate', icon: <Copy />, shortcut: '⌘D' },
              'separator',
              { id: 'del', label: 'Delete workflow', icon: <Trash2 />, danger: true },
            ]}
          />
        </Specimen>
      </GallerySection>

      <GallerySection id="dropzone" title="DropZone" note="Drag a file onto the first one, or use Choose file.">
        <Specimen label="idle (live)" wide><DropZone /></Specimen>
        <Specimen label="drag-over" wide><DropZone state="drag-over" /></Specimen>
        <Specimen label="file chosen" wide><DropZone state="chosen" fileName="dom-heist-practice-2026-11-17.mp4" /></Specimen>
        <Specimen label="wrong type" wide><DropZone state="wrong-type" fileName="stream-notes.pdf" /></Specimen>
      </GallerySection>

      <GallerySection id="caption-editor" title="CaptionEditor" note="Edit one caption, or untick Same caption to edit per platform.">
        <Specimen label="same on all">
          <CaptionEditor />
        </Specimen>
        <Specimen label="edited per platform">
          <CaptionEditor initial={{ tiktok: FEATURED.caption, reels: 'He did not see that coming. Tomo in GTA 6 #ad #gta6 #reels', shorts: FEATURED.caption }} initialPlatform="reels" />
        </Specimen>
        <Specimen label="missing #ad">
          <CaptionEditor initial={NO_AD} />
        </Specimen>
      </GallerySection>

      <GallerySection id="trim-row" title="TrimRow" note="Start with I, End with O. Length at the right.">
        <Specimen label="default" wide><LiveTrim /></Specimen>
        <Specimen label="shorter than the campaign minimum" wide><LiveTrim campaignMinSeconds={30} /></Specimen>
      </GallerySection>

      <GallerySection id="spend-meter" title="SpendMeter" note="Placeholder amounts: $5.00 cap, $1.20 used.">
        <Specimen label="under cap" wide><SpendMeter /></Specimen>
        <Specimen label="near cap (--due)" wide><SpendMeter used={4.3} /></Specimen>
        <Specimen label="at cap (--fail)" wide><SpendMeter used={5} /></Specimen>
      </GallerySection>

      <GallerySection id="facecam-layout" title="FacecamLayout" note="Stage Segmented. Arrow keys move.">
        <Specimen label="on top" surface="stage"><FacecamLayout defaultValue="top" /></Specimen>
        <Specimen label="at the bottom" surface="stage"><FacecamLayout defaultValue="bottom" /></Specimen>
        <Specimen label="off" surface="stage"><FacecamLayout defaultValue="off" /></Specimen>
      </GallerySection>
    </GalleryGroup>
  );
}
