import { TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CLIPS, STREAMS, WATCHED } from '@/data/fixtures';
import { useSelection } from '@/hooks/useSelection';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ChannelCell } from '@/ui/ChannelCell';
import { CheckRow } from '@/ui/CheckRow';
import { Chip } from '@/ui/Chip';
import { LivePill } from '@/ui/LivePill';
import { Meter } from '@/ui/Meter';
import { PayTerms } from '@/ui/PayTerms';
import { SettingsRow } from '@/ui/SettingsRow';
import { StepList } from '@/ui/StepList';
import { ScoreBadge } from '@/ui/ScoreBadge';
import { SelectAllHeader, SelectCell, SortHeader, Table, type SortState } from '@/ui/Table';
import { Toggle } from '@/ui/Toggle';
import { GalleryGroup, GallerySection, Specimen, Stack } from '../Specimen';

/** Placeholder check times (section 13: the 60 s and 5 min intervals are not decided). */
const TIMES: Record<string, { last: string; next: string; tonight: string }> = {
  Clix: { last: '0:20 ago', next: '0:40', tonight: 'None yet' },
  Lacy: { last: '0:35 ago', next: '0:25', tonight: '' },
  Tomo: { last: '3:10 ago', next: '1:50', tonight: '10 clips' },
  Dom: { last: 'Off', next: 'Off', tonight: 'None' },
};

export function LiveTable() {
  return (
    <Table caption="Watched channels">
      <thead>
        <tr>
          <th scope="col">Channel</th>
          <th scope="col">Status</th>
          <th scope="col">Last check</th>
          <th scope="col">Next check</th>
          <th scope="col">Workflow</th>
          <th scope="col">Tonight</th>
          <th scope="col" className="hr-table__end">Watch</th>
        </tr>
      </thead>
      <tbody>
        {WATCHED.map((w) => {
          const t = TIMES[w.channel] ?? { last: '', next: '', tonight: '' };
          const watching = w.note !== 'Not watching';
          const state = !watching ? 'off' : w.live ? 'live' : 'offline';
          return (
            <tr key={w.channel} data-state={state}>
              <td><ChannelCell name={w.channel} note={w.note} live={w.live} /></td>
              <td>{w.live ? <LivePill /> : <Chip>{watching ? 'Offline' : 'Not watching'}</Chip>}</td>
              <td className="hr-table__mono">{t.last}</td>
              <td className="hr-table__mono">{t.next}</td>
              <td>
                {w.workflow ? (
                  w.workflow
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Chip tone="due" icon={<TriangleAlert />}>No workflow yet</Chip>
                    <Button size="sm">Choose</Button>
                  </span>
                )}
              </td>
              <td className="hr-table__num">
                {'renderPct' in w ? (
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 120 }}>
                    <span>Rendering {w.renderPct}%</span>
                    <Meter value={w.renderPct} label={`${w.channel} rendering`} valueText={`${w.renderPct} percent`} height={5} />
                  </span>
                ) : (
                  t.tonight
                )}
              </td>
              <td className="hr-table__end">
                <Toggle defaultChecked={watching} aria-label={`Watch ${w.channel}`} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

const REVIEW_CLIPS = CLIPS.filter((c) => c.stage === 'review');
const REVIEW_IDS = REVIEW_CLIPS.map((c) => c.id);
const channelOf = (id: string) => STREAMS.find((s) => s.id === id)?.channel ?? '';

/** A compact table of the eight review clips: click a header to sort, tick rows to select. */
export function ClipTable() {
  const [sort, setSort] = useState<SortState | null>({ column: 'score', direction: 'desc' });
  const sel = useSelection(REVIEW_IDS, ['c2']);
  const rows = useMemo(() => {
    if (!sort) return REVIEW_CLIPS;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...REVIEW_CLIPS].sort((a, b) => {
      if (sort.column === 'title') return a.title.localeCompare(b.title) * dir;
      if (sort.column === 'stream') return channelOf(a.streamId).localeCompare(channelOf(b.streamId)) * dir;
      if (sort.column === 'length') return (a.seconds - b.seconds) * dir;
      return (a.score - b.score) * dir;
    });
  }, [sort]);
  return (
    <Stack gap={8}>
      <Table caption="Clips to review" density="compact">
        <thead>
          <tr>
            <SelectAllHeader state={sel.state} onChange={sel.toggleAll} label="Select all clips" />
            <SortHeader column="title" sort={sort} onSort={setSort}>Clip</SortHeader>
            <SortHeader column="score" sort={sort} onSort={setSort}>Score</SortHeader>
            <SortHeader column="length" sort={sort} onSort={setSort}>Length</SortHeader>
            <SortHeader column="stream" sort={sort} onSort={setSort}>Stream</SortHeader>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} data-selected={sel.isSelected(c.id) ? '' : undefined}>
              <SelectCell checked={sel.isSelected(c.id)} onChange={(on) => sel.toggle(c.id, on)} label={`Select ${c.title}`} />
              <td>{c.title}</td>
              <td><ScoreBadge score={c.score} showWord /></td>
              <td className="hr-table__num">{c.seconds} s</td>
              <td>{channelOf(c.streamId)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p className="g-pad" aria-live="polite">{sel.count === 0 ? 'No clips selected' : `${sel.count} of ${REVIEW_IDS.length} clips selected`}</p>
    </Stack>
  );
}

const STEPS = [
  { title: 'Fetch the stream', note: 'Twitch VOD · 2:04:11 · chat replay found' },
  { title: 'Find hype moments', note: 'Chat spikes, loud audio, facecam reactions' },
  { title: 'Crop to 9:16', note: 'Facecam on top, gameplay below' },
  { title: 'Burn in captions', note: 'Hook text and word captions' },
  { title: 'Score each clip', note: 'Strong, Maybe or Weak. An AI guess.' },
];

export function DataSection() {
  const tomo = STREAMS[0];
  const lacy = STREAMS[1];
  const dom = STREAMS[2];
  return (
    <GalleryGroup id="data" title="Data display">
      <GallerySection id="table" title="Table" note="Real table semantics. Header 40 px on --bg, rows 76 px. Rows: live, offline, watching off (text --ink-3).">
        <Specimen label="Live table · Clix live (no workflow) · Lacy live (rendering) · Tomo offline · Dom watching off" wide surface="bg">
          <LiveTable />
        </Specimen>
        <Specimen label="compact · sortable headers · row selection (live)" wide surface="bg">
          <ClipTable />
        </Specimen>
      </GallerySection>

      <GallerySection id="channel-cell" title="ChannelCell" note="Avatar 40 with the on-air ring when live.">
        <Specimen label="live"><ChannelCell name="Clix" note="Watching" live /></Specimen>
        <Specimen label="offline"><ChannelCell name="Tomo" note="Offline" /></Specimen>
      </GallerySection>

      <GallerySection id="settings-row" title="SettingsRow" note="60 px row inside a Card.">
        <Specimen label="connected · needs sign-in · disconnected" wide surface="bg">
          <Card divided>
            <SettingsRow title="TikTok" note="[YOUR HANDLE]" status="connected" action={<Button size="sm" kind="ghost">Disconnect</Button>} />
            <SettingsRow title="Instagram Reels" note="[YOUR HANDLE] · session expired" status="needs-sign-in" action={<Button size="sm">Sign in again</Button>} />
            <SettingsRow title="YouTube Shorts" note="Not set up" status="disconnected" action={<Button size="sm">Connect</Button>} />
          </Card>
        </Specimen>
      </GallerySection>

      <GallerySection id="check-row" title="CheckRow" note="46 px. The chip carries the word; the icon repeats it.">
        <Specimen label="ok · warning · failed · running" wide surface="bg">
          <Card divided>
            <CheckRow name="Video tools" value="Installed" status="ok" />
            <CheckRow name="Free disk space" value="[FREE SPACE]" status="warning" statusLabel="Low" />
            <CheckRow name="Posting service" value="No answer" status="failed" />
            <CheckRow name="Captions model" value="Checking" status="running" />
          </Card>
        </Specimen>
      </GallerySection>

      <GallerySection id="step-list" title="StepList" note="What will happen, numbered.">
        <Specimen label="five steps"><StepList steps={STEPS} label="What will happen" /></Specimen>
      </GallerySection>

      <GallerySection id="pay-terms" title="PayTerms" note="Estimates only where the campaign pays per view.">
        <Specimen label="per view">
          <Stack gap={16}>
            {tomo ? <PayTerms stream={tomo} /> : null}
            {dom ? <PayTerms stream={dom} /> : null}
          </Stack>
        </Specimen>
        <Specimen label="pool · no estimate">{lacy ? <PayTerms stream={lacy} /> : null}</Specimen>
      </GallerySection>
    </GalleryGroup>
  );
}
