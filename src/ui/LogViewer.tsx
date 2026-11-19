import { ArrowDown, Download } from 'lucide-react';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { CopyButton } from './CopyButton';
import './log-viewer.css';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogLine {
  /** Time of the line, already formatted: "21:04:11". */
  t: string;
  level: LogLevel;
  text: string;
}

export interface LogViewerProps {
  lines: LogLine[];
  title?: string;
  /** Keep the newest line in view while the reader is at the bottom. Scrolling up pauses it. */
  follow?: boolean;
  /** Height in px before the lines scroll. */
  maxHeight?: number;
  /** Called with the whole log as text. Without it, Save downloads a .txt file. */
  onSave?: (text: string) => void;
  /** File name for the default download, without the extension. */
  fileName?: string;
}

const LEVEL_WORD: Record<LogLevel, string> = { info: '', warn: 'Warning', error: 'Error' };

/** The whole log as plain text, one line each: what Copy and Save hand over. */
export function logText(lines: LogLine[]): string {
  return lines.map((l) => `${l.t} ${l.level === 'info' ? '' : `${LEVEL_WORD[l.level].toUpperCase()} `}${l.text}`).join('\n');
}

function download(text: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * The log of a run, for failed jobs and for support: time, the word Warning or Error where it applies, and the message. Copy or save the lot.
 * It follows the newest line until the reader scrolls up, then offers "Jump to latest".
 * Layout: fills the parent's width; the lines scroll inside `maxHeight`.
 */
export function LogViewer({ lines, title = 'Log', follow = true, maxHeight = 320, onSave, fileName = 'hemreel-log' }: LogViewerProps) {
  const id = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const [paused, setPaused] = useState(false);

  const toBottom = () => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    atBottom.current = true;
    setPaused(false);
  };
  // New lines keep the tail in view, but only while the reader has not scrolled away.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && follow && atBottom.current) el.scrollTop = el.scrollHeight;
  }, [lines.length, follow]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    setPaused(!atBottom.current);
  };
  const save = () => {
    const text = logText(lines);
    if (onSave) onSave(text);
    else download(text, fileName);
  };

  return (
    <div className="hr-log" role="group" aria-labelledby={`${id}-title`}>
      <div className="hr-log__head">
        <span className="hr-log__title" id={`${id}-title`}>{title}</span>
        <span className="hr-log__count hr-tnum">{`${lines.length.toLocaleString('en-US')} ${lines.length === 1 ? 'line' : 'lines'}`}</span>
        <span className="hr-log__actions">
          <CopyButton text={() => logText(lines)} label="Copy" disabled={lines.length === 0} />
          <Button size="sm" icon={<Download />} onClick={save} disabled={lines.length === 0}>Save</Button>
        </span>
      </div>
      {/* a scroll region has to be reachable from the keyboard */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div ref={scroller} className="hr-log__scroll" role="log" aria-label={`${title} lines`} tabIndex={0} style={{ maxHeight }} onScroll={onScroll}>
        {lines.length === 0 ? (
          <p className="hr-log__empty">Nothing logged yet.</p>
        ) : (
          lines.map((l, i) => (
            <div key={i} className="hr-log__line" data-level={l.level}>
              <span className="hr-log__time hr-tnum">{l.t}</span>
              <span className="hr-log__text">
                {l.level === 'info' ? null : <span className="hr-log__level">{LEVEL_WORD[l.level]}</span>}
                {l.text}
              </span>
            </div>
          ))
        )}
      </div>
      {follow && paused ? (
        <span className="hr-log__jump">
          <Button kind="dark" size="sm" icon={<ArrowDown />} onClick={toBottom}>Jump to latest</Button>
        </span>
      ) : null}
    </div>
  );
}
