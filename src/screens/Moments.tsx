import { ArrowRight, CornerDownLeft, Pause, Play, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/ui/Button';
import { FacecamLayout } from '@/ui/FacecamLayout';
import { IconButton } from '@/ui/IconButton';
import { Kbd } from '@/ui/Kbd';
import { MomentList } from '@/ui/MomentList';
import { Player } from '@/ui/Player';
import { Select } from '@/ui/Select';
import { SourcePreview } from '@/ui/SourcePreview';
import { TimelineDetail } from '@/ui/TimelineDetail';
import { TimelineOverview } from '@/ui/TimelineOverview';
import { TopBar } from '@/ui/TopBar';
import { useToast } from '@/ui/Toast';
import { scoreBand } from '@/ui/ScoreBadge';
import { STREAMS } from '@/data/fixtures';
import { useDue } from '@/state/clips';
import { stillFor } from '@/data/stills';
import { AUDIO, CHAT, CURRENT_MOMENT_ID, DETAIL, DETAIL_AUDIO, DETAIL_CHAT, MOMENTS, STREAM_LENGTH_S, formatTime, type Moment } from '@/data/timeline';
import { ScreenFrame, ScreenShell, useFrame, useScreenKeys } from './Frame';

type Layout = 'top' | 'bottom' | 'off';

function MomentsBody() {
  const { openHelp } = useFrame();
  const due = useDue();
  const [moments, setMoments] = useState<Moment[]>(MOMENTS);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(MOMENTS.filter((m) => m.selected).map((m) => m.id)));
  const [currentId, setCurrentId] = useState<string>(CURRENT_MOMENT_ID);
  const [windowStart, setWindowStart] = useState<number>(DETAIL.windowStart);
  const [inPoint, setIn] = useState<number>(DETAIL.inPoint);
  const [outPoint, setOut] = useState<number>(DETAIL.outPoint);
  const [playhead, setPlayhead] = useState<number>(DETAIL.playhead);
  const [playing, setPlaying] = useState(false);
  const [layout, setLayout] = useState<Layout>('top');
  const [stream, setStream] = useState('tomo');

  const current = moments.find((m) => m.id === currentId);
  const chosen = moments.filter((m) => selected.has(m.id));
  const minutes = Math.round(chosen.reduce((s, m) => s + (m.end - m.start), 0) / 60);
  const clamp = (v: number) => Math.max(windowStart, Math.min(windowStart + 60, v));

  const toast = useToast();
  const render = () => toast.show({ message: `Rendering ${chosen.length} clips. They show up in Review.` });
  const addMoment = () => {
    const id = `new-${Math.round(playhead * 10)}`;
    if (moments.some((m) => m.id === id)) return;
    setMoments((ms) => [...ms, { id, start: playhead, end: playhead + 20, title: 'New moment', score: 50, selected: true }].sort((a, b) => a.start - b.start));
    setSelected((s) => new Set(s).add(id));
    setCurrentId(id);
  };

  useScreenKeys({
    'moments.play': () => setPlaying((p) => !p),
    'moments.in': () => setIn(Math.min(playhead, outPoint - 1)),
    'moments.out': () => setOut(Math.max(playhead, inPoint + 1)),
    'moments.nudge': (e) => setPlayhead((p) => clamp(p + (e.key === 'ArrowLeft' ? -1 : 1))),
    'moments.add': () => addMoment(),
    'moments.render': () => render(),
    'moments.remove': () => setSelected((s) => { const n = new Set(s); n.delete(currentId); return n; }),
  });

  const top = (
    <TopBar
      title="Moments"
      left={
        <>
          <Select label="Stream" hideLabel value={stream} onValueChange={setStream} items={STREAMS.map((s) => ({ value: s.id, label: `${s.channel} · ${s.title}` }))} />
          <span className="sc-topcount hr-tnum">3:12:40 · workflow: Tomo launch night</span>
        </>
      }
      right={
        <>
          <span className="sc-topcount hr-tnum">{chosen.length} of {moments.length} selected · ≈ {minutes} min of clips</span>
          <Button kind="primary" icon={<CornerDownLeft />} shortcut="↵" ariaKeyShortcuts="Enter" onClick={render}>Render {chosen.length} clips</Button>
        </>
      }
      due={due}
      onHelp={openHelp}
    />
  );

  return (
    <ScreenShell topBar={top}>
      <div className="sc-moments">
        <div className="sc-moments__upper">
          <section className="sc-moments__stage" data-surface="stage" aria-label="Source and result">
            <div className="sc-moments__frames">
              <figure className="sc-moments__fig">
                <SourcePreview layout={layout} />
                <figcaption>Source · 16:9</figcaption>
              </figure>
              <ArrowRight className="sc-moments__arrow" aria-hidden="true" />
              <figure className="sc-moments__fig">
                <Player size="moments" still={stillFor('c1')} alt={`Result preview: ${current?.title ?? 'clip'}`} />
                <figcaption>Result · 9:16</figcaption>
              </figure>
            </div>
            <div className="sc-moments__controls">
              <IconButton kind="stage" round size={44} aria-label={playing ? 'Pause' : 'Play'} icon={playing ? <Pause /> : <Play />} shortcut="Space" ariaKeyShortcuts="Space" onClick={() => setPlaying((p) => !p)} />
              <span className="sc-moments__label">Facecam</span>
              <FacecamLayout value={layout} onValueChange={setLayout} />
            </div>
          </section>
          <div className="sc-moments__list">
            <MomentList
              moments={moments}
              currentId={currentId}
              onCurrentChange={(id) => {
                setCurrentId(id);
                const m = moments.find((x) => x.id === id);
                if (m) { setWindowStart(Math.max(0, Math.min(STREAM_LENGTH_S - 60, m.start - 15))); setIn(m.start); setOut(m.end); setPlayhead(m.start); }
              }}
              selected={selected}
              onSelectedChange={(id, v) => setSelected((s) => { const n = new Set(s); if (v) n.add(id); else n.delete(id); return n; })}
            />
          </div>
        </div>
        <section className="sc-timeline" aria-label="Timeline">
          <div className="sc-timeline__bar">
            <span className="hr-tnum sc-timeline__tc">{formatTime(playhead, { tenths: true })}</span>
            <span className="sc-timeline__title">{current?.title}{current ? <span className="sc-timeline__band"> · {scoreBand(current.score) === 'strong' ? 'Strong' : scoreBand(current.score) === 'maybe' ? 'Maybe' : 'Weak'} {current.score}</span> : null}</span>
            <span className="sc-timeline__point">In <span className="hr-tnum">{formatTime(inPoint, { tenths: true })}</span> <Kbd hint>I</Kbd></span>
            <span className="sc-timeline__point">Out <span className="hr-tnum">{formatTime(outPoint, { tenths: true })}</span> <Kbd hint>O</Kbd></span>
            <span className="hr-tnum sc-timeline__len">{(outPoint - inPoint).toFixed(1)} s</span>
            <Button size="sm" icon={<Plus />} ariaKeyShortcuts="M" onClick={addMoment}>Add moment at playhead</Button>
          </div>
          <TimelineOverview moments={moments} currentId={currentId} windowStart={windowStart} onWindowChange={setWindowStart} audio={AUDIO} chat={CHAT} />
          <TimelineDetail
            windowStart={windowStart}
            inPoint={inPoint}
            outPoint={outPoint}
            playhead={playhead}
            onInChange={setIn}
            onOutChange={setOut}
            onPlayheadChange={setPlayhead}
            audio={DETAIL_AUDIO}
            chat={DETAIL_CHAT}
            peak={DETAIL.peak}
          />
        </section>
      </div>
    </ScreenShell>
  );
}

export function MomentsScreen() {
  return (
    <ScreenFrame title="Moments" nav="rail" current="moments" scope="moments">
      <MomentsBody />
    </ScreenFrame>
  );
}
