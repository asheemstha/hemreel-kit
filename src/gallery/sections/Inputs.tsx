import { useEffect, useRef, useState } from 'react';
import { CLIPS } from '@/data/fixtures';
import { SOURCE_FRAME } from '@/data/stills';
import { Button } from '@/ui/Button';
import { FileField, formatFileSize, type FileKind, type PickedFile } from '@/ui/FileField';
import { NumberField } from '@/ui/NumberField';
import { SearchField, type SearchFieldProps } from '@/ui/SearchField';
import { SecretField, type SecretFieldProps, type SecretStatus } from '@/ui/SecretField';
import { Slider } from '@/ui/Slider';
import { TimecodeField } from '@/ui/TimecodeField';
import { GalleryGroup, GallerySection, Row, Specimen, Stack } from '../Specimen';

const STREAM_LENGTH = 3 * 3600 + 12 * 60 + 40; // Tomo, GTA VI launch night: 3:12:40
const SAMPLE_KEY = 'sk-ant-EXAMPLE-0000'; // not a real key; short so it fits the field

const noop = () => {};

const seconds = (v: number) => `${v} s`;
const percent = (v: number) => `${v}%`;
const pixels = (v: number) => `${v} px`;
const pan = (v: number) => (v === 0 ? 'Centre' : v < 0 ? `${-v}% left` : `${v}% right`);

function LiveTimecode({ label, initial, min, max, help, shortcut, block }: { label: string; initial: number; min?: number; max?: number; help?: string; shortcut?: string; block?: boolean }) {
  const [v, setV] = useState(initial);
  return <TimecodeField label={label} value={v} onChange={setV} min={min} max={max} help={help} shortcut={shortcut} block={block} />;
}

/** A search field you can type in, starting from `initial`. */
function HeldSearch({ initial = '', ...rest }: Omit<SearchFieldProps, 'value' | 'onValueChange'> & { initial?: string }) {
  const [text, setText] = useState(initial);
  return <SearchField {...rest} value={text} onValueChange={setText} />;
}

/** A key field pinned to one status, so each state can be seen. Typing and Remove still work. */
function HeldSecret({ initial = SAMPLE_KEY, ...rest }: Omit<SecretFieldProps, 'value' | 'onValueChange' | 'onTest' | 'onRemove'> & { initial?: string }) {
  const [key, setKey] = useState(initial);
  return <SecretField {...rest} value={key} onValueChange={setKey} onTest={noop} onRemove={() => setKey('')} />;
}

/** Type a key, test it, remove it. Keys that start with "sk-ant-" pass; anything else is rejected. */
function LiveSecret() {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<SecretStatus>('empty');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <SecretField
      label="Claude API key"
      value={key}
      onValueChange={(v) => {
        window.clearTimeout(timer.current);
        setKey(v);
        setStatus(v ? 'saved' : 'empty');
      }}
      status={status}
      statusText={status === 'failed' ? 'The key was rejected. Copy it again from the Claude console.' : undefined}
      onTest={() => {
        setStatus('testing');
        timer.current = window.setTimeout(() => setStatus(key.startsWith('sk-ant-') ? 'ok' : 'failed'), 900);
      }}
      onRemove={() => {
        window.clearTimeout(timer.current);
        setKey('');
        setStatus('empty');
      }}
      help="Used to score clips. Stored on this Mac only."
    />
  );
}

function LiveSearch() {
  const [text, setText] = useState('');
  const found = CLIPS.filter((c) => c.title.toLowerCase().includes(text.trim().toLowerCase()));
  const count = `${found.length} ${found.length === 1 ? 'clip' : 'clips'}`;
  return (
    <Stack gap={8}>
      <SearchField label="Search clips" placeholder="Search clips" value={text} onValueChange={setText} count={count} shortcut="/" />
      <p className="hr-tnum">{text ? `${count} match "${text.trim()}"` : `${count} in all`}</p>
    </Stack>
  );
}

function LiveFile({ kind, label, help }: { kind: FileKind; label: string; help: string }) {
  const [file, setFile] = useState<PickedFile | null>(null);
  const url = useRef<string | null>(null);
  const forget = () => {
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
  };
  useEffect(() => forget, []);
  return (
    <FileField
      label={label}
      kind={kind}
      file={file}
      help={help}
      onPick={(f) => {
        forget();
        if (kind === 'image') url.current = URL.createObjectURL(f);
        setFile({ name: f.name, size: formatFileSize(f.size), previewUrl: url.current ?? undefined });
      }}
      onRemove={() => {
        forget();
        setFile(null);
      }}
    />
  );
}


export function InputsSection() {
  return (
    <GalleryGroup id="inputs" title="More inputs">
      <GallerySection id="slider" title="Slider" note="For light surfaces. 4 px track, ink fill, the same white knob as the Toggle. The value shows at the right of the label.">
        <Specimen label="default · arrow keys step, Home and End jump">
          <Slider label="Clip length" defaultValue={24} min={8} max={60} format={seconds} />
        </Specimen>
        <Specimen label="with help">
          <Slider label="Caption height" defaultValue={68} format={percent} help="How far down the frame the captions sit." />
        </Specimen>
        <Specimen label="mark · a drag snaps to centre">
          <Slider label="Gameplay pan" defaultValue={0} min={-50} max={50} marks={[0]} format={pan} help="Slides the gameplay left or right inside the 9:16 frame." />
        </Specimen>
        <Specimen label="half steps">
          <Slider label="Outline width" defaultValue={3.5} min={0} max={8} step={0.5} format={pixels} />
        </Specimen>
        <Specimen label="at the minimum · at the maximum">
          <Stack gap={16}>
            <Slider label="Caption size" defaultValue={24} min={24} max={96} format={pixels} />
            <Slider label="Caption size" defaultValue={96} min={24} max={96} format={pixels} />
          </Stack>
        </Specimen>
        <Specimen label="disabled">
          <Slider label="Caption size" defaultValue={56} min={24} max={96} format={pixels} disabled />
        </Specimen>
      </GallerySection>

      <GallerySection id="number-field" title="NumberField" note="A typed number with its unit. Arrow keys step, Shift steps by 10, holding a button repeats. Hugs its content.">
        <Specimen label="default · unit">
          <NumberField label="Clips to find" defaultValue={10} min={1} max={30} unit="clips" />
        </Specimen>
        <Specimen label="seconds · help">
          <NumberField label="Clip length" defaultValue={24} min={8} max={60} unit="s" unitLabel="seconds" help="8 to 60 s. Most campaigns ask for 15 s or more." />
        </Specimen>
        <Specimen label="step 5">
          <NumberField label="Gap between clips" defaultValue={30} min={0} max={120} step={5} unit="s" unitLabel="seconds" />
        </Specimen>
        <Specimen label="no unit · at the maximum (plus is off)">
          <NumberField label="Words at a time" defaultValue={6} min={1} max={6} />
        </Specimen>
        <Specimen label="size 44">
          <NumberField label="Check every" defaultValue={2} min={1} max={30} unit="min" unitLabel="minutes" size={44} />
        </Specimen>
        <Specimen label="block (fills the width)">
          <NumberField label="Minutes of stream" defaultValue={60} min={5} max={720} step={5} unit="min" unitLabel="minutes" block />
        </Specimen>
        <Specimen label="invalid">
          <NumberField label="Clip length" defaultValue={12} min={8} max={60} unit="s" unitLabel="seconds" error="The Tomo campaign needs clips of 15 s or longer." />
        </Specimen>
        <Specimen label="disabled">
          <NumberField label="Clips to find" defaultValue={10} min={1} max={30} unit="clips" disabled />
        </Specimen>
      </GallerySection>

      <GallerySection id="timecode-field" title="TimecodeField" note="A time you type. Accepts h:mm:ss, m:ss or seconds. Up and Down move it by 1 s, with Shift 10 s, with Alt 0.1 s.">
        <Specimen label="default · type 87:09 or 5229.2 and press Enter">
          <LiveTimecode label="Scan from" initial={0} max={STREAM_LENGTH} />
        </Specimen>
        <Specimen label="limits · type 4:00:00 to see it move back">
          <LiveTimecode label="Scan until" initial={STREAM_LENGTH} max={STREAM_LENGTH} help="The stream is 3:12:40 long." />
        </Specimen>
        <Specimen label="bad entry">
          <TimecodeField label="Scan from" value={0} onChange={noop} initialText="1:75:00" />
        </Specimen>
        <Specimen label="exact trim · tenths">
          <LiveTimecode label="Start" initial={5229.2} max={STREAM_LENGTH} shortcut="I" help="Alt with Up or Down moves it by 0.1 s." />
        </Specimen>
        <Specimen label="block (fills the width)">
          <LiveTimecode label="End" initial={5253.4} max={STREAM_LENGTH} block />
        </Specimen>
        <Specimen label="disabled">
          <TimecodeField label="Scan until" value={STREAM_LENGTH} onChange={noop} disabled />
        </Specimen>
      </GallerySection>

      <GallerySection id="secret-field" title="SecretField" note="An API key. Masked until you show it. The test result is an icon with words, on its own line under the buttons.">
        <Specimen label="empty">
          <HeldSecret label="Claude API key" initial="" help="Used to score clips. Stored on this Mac only." />
        </Specimen>
        <Specimen label="saved · not tested yet">
          <HeldSecret label="Claude API key" status="saved" help="Used to score clips. Stored on this Mac only." />
        </Specimen>
        <Specimen label="shown">
          <HeldSecret label="Posting service key" status="saved" defaultRevealed />
        </Specimen>
        <Specimen label="testing">
          <HeldSecret label="Claude API key" status="testing" />
        </Specimen>
        <Specimen label="key works">
          <HeldSecret label="Claude API key" status="ok" />
        </Specimen>
        <Specimen label="rejected · with the reason">
          <HeldSecret label="Claude API key" status="failed" statusText="The key was rejected. Copy it again from the Claude console." />
        </Specimen>
        <Specimen label="live · keys that start with sk-ant- pass">
          <LiveSecret />
        </Specimen>
        <Specimen label="disabled">
          <HeldSecret label="Posting service key" status="saved" disabled />
        </Specimen>
      </GallerySection>

      <GallerySection id="search-field" title="SearchField" note="The label is for assistive tech. A clear button appears once there is text. Esc clears, and a second Esc leaves the field.">
        <Specimen label="empty">
          <HeldSearch label="Search projects" placeholder="Search projects" />
        </Specimen>
        <Specimen label="with text · clear button">
          <HeldSearch label="Search projects" placeholder="Search projects" initial="tomo" />
        </Specimen>
        <Specimen label="live · filters the 14 fixture clips">
          <LiveSearch />
        </Specimen>
        <Specimen label="sizes 44 · 48">
          <Stack gap={12}>
            <HeldSearch label="Search the transcript" placeholder="Search the transcript" size={44} />
            <HeldSearch label="Search channels" placeholder="Search channels" size={48} />
          </Stack>
        </Specimen>
        <Specimen label="visible label">
          <HeldSearch label="Find a word in the captions" showLabel placeholder="chat" />
        </Specimen>
        <Specimen label="in a toolbar · 240 px box">
          <Row gap={8} wrap={false}>
            <div style={{ width: 240, minWidth: 0 }}>
              <HeldSearch label="Search projects" placeholder="Search projects" />
            </div>
            <Button>Filter</Button>
          </Row>
        </Specimen>
        <Specimen label="disabled">
          <HeldSearch label="Search projects" placeholder="Search projects" disabled />
        </Specimen>
      </GallerySection>

      <GallerySection id="file-field" title="FileField" note="One image or one short video. 56 px tall empty and full, so the form does not jump. Drop a file on it or use the button.">
        <Specimen label="empty · image">
          <FileField label="Campaign overlay image" kind="image" file={null} onPick={noop} onRemove={noop} help="A PNG with a clear background works best." />
        </Specimen>
        <Specimen label="empty · video">
          <FileField label="Sample video" kind="video" file={null} onPick={noop} onRemove={noop} help="One minute of the stream is enough to find the facecam." />
        </Specimen>
        <Specimen label="holding an image">
          <FileField label="Campaign overlay image" kind="image" file={{ name: 'tomo-overlay.png', size: '248 KB', previewUrl: SOURCE_FRAME }} onPick={noop} onRemove={noop} />
        </Specimen>
        <Specimen label="holding a video · no preview frame">
          <FileField label="Sample video" kind="video" file={{ name: 'lacy-sample.mp4', size: '18.4 MB' }} onPick={noop} onRemove={noop} />
        </Specimen>
        <Specimen label="a file is dragged over it">
          <FileField label="Campaign overlay image" kind="image" file={null} onPick={noop} onRemove={noop} state="drag-over" />
        </Specimen>
        <Specimen label="wrong type">
          <FileField label="Campaign overlay image" kind="image" file={null} onPick={noop} onRemove={noop} error="clip-notes.txt isn't an image. Use PNG, JPG or WebP." />
        </Specimen>
        <Specimen label="long name wraps">
          <FileField label="Campaign overlay image" kind="image" file={{ name: 'tomo-gta-vi-launch-night-overlay-final-v3.png', size: '1.2 MB', previewUrl: SOURCE_FRAME }} onPick={noop} onRemove={noop} />
        </Specimen>
        <Specimen label="live · choose or drop a file">
          <Stack gap={16}>
            <LiveFile kind="image" label="Campaign overlay image" help="A PNG with a clear background works best." />
            <LiveFile kind="video" label="Sample video" help="One minute of the stream is enough to find the facecam." />
          </Stack>
        </Specimen>
        <Specimen label="disabled">
          <FileField label="Campaign overlay image" kind="image" file={{ name: 'tomo-overlay.png', size: '248 KB', previewUrl: SOURCE_FRAME }} onPick={noop} onRemove={noop} disabled />
        </Specimen>
      </GallerySection>
    </GalleryGroup>
  );
}
