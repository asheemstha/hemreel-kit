import { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { STILLS, stillFor } from '@/data/stills';
import { AUDIO, CHAT, CURRENT_MOMENT_ID, DETAIL, DETAIL_AUDIO, DETAIL_CHAT, MOMENTS, REVIEW_PLAYBACK } from '@/data/timeline';
import { Button } from '@/ui/Button';
import { LaneBars } from '@/ui/LaneBars';
import { MomentList } from '@/ui/MomentList';
import { Player } from '@/ui/Player';
import { SafeZoneOverlay } from '@/ui/SafeZoneOverlay';
import { Scrubber } from '@/ui/Scrubber';
import { SourcePreview } from '@/ui/SourcePreview';
import { TimelineDetail, type DetailHandle } from '@/ui/TimelineDetail';
import { TimelineOverview } from '@/ui/TimelineOverview';
import { Transport } from '@/ui/Transport';
import { VideoStage, type StageState, type ZoneSetting } from '@/ui/VideoStage';
import { GalleryGroup, GallerySection, Row, Specimen, Stack } from '../Specimen';

const HOOK_STILL = stillFor('c1');
const CLIP_ALT = 'Clip preview: He did not see that coming';

/** A live stage: play, pause, seek and the safe zone button all work. */
function LiveStage({ state, size = 'small', zone = 'off', dragging }: { state: StageState; size?: 'review' | 'moments' | 'small'; zone?: ZoneSetting; dragging?: boolean }) {
  const [playing, setPlaying] = useState(state === 'playing');
  const [time, setTime] = useState<number>(REVIEW_PLAYBACK.time);
  const playback = state === 'playing' || state === 'paused';
  return (
    <VideoStage
      state={playback ? (playing ? 'playing' : 'paused') : state}
      size={size}
      still={HOOK_STILL}
      alt={CLIP_ALT}
      defaultZone={zone}
      onPlayingChange={setPlaying}
      time={time}
      onSeek={setTime}
      dragging={dragging}
      clearCounts="6 kept · 2 skipped"
    />
  );
}

function LiveTransport({ playing: initial, dragging, markers }: { playing: boolean; dragging?: boolean; markers?: boolean }) {
  const [playing, setPlaying] = useState(initial);
  const [time, setTime] = useState<number>(REVIEW_PLAYBACK.time);
  return (
    <Transport playing={playing} onPlayingChange={setPlaying} time={time} duration={REVIEW_PLAYBACK.duration} onSeek={setTime}
      markers={markers ? REVIEW_PLAYBACK.markers : undefined} dragging={dragging} />
  );
}

function LiveOverview() {
  const [start, setStart] = useState<number>(DETAIL.windowStart);
  return <TimelineOverview moments={MOMENTS} currentId={CURRENT_MOMENT_ID} windowStart={start} onWindowChange={setStart} audio={AUDIO} chat={CHAT} />;
}

function LiveDetail({ dragging, moving }: { dragging?: DetailHandle; moving?: boolean }) {
  const [inPoint, setIn] = useState<number>(DETAIL.inPoint);
  const [outPoint, setOut] = useState<number>(DETAIL.outPoint);
  const [playhead, setPlayhead] = useState<number>(moving ? DETAIL.inPoint : DETAIL.playhead);
  const [running, setRunning] = useState(Boolean(moving));
  useEffect(() => {
    if (!running) return;
    // advances 0.1 s every 100 ms, looping inside the clip
    const id = window.setInterval(() => setPlayhead((p) => (p + 0.1 > outPoint ? inPoint : Math.round((p + 0.1) * 10) / 10)), 100);
    return () => window.clearInterval(id);
  }, [running, inPoint, outPoint]);
  return (
    <Stack gap={12}>
      {moving ? (
        <Row gap={8}>
          <Button size="sm" icon={running ? <Pause /> : <Play />} onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Play'}</Button>
        </Row>
      ) : null}
      <TimelineDetail
        windowStart={DETAIL.windowStart}
        inPoint={inPoint}
        outPoint={outPoint}
        playhead={playhead}
        onInChange={setIn}
        onOutChange={setOut}
        onPlayheadChange={setPlayhead}
        audio={DETAIL_AUDIO}
        chat={DETAIL_CHAT}
        peak={DETAIL.peak}
        dragging={dragging}
      />
    </Stack>
  );
}

function LiveScrubber({ markers, dragging }: { markers?: boolean; dragging?: boolean }) {
  const [t, setT] = useState<number>(REVIEW_PLAYBACK.time);
  return <Scrubber value={t} onChange={setT} max={REVIEW_PLAYBACK.duration} markers={markers ? REVIEW_PLAYBACK.markers : undefined} dragging={dragging} />;
}

export function StageSection() {
  return (
    <GalleryGroup id="stage" title="Video stage and timeline">
      <GallerySection id="video-stage" title="VideoStage" note="Footage sits on neutral black. Controls are greys and white; the focus ring is white. Z cycles the safe zones.">
        <Specimen label="playing" surface="bg" center><LiveStage state="playing" /></Specimen>
        <Specimen label="paused · safe zone TikTok" surface="bg" center><LiveStage state="paused" zone="tiktok" /></Specimen>
        <Specimen label="loading" surface="bg" center><LiveStage state="loading" /></Specimen>
        <Specimen label="error" surface="bg" center><LiveStage state="error" size="moments" /></Specimen>
        <Specimen label="queue clear" surface="bg" center><LiveStage state="clear" /></Specimen>
        <Specimen label="review size · 387 × 688 player · paused" surface="bg" wide center>
          <div style={{ width: 536 }}><LiveStage state="paused" size="review" /></div>
        </Specimen>
      </GallerySection>

      <GallerySection id="player" title="Player" note="9:16. Shows a still in the gallery; burned-in hook and captions are part of the footage.">
        <Specimen label="review 387 × 688 · moments result 191 × 340 · small preview 174 × 310" surface="stage" wide>
          <Row gap={24} align="end">
            <Player size="review" still={HOOK_STILL} alt={CLIP_ALT} />
            <Player size="moments" still={STILLS[1]} alt="Clip preview: The cops gave up" />
            <Player size="small" still={STILLS[3]} alt="Clip preview: Wait for it" />
          </Row>
        </Specimen>
      </GallerySection>

      <GallerySection id="safe-zone" title="SafeZoneOverlay" note="Where each platform draws its own buttons and text. Approximate; verify against current platform guidance.">
        {(['off', 'tiktok', 'reels', 'shorts'] as const).map((p) => (
          <Specimen key={p} label={p === 'off' ? 'off' : p === 'tiktok' ? 'TikTok' : p === 'reels' ? 'Reels' : 'Shorts'} surface="stage" center>
            <Player size="small" still={HOOK_STILL} alt={CLIP_ALT}><SafeZoneOverlay platform={p} /></Player>
          </Specimen>
        ))}
      </GallerySection>

      <GallerySection id="transport" title="Transport" note="Round play button, tabular time, scrubber.">
        <Specimen label="playing" surface="stage"><LiveTransport playing /></Specimen>
        <Specimen label="paused · with marker" surface="stage"><LiveTransport playing={false} markers /></Specimen>
      </GallerySection>

      <GallerySection id="scrubber" title="Scrubber" note='role="slider". Arrow keys move 1 s, Shift + arrow 5 s, Home and End jump.'>
        <Specimen label="without markers" surface="stage"><LiveScrubber /></Specimen>
        <Specimen label="with markers" surface="stage"><LiveScrubber markers /></Specimen>
        <Specimen label="dragging" surface="stage"><LiveScrubber markers dragging /></Specimen>
      </GallerySection>

      <GallerySection id="source-preview" title="SourcePreview" note="Drag a region to move it, drag its corner to resize. Arrow keys nudge, Shift moves further, Alt + arrow resizes.">
        <Specimen label="facecam on top · 604 × 340" surface="stage" wide><SourcePreview layout="top" /></Specimen>
        <Specimen label="facecam at the bottom" surface="stage"><SourcePreview layout="bottom" width={420} /></Specimen>
        <Specimen label="facecam off · full 9:16 gameplay crop" surface="stage"><SourcePreview layout="off" width={420} /></Specimen>
      </GallerySection>

      <GallerySection id="moment-list" title="MomentList" note="Rows 30 px. Current row in --accent-tint, unselected rows in --ink-3.">
        <Specimen label="selected · unselected · current (He did not see that coming)" surface="bg" wide>
          <div style={{ width: 480, height: 460, display: 'flex', flexDirection: 'column' }}><MomentList moments={MOMENTS} defaultCurrentId={CURRENT_MOMENT_ID} /></div>
        </Specimen>
      </GallerySection>

      <GallerySection id="timeline-overview" title="TimelineOverview" note="12 moments over 3:12:40. Click, drag or use the arrow keys to move the detail window.">
        <Specimen label="12 moments over 3:12:40" wide><LiveOverview /></Specimen>
      </GallerySection>

      <GallerySection id="timeline-detail" title="TimelineDetail" note="60 s window. Handles and playhead move 0.1 s per arrow key, 1 s with Shift.">
        <Specimen label="idle" wide><LiveDetail /></Specimen>
        <Specimen label="dragging in" wide><LiveDetail dragging="in" /></Specimen>
        <Specimen label="dragging out" wide><LiveDetail dragging="out" /></Specimen>
        <Specimen label="playhead moving" wide><LiveDetail moving /></Specimen>
      </GallerySection>

      <GallerySection id="lane-bars" title="Lane bars" note="One svg per lane, one rect per bucket.">
        <Specimen label="audio · 240 buckets"><LaneBars values={AUDIO} tone="audio" height={32} /></Specimen>
        <Specimen label="chat · 240 buckets"><LaneBars values={CHAT} tone="chat" height={32} /></Specimen>
      </GallerySection>
    </GalleryGroup>
  );
}
