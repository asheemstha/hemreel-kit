import { ChevronDown, Clapperboard, House, Play, Radio } from 'lucide-react';
import type { ReactNode } from 'react';
import { DEADLINES } from '@/data/deadlines';
import { AppShell } from '@/ui/AppShell';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { DueChip } from '@/ui/DueChip';
import { NavItem } from '@/ui/NavItem';
import { Rail } from '@/ui/Rail';
import { Segmented } from '@/ui/Segmented';
import { Sidebar } from '@/ui/Sidebar';
import { StreamRow } from '@/ui/StreamRow';
import { TopBar } from '@/ui/TopBar';
import { GalleryGroup, GallerySection, Row, Specimen, Stack } from '../Specimen';

const SCALE = 0.36;

/** A 1440×900 shell drawn at a third of its size so it fits the gallery grid. Inert: it is a picture of the layout. */
function Scaled({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: 1440 * SCALE, height: 900 * SCALE, overflow: 'hidden' }} inert>
      <div style={{ width: 1440, height: 900, transform: `scale(${SCALE})`, transformOrigin: '0 0' }}>{children}</div>
    </div>
  );
}

function Placeholder() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card><div style={{ height: 88 }} /></Card>
      <Card><div style={{ height: 288 }} /></Card>
    </div>
  );
}

const BANDS = [
  { value: 'all', label: 'All', count: 8 },
  { value: 'strong', label: 'Strong', count: 4 },
  { value: 'maybe', label: 'Maybe', count: 3 },
  { value: 'weak', label: 'Weak', count: 1 },
];

export function ShellSection() {
  return (
    <GalleryGroup id="shell" title="Navigation and shell">
      <GallerySection id="app-shell" title="AppShell" note="1440×900 in the gallery; fills the window in the app, minimum 1200×760. Shown here at 36%.">
        <Specimen label="with sidebar" surface="bg" center>
          <Scaled>
            <AppShell fill contentAs="div" side={<Sidebar current="home" navLabel="Sidebar example" />}
              topBar={<TopBar title="Home" note="Wed 18 Nov · 3 streams · 14 clips" due={{ links: 1, deadline: DEADLINES.submit }} headingLevel={4} />}>
              <Placeholder />
            </AppShell>
          </Scaled>
        </Specimen>
        <Specimen label="with rail" surface="bg" center>
          <Scaled>
            <AppShell fill contentAs="div" side={<Rail current="review" navLabel="Rail example" />}
              topBar={<TopBar title="Review" due={{ links: 1, deadline: DEADLINES.submit }} headingLevel={4} />}>
              <Placeholder />
            </AppShell>
          </Scaled>
        </Specimen>
      </GallerySection>

      <GallerySection id="sidebar" title="Sidebar" note="232 px. Logo, New clips, nav, streams, then Settings and Shortcuts pinned to the bottom.">
        <Specimen label="with counts and streams · Home current" surface="side">
          <div style={{ height: 660, display: 'flex' }}><Sidebar current="home" navLabel="Sidebar, with streams" /></div>
        </Specimen>
        <Specimen label="bare · empty and loading states" surface="side">
          <div style={{ height: 660, display: 'flex' }}><Sidebar current="home" bare navLabel="Sidebar, bare" /></div>
        </Specimen>
        <Specimen label="New clips current · dark button" surface="side">
          <div style={{ height: 660, display: 'flex' }}><Sidebar current="new" navLabel="Sidebar, New clips current" /></div>
        </Specimen>
      </GallerySection>

      <GallerySection id="nav-item" title="NavItem" note="36 px. Hover fills --sunk. Current fills --nav-selected with aria-current.">
        <Specimen label="default · current" surface="side">
          <ul className="g-stack" data-gap="8" style={{ listStyle: 'none', padding: 0, margin: 0, width: 208 }}>
            <li><NavItem to="/home" icon={<House />} label="Home" /></li>
            <li><NavItem to="/review" icon={<Clapperboard />} label="Review" current /></li>
          </ul>
        </Specimen>
        <Specimen label="trailing · count · accent badge · LivePill · keycap" surface="side">
          <ul className="g-stack" data-gap="8" style={{ listStyle: 'none', padding: 0, margin: 0, width: 208 }}>
            <li><NavItem to="/review" icon={<Clapperboard />} label="Review" count={8} /></li>
            <li><NavItem to="/home" icon={<House />} label="Home" badge={1} /></li>
            <li><NavItem to="/live" icon={<Radio />} label="Live" live="2 LIVE" /></li>
            <li><NavItem to="/home" icon={<House />} label="Home" shortcut="⌘1" ariaKeyShortcuts="Meta+1" /></li>
          </ul>
        </Specimen>
      </GallerySection>

      <GallerySection id="rail" title="Rail" note="56 px. Used on Review and Moments. Tooltips open to the right. The Live item carries the 8 px on-air dot.">
        <Specimen label="Review current" surface="side" center>
          <div style={{ height: 560, display: 'flex' }}><Rail current="review" navLabel="Rail, Review current" /></div>
        </Specimen>
        <Specimen label="Moments current" surface="side" center>
          <div style={{ height: 560, display: 'flex' }}><Rail current="moments" navLabel="Rail, Moments current" /></div>
        </Specimen>
      </GallerySection>

      <GallerySection id="top-bar" title="TopBar" note="56 px. The DueChip and the help button sit at the far right on every screen.">
        <Specimen label="with note" wide surface="bg">
          <TopBar title="Home" note="Wed 18 Nov · 3 streams · 14 clips" due={{ links: 1, deadline: DEADLINES.submit }} headingLevel={4} />
        </Specimen>
        <Specimen label="with segmented filter" wide surface="bg">
          <TopBar title="Review" headingLevel={4} due={{ links: 1, deadline: DEADLINES.submit }}
            left={<Segmented label="Band filter" items={BANDS} defaultValue="all" />}
            right={<span className="hr-tnum" style={{ font: 'var(--text-label)', color: 'var(--ink-2)' }}>0 kept · 0 skipped</span>} />
        </Specimen>
        <Specimen label="with stream picker and primary action" wide surface="bg">
          <TopBar title="Moments" headingLevel={4} due={{ links: 1, deadline: DEADLINES.submit }}
            left={<Button icon={<ChevronDown />}>Tomo · GTA VI launch night</Button>}
            right={<Button kind="primary" icon={<Play />} shortcut="↵" ariaKeyShortcuts="Enter">Render 10 clips</Button>} />
        </Specimen>
      </GallerySection>

      <GallerySection id="due-chip" title="DueChip" note="Links to Home. Hidden when nothing is due. Under 5 minutes it is announced politely once a minute.">
        <Specimen label="1 link due 13:02"><Row><DueChip links={1} deadline={DEADLINES.submit} /></Row></Specimen>
        <Specimen label="2 links due 04:10 · under 5 min"><Row><DueChip links={2} deadline={DEADLINES.second} /></Row></Specimen>
        <Specimen label="hidden · nothing due">
          <Row><DueChip links={0} deadline={DEADLINES.submit} /><span style={{ color: 'var(--ink-3)', font: 'var(--text-label)' }}>Renders nothing.</span></Row>
        </Specimen>
      </GallerySection>

      <GallerySection id="stream-row" title="StreamRow" note="Avatar 22, name, subtitle, then a count or the LIVE pill.">
        <Specimen label="offline with count" surface="side">
          <Stack gap={8}><div style={{ width: 208 }}><StreamRow name="Tomo" subtitle="GTA VI launch night" count={6} /></div></Stack>
        </Specimen>
        <Specimen label="live" surface="side">
          <div style={{ width: 208 }}><StreamRow name="Lacy" subtitle="Live 19:40" live /></div>
        </Specimen>
      </GallerySection>
    </GalleryGroup>
  );
}
