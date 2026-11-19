import { Pause, Play } from 'lucide-react';
import { formatTime } from '@/data/timeline';
import { IconButton } from './IconButton';
import { Kbd } from './Kbd';
import { Scrubber, type ScrubberMarker } from './Scrubber';
import './transport.css';

export interface TransportProps {
  playing: boolean;
  onPlayingChange?: (playing: boolean) => void;
  /** Seconds into the clip. */
  time: number;
  duration: number;
  onSeek?: (seconds: number) => void;
  markers?: readonly ScrubberMarker[];
  /** Gallery only: draw the scrubber mid-drag. */
  dragging?: boolean;
  disabled?: boolean;
}

/** Play or pause, the mono time, the scrubber and the Space keycap. */
export function Transport({ playing, onPlayingChange, time, duration, onSeek, markers, dragging, disabled }: TransportProps) {
  return (
    <div className="hr-transport">
      <IconButton
        kind="stage"
        round
        size={44}
        aria-label={playing ? 'Pause' : 'Play'}
        icon={playing ? <Pause /> : <Play />}
        shortcut="Space"
        onClick={() => onPlayingChange?.(!playing)}
        disabled={disabled}
      />
      <span className="hr-transport__time hr-tnum">
        {formatTime(time, { tenths: true })} <span className="hr-transport__dur">/ {formatTime(duration, { tenths: true })}</span>
      </span>
      <Scrubber value={time} max={duration} onChange={onSeek} markers={markers} dragging={dragging} disabled={disabled} label="Playhead" />
      <Kbd tone="stage" decorative hint>Space</Kbd>
    </div>
  );
}
