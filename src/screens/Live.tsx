import { Bell, Eye, Plus, Radio, TriangleAlert } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ChannelCell } from '@/ui/ChannelCell';
import { Chip } from '@/ui/Chip';
import { Field } from '@/ui/Field';
import { LivePill } from '@/ui/LivePill';
import { Meter } from '@/ui/Meter';
import { Table } from '@/ui/Table';
import { Toggle } from '@/ui/Toggle';
import { TopBar } from '@/ui/TopBar';
import { CLIPS, WATCHED } from '@/data/fixtures';
import { useDue } from '@/state/clips';
import { ScreenFrame, useFrame } from './Frame';

// Check times are placeholders: the 60 s and 5 min check intervals are open questions (brief section 13).
const TIMES: Record<string, { last: string; next: string }> = {
  Clix: { last: '0:20 ago', next: 'in 0:40' },
  Lacy: { last: '0:45 ago', next: 'in 0:15' },
  Tomo: { last: '3 min ago', next: 'in 2 min' },
  Dom: { last: 'Off', next: 'Off' },
};
const tonight = (channel: string) => {
  const n = CLIPS.filter((c) => c.streamId === channel.toLowerCase()).length;
  return n ? `${n} clips` : 'None yet';
};

function Top() {
  const { openHelp } = useFrame();
  const due = useDue();
  return <TopBar title="Live" note="Channels hemreel watches for you" due={due} onHelp={openHelp} />;
}

export function LiveScreen() {
  const liveCount = WATCHED.filter((w) => w.live).length;
  return (
    <ScreenFrame title="Live" nav="sidebar" current="live" topBar={<Top />}>
      <div className="sc-page">
        <div className="sc-live-head">
          <h2 className="sc-h2">{liveCount} channels are live</h2>
          <LivePill label={`${liveCount} LIVE`} size={20} />
          <form className="sc-live-add" onSubmit={(e) => e.preventDefault()}>
            <Field label="Add a channel" hideLabel icon={<Plus />} placeholder="Channel link or name" />
            <Button type="submit" kind="primary" icon={<Eye />}>Watch channel</Button>
          </form>
        </div>
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
              const watching = w.note !== 'Not watching';
              const t = TIMES[w.channel] ?? { last: '', next: '' };
              return (
                <tr key={w.channel} data-state={!watching ? 'off' : w.live ? 'live' : 'offline'}>
                  <td><ChannelCell name={w.channel} note={w.note} live={w.live} /></td>
                  <td>{w.live ? <LivePill /> : <Chip>{watching ? 'Offline' : 'Not watching'}</Chip>}</td>
                  <td className="hr-table__mono">{t.last}</td>
                  <td className="hr-table__mono">{t.next}</td>
                  <td>
                    {w.workflow ?? (
                      <span className="sc-inline">
                        <Chip tone="due" icon={<TriangleAlert />}>No workflow yet</Chip>
                        <Button size="sm">Choose</Button>
                      </span>
                    )}
                  </td>
                  <td className="hr-table__num">
                    {'renderPct' in w ? (
                      <span className="sc-cell-meter">
                        <span>Rendering {w.renderPct}%</span>
                        <Meter value={w.renderPct} label={`${w.channel} rendering`} valueText={`${w.renderPct} percent`} height={5} />
                      </span>
                    ) : tonight(w.channel)}
                  </td>
                  <td className="hr-table__end"><Toggle defaultChecked={watching} aria-label={`Watch ${w.channel}`} /></td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div className="sc-two">
          <Card>
            <div className="sc-explainer">
              <Radio className="sc-explainer__icon" aria-hidden="true" />
              <div>
                <h3 className="sc-h3">How watching works</h3>
                <p>hemreel checks each watched channel on a timer. When one goes live it records, finds moments as they happen and renders clips with that channel's workflow.</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="sc-explainer">
              <Bell className="sc-explainer__icon" aria-hidden="true" />
              <div>
                <h3 className="sc-h3">Nothing posts on its own</h3>
                <p>Clips from live channels wait in Review like any other. A channel without a workflow is watched but not clipped until you choose one.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ScreenFrame>
  );
}
