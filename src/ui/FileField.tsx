import { FileVideo, Film, Image as ImageIcon, ImagePlus } from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { Button } from './Button';
import { FieldFrame, useFieldIds } from './Field';
import './file-field.css';

export type FileKind = 'image' | 'video';

/** The file the field holds. The parent owns it: set it in `onPick`, clear it in `onRemove`. */
export interface PickedFile {
  name: string;
  /** Already in words, for example "248 KB". */
  size?: string;
  /** A picture to show: the image itself, or a frame of the video. */
  previewUrl?: string;
}

export interface FileFieldProps {
  label: ReactNode;
  id?: string;
  kind: FileKind;
  /** What the picker offers and a drop accepts, in `accept` syntax. Defaults by kind. */
  accept?: string;
  /** The same formats in words, for the message when a wrong file arrives: "PNG, JPG or WebP". Defaults by kind. */
  formats?: string;
  file?: PickedFile | null;
  onPick: (file: File) => void;
  onRemove: () => void;
  help?: ReactNode;
  /** Makes the field invalid and replaces the help line. A wrong file type sets its own message. */
  error?: ReactNode;
  disabled?: boolean;
  hideLabel?: boolean;
  /** Gallery only: show the drag-over look without a real drag. */
  state?: 'drag-over';
}

const DEFAULTS: Record<FileKind, { accept: string; formats: string; noun: string; prompt: string }> = {
  image: { accept: 'image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp', formats: 'PNG, JPG or WebP', noun: 'an image', prompt: 'Drop an image or choose one' },
  video: { accept: 'video/*,.mp4,.mov,.mkv,.webm,.m4v', formats: 'MP4, MOV, MKV or WebM', noun: 'a video', prompt: 'Drop a video or choose one' },
};

/** A file size in words: 248_000 becomes "248 KB", 18_400_000 becomes "18.4 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`;
  if (bytes < 1_000_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
}

/** True when the file fits an `accept` list: ".png" by extension, "image/*" by family, "image/png" exactly. */
function fits(file: File, accept: string): boolean {
  const name = file.name.toLowerCase();
  return accept.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).some((t) => {
    if (t.startsWith('.')) return name.endsWith(t);
    if (t.endsWith('/*')) return file.type.startsWith(t.slice(0, -1));
    return file.type === t;
  });
}

/**
 * One image or one short video, with a preview: the campaign overlay image, a sample video for the facecam finder.
 * Empty, it is a small drop target with a "Choose" button. Holding a file, it shows a preview, the name and size, and "Replace" and "Remove".
 * Layout: fills the parent's width and is 56 px tall in both states (taller only when a long name wraps), so nothing jumps when a file arrives.
 */
export function FileField({ label, id, kind, accept, formats, file, onPick, onRemove, help, error, disabled, hideLabel, state }: FileFieldProps) {
  const { labelId, msgId } = useFieldIds(id);
  const defaults = DEFAULTS[kind];
  const acceptList = accept ?? defaults.accept;
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const replaceRef = useRef<HTMLButtonElement>(null);
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);
  const depth = useRef(0);

  // The button that was pressed goes away when the file arrives or leaves, so focus moves to the one that takes its place.
  const refocus = useRef<'choose' | 'replace' | null>(null);
  const hasFile = Boolean(file);
  useEffect(() => {
    const want = refocus.current;
    refocus.current = null;
    if (want === 'replace' && hasFile) replaceRef.current?.focus();
    else if (want === 'choose' && !hasFile) chooseRef.current?.focus();
  }, [hasFile]);

  const take = (picked: File | undefined, fromButton: boolean) => {
    if (!picked || disabled) return;
    if (!fits(picked, acceptList)) {
      setRejected(picked.name);
      return;
    }
    setRejected(null);
    if (fromButton) refocus.current = 'replace';
    onPick(picked);
  };
  const remove = () => {
    setRejected(null);
    refocus.current = 'choose';
    onRemove();
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    depth.current += 1;
    setOver(true);
  };
  const onDragLeave = () => {
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setOver(false);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    depth.current = 0;
    setOver(false);
    take(e.dataTransfer.files[0], false);
  };

  const wrongType = rejected ? `${rejected} isn't ${defaults.noun}. Use ${formats ?? defaults.formats}.` : null;
  const shownError = error ?? wrongType;
  const dragging = state === 'drag-over' || over;
  const EmptyIcon = kind === 'image' ? ImagePlus : FileVideo;
  return (
    <FieldFrame label={label} labelId={labelId} hideLabel={hideLabel} help={help} error={shownError} msgId={msgId}>
      {/* the drop target is a plain box; the group inside it carries the name */}
      <div className="hr-file-drop" onDragEnter={onDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div
        className="hr-file"
        role="group"
        aria-labelledby={labelId}
        aria-describedby={shownError || help ? msgId : undefined}
        data-filled={hasFile || undefined}
        data-drag={dragging || undefined}
        data-disabled={disabled || undefined}
        aria-disabled={disabled || undefined}
      >
        {file ? (
          <>
            <span className="hr-file__preview" data-kind={kind}>
              {file.previewUrl ? <img src={file.previewUrl} alt="" draggable={false} /> : kind === 'video' ? <Film aria-hidden="true" /> : <ImageIcon aria-hidden="true" />}
            </span>
            <span className="hr-file__body">
              <span className="hr-file__meta">
                <span className="hr-file__name">{file.name}</span>
                {file.size ? <span className="hr-file__size hr-tnum">{file.size}</span> : null}
              </span>
              <span className="hr-file__actions">
                <Button ref={replaceRef} size="sm" disabled={disabled} onClick={() => inputRef.current?.click()}>Replace</Button>
                <Button size="sm" kind="ghost" disabled={disabled} onClick={remove}>Remove</Button>
              </span>
            </span>
          </>
        ) : (
          <>
            <EmptyIcon className="hr-file__icon" aria-hidden="true" />
            <span className="hr-file__prompt">{dragging ? 'Drop to use this file' : defaults.prompt}</span>
            <Button ref={chooseRef} size="sm" disabled={disabled} onClick={() => inputRef.current?.click()}>Choose</Button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={acceptList}
          className="hr-sr-only"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
          onChange={(e) => {
            take(e.target.files?.[0], true);
            e.target.value = '';
          }}
        />
        <span className="hr-sr-only" role="status">{wrongType ? `Error: ${wrongType}` : ''}</span>
      </div>
      </div>
    </FieldFrame>
  );
}
