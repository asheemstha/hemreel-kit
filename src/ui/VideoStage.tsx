import { Check, RotateCcw, ScanLine, SkipForward, TriangleAlert } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { Platform } from '@/data/fixtures';
import { REVIEW_PLAYBACK } from '@/data/timeline';
import { Button } from './Button';
import { Meter } from './Meter';
import { Player, type PlayerSize } from './Player';
import { SafeZoneOverlay, ZONE_LABEL } from './SafeZoneOverlay';
import type { ScrubberMarker } from './Scrubber';
import { Spinner } from './Spinner';
import { Transport } from './Transport';
import './video-stage.css';

export type StageState = 'playing' | 'paused' | 'loading' | 'error' | 'clear';
export type ZoneSetting = Platform | 'off';

/** Z cycles TikTok, Reels, Shorts, off. */
export const ZONE_CYCLE: readonly ZoneSetting[] = ['tiktok', 'reels', 'shorts', 'off'];
export function nextZone(z: ZoneSetting): ZoneSetting {
  return ZONE_CYCLE[(ZONE_CYCLE.indexOf(z) + 1) % ZONE_CYCLE.length] ?? 'off';
}

export interface VideoStageProps {
  state: StageState;
  still?: string;
  /** Spoken description of the still or video. */
  alt?: string;
  size?: PlayerSize;
  formatNote?: string;
  /** Safe zone overlay. Controlled when given. */
  zone?: ZoneSetting;
  defaultZone?: ZoneSetting;
  onZoneChange?: (zone: ZoneSetting) => void;
  /** Called by the play button; the parent owns the playing and paused state. */
  onPlayingChange?: (playing: boolean) => void;
  time?: number;
  duration?: number;
  onSeek?: (seconds: number) => void;
  markers?: readonly ScrubberMarker[];
  /** Loading state. */
  loadingLabel?: string;
  loadingProgress?: number;
  /** Error state. Placeholder strings until real render errors exist (brief section 13). */
  errorReason?: string;
  errorDetail?: string;
  onRenderAgain?: () => void;
  onSkip?: () => void;
  /** Queue clear state. */
  clearCounts?: ReactNode;
  /** Gallery only: draw the scrubber mid-drag. */
  dragging?: boolean;
}

/**
 * The dark stage that holds footage. No brand colour touches it; controls are neutral greys and white, and the focus ring is white.
 * Layout: fills the parent's width; the player inside keeps its fixed 9:16 size, so the parent must be at least that wide plus 32 px.
 */
export function VideoStage({
  state,
  still,
  alt = 'Clip preview',
  size = 'review',
  formatNote = '9:16 · 1080 × 1920 · facecam top',
  zone,
  defaultZone = 'off',
  onZoneChange,
  onPlayingChange,
  time = REVIEW_PLAYBACK.time,
  duration = REVIEW_PLAYBACK.duration,
  onSeek,
  markers = REVIEW_PLAYBACK.markers,
  loadingLabel = 'Loading clip 1 of 8',
  loadingProgress = 62,
  errorReason = 'The render stopped before the captions were burned in.',
  errorDetail = 'render exited with code 1 · c1.log line 214',
  onRenderAgain,
  onSkip,
  clearCounts = '6 kept · 2 skipped',
  dragging,
}: VideoStageProps) {
  const [innerZone, setInnerZone] = useState<ZoneSetting>(defaultZone);
  const currentZone = zone ?? innerZone;
  const cycleZone = () => {
    const next = nextZone(currentZone);
    if (zone === undefined) setInnerZone(next);
    onZoneChange?.(next);
  };
  const playback = state === 'playing' || state === 'paused';

  let placeholder: ReactNode = null;
  if (state === 'loading') {
    placeholder = (
      <div className="hr-stage__state" role="status">
        <Spinner size={30} onStage />
        <p className="hr-stage__title">{loadingLabel}</p>
        <Meter value={loadingProgress} label={loadingLabel} variant="stage" height={5} className="hr-stage__meter" />
      </div>
    );
  } else if (state === 'error') {
    placeholder = (
      <div className="hr-stage__state" role="alert">
        <span className="hr-stage__badge" data-tone="fail" aria-hidden="true"><TriangleAlert /></span>
        <p className="hr-stage__title">This clip didn't render.</p>
        <p className="hr-stage__body">{errorReason}</p>
        <p className="hr-stage__detail">{errorDetail}</p>
        <div className="hr-stage__actions">
          <Button kind="stage" size="sm" icon={<RotateCcw />} onClick={onRenderAgain}>Render again</Button>
          <Button kind="stage" size="sm" icon={<SkipForward />} ariaKeyShortcuts="X" onClick={onSkip}>Skip</Button>
        </div>
      </div>
    );
  } else if (state === 'clear') {
    placeholder = (
      <div className="hr-stage__state" role="status">
        <span className="hr-stage__badge" aria-hidden="true"><Check /></span>
        <p className="hr-stage__title">Queue is clear.</p>
        <p className="hr-stage__body hr-tnum">{clearCounts}</p>
      </div>
    );
  }

  return (
    <div className="hr-stage" data-surface="stage" data-size={size} role="group" aria-label="Video stage">
      <div className="hr-stage__top">
        <span className="hr-stage__note">{formatNote}</span>
        <Button kind="stage" size="sm" icon={<ScanLine />} ariaKeyShortcuts="Z" onClick={cycleZone} disabled={!playback}>
          {`Safe zone: ${currentZone === 'off' ? 'off' : ZONE_LABEL[currentZone]}`}
        </Button>
      </div>
      <div className="hr-stage__player">
        <Player size={size} still={still} alt={alt} placeholder={placeholder}>
          <SafeZoneOverlay platform={currentZone} />
        </Player>
      </div>
      <div className="hr-stage__transport">
        <Transport
          playing={state === 'playing'}
          onPlayingChange={onPlayingChange}
          time={playback ? time : 0}
          duration={duration}
          onSeek={onSeek}
          markers={playback ? markers : []}
          dragging={dragging}
          disabled={!playback}
        />
      </div>
    </div>
  );
}
