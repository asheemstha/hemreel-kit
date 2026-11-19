import { CircleAlert, CircleCheck, FileVideo } from 'lucide-react';
import { useId, useRef, useState, type DragEvent } from 'react';
import './button.css';
import './drop-zone.css';

export type DropZoneState = 'idle' | 'drag-over' | 'chosen' | 'wrong-type';

export interface DropZoneProps {
  /** Force a state, for the gallery. Without it the zone reacts to real drags and file picks. */
  state?: DropZoneState;
  /** Name shown in the chosen and wrong-type states when forced. */
  fileName?: string;
  onFile?: (file: File) => void;
  accept?: string;
}

const isVideo = (f: File) => f.type.startsWith('video/') || /\.(mp4|mov|mkv|webm|m4v)$/i.test(f.name);

/**
 * Drop a video file or choose one. 76 px tall, dashed --edge outline.
 * Layout: fills the parent's width.
 */
export function DropZone({ state: forced, fileName: forcedName, onFile, accept = 'video/*,.mkv' }: DropZoneProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [live, setLive] = useState<DropZoneState>('idle');
  const [name, setName] = useState<string>('');
  const depth = useRef(0);
  const state = forced ?? live;
  const shownName = forcedName ?? name;

  const take = (file: File | undefined) => {
    if (!file) return;
    setName(file.name);
    if (isVideo(file)) {
      setLive('chosen');
      onFile?.(file);
    } else setLive('wrong-type');
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    depth.current += 1;
    setLive('drag-over');
  };
  const onDragLeave = () => {
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setLive((s) => (s === 'drag-over' ? 'idle' : s));
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    depth.current = 0;
    take(e.dataTransfer.files[0]);
  };

  const title = state === 'drag-over' ? 'Drop to use this file' : state === 'chosen' ? shownName : state === 'wrong-type' ? "That file isn't a video" : 'Drop a video file';
  const hint =
    state === 'chosen' ? 'Ready. Choose a workflow next.' : state === 'wrong-type' ? `${shownName || 'This file'} can't be clipped. Use MP4, MOV, MKV or WebM.` : 'MP4, MOV, MKV or WebM from your disk';
  const Icon = state === 'chosen' ? CircleCheck : state === 'wrong-type' ? CircleAlert : FileVideo;

  return (
    <div className="hr-drop" data-state={state} onDragEnter={onDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={onDragLeave} onDrop={onDrop}>
      <Icon className="hr-drop__icon" aria-hidden="true" />
      <div className="hr-drop__text" aria-live="polite">
        <p className="hr-drop__title">{title}</p>
        <p className="hr-drop__hint">
          {state === 'wrong-type' ? <span className="hr-sr-only">Error: </span> : null}
          {hint}
        </p>
      </div>
      <input ref={inputRef} id={`${id}-file`} type="file" accept={accept} className="hr-sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => take(e.target.files?.[0])} />
      <button type="button" className="hr-btn" data-kind="secondary" data-size="md" onClick={() => inputRef.current?.click()}>
        {state === 'chosen' ? 'Choose another' : 'Choose file'}
      </button>
    </div>
  );
}
