import { ArrowRight, Check, CircleAlert, Clock, ExternalLink, Pause, Play, Plus, Scissors, LoaderCircle, Settings, SkipForward } from 'lucide-react';
import { Avatar } from '@/ui/Avatar';
import { Button, ButtonLink } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Divider, SectionHeader } from '@/ui/Divider';
import { IconButton } from '@/ui/IconButton';
import { Kbd } from '@/ui/Kbd';
import { LivePill } from '@/ui/LivePill';
import { Logo } from '@/ui/Logo';
import { Meter } from '@/ui/Meter';
import { BandBars, ScoreBadge } from '@/ui/ScoreBadge';
import { Skeleton } from '@/ui/Skeleton';
import { Spinner } from '@/ui/Spinner';
import { Thumb } from '@/ui/Thumb';
import { Tooltip } from '@/ui/Tooltip';
import { useState } from 'react';
import { stillFor } from '@/data/stills';
import { GalleryGroup, GallerySection, Row, Specimen, Stack } from '../Specimen';

const KINDS = ['primary', 'secondary', 'ghost', 'dark', 'danger'] as const;

function RemovableChips() {
  const [tags, setTags] = useState(['#gta6', '#tomo', '#fyp']);
  return (
    <Row gap={8}>
      <Chip>#ad</Chip>
      {tags.map((t) => <Chip key={t} onRemove={() => setTags((all) => all.filter((x) => x !== t))}>{t}</Chip>)}
      {tags.length < 3 ? <Button size="sm" kind="ghost" onClick={() => setTags(['#gta6', '#tomo', '#fyp'])}>Put them back</Button> : null}
    </Row>
  );
}

export function PrimitivesSection() {
  return (
    <GalleryGroup id="primitives" title="Primitives">
      <GallerySection id="button" title="Button" note="Heights 32, 36, 44, 56. Hover, focus and press are live.">
        {KINDS.map((k) => (
          <Specimen key={k} label={`${k} · sm md lg xl`}>
            <Row gap={8} align="end">
              <Button kind={k} size="sm">Save</Button>
              <Button kind={k}>Save</Button>
              <Button kind={k} size="lg">Save</Button>
              <Button kind={k} size="xl">Save</Button>
            </Row>
          </Specimen>
        ))}
        <Specimen label="stage · on the video stage" surface="stage">
          <Row gap={8}>
            <Button kind="stage" icon={<Scissors />}>Render again</Button>
            <Button kind="stage" icon={<SkipForward />} shortcut="X">Skip</Button>
          </Row>
        </Specimen>
        <Specimen label="with icon · with keycap">
          <Row gap={8}>
            <Button kind="primary" icon={<Plus />} shortcut="⌘N" ariaKeyShortcuts="Meta+N">New clips</Button>
            <Button icon={<Settings />}>Settings</Button>
            <Button kind="ghost" shortcut="Esc" ariaKeyShortcuts="Escape">Close</Button>
          </Row>
        </Specimen>
        <Specimen label="xl · Keep and Skip with keycaps">
          <Row gap={8}>
            <Button kind="secondary" size="xl" shortcut="X">Skip</Button>
            <Button kind="primary" size="xl" icon={<Check />} shortcut="P">Keep</Button>
          </Row>
        </Specimen>
        <Specimen label="loading · disabled">
          <Row gap={8}>
            <Button kind="primary" loading icon={<LoaderCircle />}>Rendering</Button>
            <Button kind="primary" disabled>Keep</Button>
            <Button disabled>Skip</Button>
          </Row>
        </Specimen>
        <Specimen label="renders as a link">
          <Row gap={8}>
            <ButtonLink href="#button" kind="secondary" icon={<ExternalLink />}>Open post</ButtonLink>
            <ButtonLink href="#button" kind="ghost" icon={<ArrowRight />}>Go to Live</ButtonLink>
          </Row>
        </Specimen>
      </GallerySection>

      <GallerySection id="iconbutton" title="IconButton" note="Square 32 to 44, round on the stage. Tooltips carry the label and shortcut.">
        <Specimen label="ghost · 32 36 40 44">
          <Row gap={8}>
            <IconButton aria-label="Settings" icon={<Settings />} size={32} />
            <IconButton aria-label="Settings" icon={<Settings />} />
            <IconButton aria-label="Settings" icon={<Settings />} size={40} />
            <IconButton aria-label="Settings" icon={<Settings />} size={44} />
          </Row>
        </Specimen>
        <Specimen label="secondary · accent (rail New clips) · disabled">
          <Row gap={8}>
            <IconButton aria-label="Copy link" icon={<ExternalLink />} kind="secondary" />
            <IconButton aria-label="New clips" icon={<Plus />} kind="accent" size={40} shortcut="⌘N" ariaKeyShortcuts="Meta+N" />
            <IconButton aria-label="Settings" icon={<Settings />} kind="secondary" disabled />
          </Row>
        </Specimen>
        <Specimen label="stage · round" surface="stage">
          <Row gap={8}>
            <IconButton aria-label="Play" icon={<Play />} kind="stage" round size={44} shortcut="Space" />
            <IconButton aria-label="Pause" icon={<Pause />} kind="stage" round size={44} shortcut="Space" />
          </Row>
        </Specimen>
      </GallerySection>

      <GallerySection id="kbd" title="Kbd" note="Flat fill, 11.5 px tabular, 20 px tall. Secondary keycaps only show in tooltips and the ? sheet.">
        <Specimen label="light"><Row gap={8}><Kbd>P</Kbd><Kbd>⌘Z</Kbd><Kbd>Space</Kbd><Kbd>?</Kbd></Row></Specimen>
        <Specimen label="accent" surface="surface"><Row gap={8}><Button kind="primary" shortcut="↵">Find moments</Button><Kbd tone="accent">P</Kbd></Row></Specimen>
        <Specimen label="ink" surface="ink"><Row gap={8}><Kbd tone="ink">⌘Z</Kbd><Kbd tone="ink">Esc</Kbd></Row></Specimen>
        <Specimen label="stage" surface="stage"><Row gap={8}><Kbd tone="stage">Space</Kbd><Kbd tone="stage">Z</Kbd></Row></Specimen>
      </GallerySection>

      <GallerySection id="chip" title="Chip" note="Status chips always carry an icon or a word.">
        <Specimen label="neutral · ink · accent">
          <Row gap={8}><Chip>24 s</Chip><Chip tone="ink">Posted</Chip><Chip tone="accent">Selected</Chip></Row>
        </Specimen>
        <Specimen label="ok · due · fail with icons">
          <Row gap={8}>
            <Chip tone="ok" icon={<Check />}>Link works</Chip>
            <Chip tone="due" icon={<Clock />}>Submit link</Chip>
            <Chip tone="fail" icon={<CircleAlert />}>Past window</Chip>
          </Row>
        </Specimen>
        <Specimen label="removable (live) · the first one is fixed">
          <RemovableChips />
        </Specimen>
      </GallerySection>

      <GallerySection id="score" title="ScoreBadge, BandBars" note="Strong 65 to 100, Maybe 40 to 64, Weak 0 to 39. Drawn in ink, grey and dashed. Never status colours.">
        <Specimen label="number only"><Row gap={8}><ScoreBadge score={91} /><ScoreBadge score={58} /><ScoreBadge score={22} /></Row></Specimen>
        <Specimen label="number with word"><Row gap={8}><ScoreBadge score={91} showWord /><ScoreBadge score={58} showWord /><ScoreBadge score={22} showWord /></Row></Specimen>
        <Specimen label="word only"><Row gap={8}><ScoreBadge score={91} showWord showNumber={false} /><ScoreBadge score={58} showWord showNumber={false} /><ScoreBadge score={22} showWord showNumber={false} /></Row></Specimen>
        <Specimen label="BandBars · strong maybe weak"><Row gap={12}><BandBars band="strong" size={16} /><BandBars band="maybe" size={16} /><BandBars band="weak" size={16} /></Row></Specimen>
      </GallerySection>

      <GallerySection id="livepill" title="LivePill" note="--live is reserved for on-air only. With reduced motion the dot stays still.">
        <Specimen label="16 · 18 · 20"><Row gap={8}><LivePill size={16} /><LivePill /><LivePill size={20} /></Row></Specimen>
        <Specimen label="count"><Row gap={8}><LivePill label="2 LIVE" /></Row></Specimen>
      </GallerySection>

      <GallerySection id="avatar" title="Avatar" note="Initial at 43% of the size. Live ring: 2 px gap, then 2 px --live.">
        <Specimen label="20 22 26 28 34 40">
          <Row gap={8}>{([20, 22, 26, 28, 34, 40] as const).map((s) => <Avatar key={s} name="Tomo" size={s} />)}</Row>
        </Specimen>
        <Specimen label="live" surface="side">
          <Row gap={16}><Avatar name="Lacy" size={22} live on="side" /><Avatar name="Clix" size={40} live on="side" /></Row>
        </Specimen>
      </GallerySection>

      <GallerySection id="thumb" title="Thumb" note="9:16 on the stage colour.">
        <Specimen label="27 · 36 · 48"><Row gap={12} align="end"><Thumb src={stillFor('c1')} width={27} /><Thumb src={stillFor('c2')} /><Thumb src={stillFor('c3')} width={48} /></Row></Specimen>
        <Specimen label="selected · dim (weak or skipped)"><Row gap={16} align="end"><Thumb src={stillFor('c1')} width={48} selected /><Thumb src={stillFor('c8')} width={48} dim /></Row></Specimen>
        <Specimen label="with ScoreBadge"><Row gap={8} align="start"><Thumb src={stillFor('c1')} score={91} /><Thumb src={stillFor('c6')} score={58} /><Thumb src={stillFor('c8')} score={22} dim /></Row></Specimen>
        <Specimen label="empty · loading"><Row gap={12} align="end"><Thumb width={48} /><Thumb width={48} loading /></Row></Specimen>
      </GallerySection>

      <GallerySection id="meter" title="Meter" note='role="progressbar" with a label and value.'>
        <Specimen label="heights 5 · 6 · 8"><Stack gap={12}><Meter value={41} label="Rendering" height={5} /><Meter value={41} label="Rendering" /><Meter value={41} label="Rendering" height={8} /></Stack></Specimen>
        <Specimen label="due"><Meter value={43} label="Submit window" valueText="13 minutes left" variant="due" /></Specimen>
        <Specimen label="stage" surface="stage"><Meter value={62} label="Loading clip" variant="stage" /></Specimen>
        <Specimen label="indeterminate"><Meter label="Checking the link" /></Specimen>
      </GallerySection>

      <GallerySection id="card" title="Card">
        <Specimen label="plain" surface="bg"><Card>Found 12 moments. 8 strong.</Card></Specimen>
        <Specimen label="with header" surface="bg"><Card header={<SectionHeader title="Live now" note="2 channels" level={3} />}>Clix is live. Next check in 0:40.</Card></Specimen>
        <Specimen label="divided rows" surface="bg"><Card divided><div className="g-pad">Tomo · 10 clips</div><div className="g-pad">Lacy · rendering</div><div className="g-pad">Dom · not watching</div></Card></Specimen>
        <Specimen label="tinted · due · accent" surface="bg"><Stack gap={8}><Card tint="due">1 link due in 13:02.</Card><Card tint="accent">Most urgent row.</Card></Stack></Specimen>
      </GallerySection>

      <GallerySection id="divider" title="Divider, SectionHeader">
        <Specimen label="SectionHeader · with note"><SectionHeader title="Needs you" note="4 jobs, most urgent first" level={3} /></Specimen>
        <Specimen label="without note · trailing action"><SectionHeader title="Running without you" level={3} action={<Button size="sm" kind="ghost">See all</Button>} /></Specimen>
        <Specimen label="Divider · plain · labelled"><Stack gap={16}><Divider /><Divider label="or" /></Stack></Specimen>
      </GallerySection>

      <GallerySection id="skeleton" title="Skeleton" note='Hidden from assistive tech. The loading region carries role="status".'>
        <Specimen label="text · thumb · button · avatar">
          <div role="status" className="g-stack" data-gap="12">
            <span className="hr-sr-only">Loading</span>
            <Skeleton width="60%" /><Skeleton width="40%" />
            <Row gap={12}><Skeleton shape="thumb" /><Skeleton shape="avatar" /><Skeleton shape="button" /></Row>
          </div>
        </Specimen>
        <Specimen label="card" surface="bg"><div role="status"><span className="hr-sr-only">Loading</span><Skeleton shape="card" /></div></Specimen>
      </GallerySection>

      <GallerySection id="spinner" title="Spinner">
        <Specimen label="16 · 20 · 30 on light"><Row gap={16}><Spinner size={16} /><Spinner /><Spinner size={30} /></Row></Specimen>
        <Specimen label="on stage" surface="stage"><Row gap={16}><Spinner size={16} onStage /><Spinner onStage /><Spinner size={30} onStage /></Row></Specimen>
      </GallerySection>

      <GallerySection id="tooltip" title="Tooltip" note="Ink, 12.5 px, label plus keycap. Opens after 400 ms. Hover or focus the triggers.">
        <Specimen label="top" tall center><Tooltip label="Keep the clip" shortcut="P" defaultOpen><button type="button" className="hr-btn" data-kind="secondary" data-size="md">Hover me</button></Tooltip></Specimen>
        <Specimen label="bottom" tall center><Tooltip label="Show shortcuts" shortcut="?" side="bottom"><button type="button" className="hr-btn" data-kind="secondary" data-size="md">Hover me</button></Tooltip></Specimen>
        <Specimen label="right (rail)" tall center surface="side"><IconButton aria-label="Settings" icon={<Settings />} tooltipSide="right" shortcut="⌘," ariaKeyShortcuts="Meta+Comma" /></Specimen>
      </GallerySection>

      <GallerySection id="logo" title="Logo" note='"hemreel" in Stack Sans Notch 600, -0.01em. The Notch mark.'>
        <Specimen label="mark only"><Row gap={16} align="end"><Logo wordmark={false} markHeight={24} /><Logo wordmark={false} markHeight={36} /></Row></Specimen>
        <Specimen label="mark + wordmark · 21 · 32"><Stack gap={16}><Logo /><Logo size={32} /></Stack></Specimen>
        <Specimen label="on ink" surface="ink"><Stack gap={16}><Logo onInk /><Logo onInk size={32} /><Logo onInk wordmark={false} /></Stack></Specimen>
      </GallerySection>
    </GalleryGroup>
  );
}
