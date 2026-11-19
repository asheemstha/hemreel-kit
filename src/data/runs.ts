// Fixtures for the two long jobs on the money path: finding moments in a stream, and rendering the chosen clips.
// Placeholder content invented for the kit: sizes, message counts, timings, the failure reasons and every log line.
// The render rows take their titles and scores from the moments in timeline.ts.
import type { LogLine } from '@/ui/LogViewer';
import type { PipelineStep } from '@/ui/PipelineSteps';
import { CLIPS } from './fixtures';
import { MOMENTS, formatTime } from './timeline';

// ---- finding moments ----

/** The stream New clips has in its link field. */
export const FIND_SOURCE = { channel: 'Dom', title: 'Heist practice', kind: 'Twitch VOD', length: '2:04:11', lengthS: 2 * 3600 + 4 * 60 + 11, workflow: 'Dom heist practice', streamId: 'dom' } as const;

export interface FindStepDef {
  id: string;
  /** The step as a task: "Read chat". */
  label: string;
  /** The step while it runs: "Reading chat". */
  doing: string;
  /** The slice of the whole job this step takes, in percent of the total time. */
  from: number;
  to: number;
  /** One quiet line under the label, by state. `running` gets the step's own percent. */
  queued: string;
  running: (pct: number) => string;
  done: string;
}

export const FIND_STEPS: FindStepDef[] = [
  { id: 'download', label: 'Download the VOD and chat replay', doing: 'Downloading', from: 0, to: 40,
    queued: 'Twitch VOD · 2:04:11', running: (p) => `${((2.7 * p) / 100).toFixed(1)} of 2.7 GB`, done: '2.7 GB · chat replay found' },
  { id: 'chat', label: 'Read chat', doing: 'Reading chat', from: 40, to: 45,
    queued: 'Spikes in chat point at the moments', running: () => 'Counting messages per second', done: '11,860 messages' },
  { id: 'transcribe', label: 'Transcribe', doing: 'Transcribing', from: 45, to: 80,
    queued: 'The words for the captions', running: (p) => `${formatTime((FIND_SOURCE.lengthS * p) / 100)} of ${FIND_SOURCE.length}`, done: `${FIND_SOURCE.length} of speech` },
  { id: 'find', label: 'Find moments', doing: 'Finding moments', from: 80, to: 90,
    queued: 'Chat spikes, loud audio, facecam reactions', running: () => 'Chat spikes, loud audio, facecam reactions', done: `${MOMENTS.length} moments` },
  { id: 'score', label: 'Score each clip', doing: 'Scoring clips', from: 90, to: 100,
    queued: 'An AI guess from 0 to 100', running: (p) => `${Math.round((MOMENTS.length * p) / 100)} of ${MOMENTS.length} scored`, done: `${MOMENTS.length} scored` },
];

/** Rough length of the whole job, for the "about 6 min left" line. */
export const FIND_TOTAL_MIN = 14;
/** The designed moment of the run (what ?freeze shows): download and chat done, transcribing at 41%. */
export const FIND_SNAPSHOT = 45 + 0.41 * 35;

/** The designed failure: the download stops at 23%. */
export const FIND_FAILURE = {
  stepId: 'download',
  overall: 0.23 * 40,
  title: "Couldn't download the video.",
  reason: 'Twitch did not send the video. The VOD may be subscriber only or deleted.',
  code: 'E_DOWNLOAD_403 · placeholder detail',
} as const;

/** The step that owns a point of the run. */
export function findStepAt(overall: number): FindStepDef {
  return FIND_STEPS.find((s) => overall < s.to) ?? FIND_STEPS[FIND_STEPS.length - 1]!;
}

/** A step's own percent at a point of the run. */
export const findStepPct = (step: FindStepDef, overall: number): number => Math.max(0, Math.min(100, ((overall - step.from) / (step.to - step.from)) * 100));

/**
 * The step list at a point of the run.
 * `failed` marks the step in progress as failed with a reason. `stopped` leaves it waiting (the person cancelled).
 */
export function findSteps(overall: number, opts: { failed?: string; stopped?: boolean } = {}): PipelineStep[] {
  const current = overall >= 100 ? null : findStepAt(overall);
  return FIND_STEPS.map((s) => {
    if (overall >= s.to) return { id: s.id, label: s.label, state: 'done', detail: s.done };
    if (s !== current) return { id: s.id, label: s.label, state: 'queued', detail: s.queued };
    const pct = findStepPct(s, overall);
    if (opts.failed) return { id: s.id, label: s.label, state: 'failed', detail: opts.failed };
    if (opts.stopped) return { id: s.id, label: s.label, state: 'queued', detail: `Stopped at ${Math.round(pct)}%` };
    return { id: s.id, label: s.label, state: 'running', detail: s.running(pct), progress: pct };
  });
}

/** "about 6 min left", or "less than a minute left". */
export function findTimeLeft(overall: number): string {
  const min = ((100 - overall) / 100) * FIND_TOTAL_MIN;
  return min < 0.75 ? 'less than a minute left' : `about ${Math.max(1, Math.round(min))} min left`;
}

/** The log of the failed run. */
export const FIND_LOG: LogLine[] = [
  { t: '21:04:11', level: 'info', text: 'Queued Dom · Heist practice with the workflow Dom heist practice.' },
  { t: '21:04:12', level: 'info', text: '[download] Asking Twitch for VOD 2290417733.' },
  { t: '21:04:13', level: 'info', text: '[download] Destination: sources/dom-heist-practice.mp4' },
  { t: '21:04:14', level: 'info', text: '[download] Chat replay found: 11,860 messages.' },
  { t: '21:05:02', level: 'info', text: '[download] 23.0% of 2.70GiB at 12.40MiB/s ETA 02:47' },
  { t: '21:05:03', level: 'warn', text: 'Twitch closed the connection. Trying again, 1 of 3.' },
  { t: '21:05:21', level: 'warn', text: 'Twitch closed the connection. Trying again, 2 of 3.' },
  { t: '21:05:44', level: 'warn', text: 'Twitch closed the connection. Trying again, 3 of 3.' },
  { t: '21:06:10', level: 'error', text: 'HTTP 403 from Twitch on segment 412: the video is not available to this account.' },
  { t: '21:06:10', level: 'info', text: 'Stopped. 0.6 GB is kept, so trying again picks up from 23%.' },
];

// ---- rendering clips ----

export type RenderState = 'queued' | 'rendering' | 'done' | 'failed' | 'cancelled';

export interface RenderRow {
  /** The moment's id. */
  id: string;
  /** The clip id used for the still, where the moment matches one of tonight's clips. */
  clipId: string;
  title: string;
  score: number;
  /** Where the clip starts in the stream, in seconds. */
  start: number;
  seconds: number;
  state: RenderState;
  /** 0 to 100, for the row that is rendering. */
  progress: number;
  /** Why it failed, in plain words. */
  error?: string;
}

/** The stream the Moments screen has open. */
export const RENDER_SOURCE = { channel: 'Tomo', title: 'GTA VI launch night', workflow: 'Tomo launch night' } as const;
/** Rough render time of one clip, for the "about 6 min left" line. */
export const RENDER_SECONDS_PER_CLIP = 65;
export const RENDER_FAILURE = 'The video tools stopped part way through this clip.';

const picked = MOMENTS.filter((m) => m.selected);

function row(m: (typeof MOMENTS)[number], state: RenderState, progress = 0, error?: string): RenderRow {
  return {
    id: m.id,
    clipId: CLIPS.find((c) => c.title === m.title)?.id ?? m.id,
    title: m.title,
    score: m.score,
    start: m.start,
    seconds: Math.round(m.end - m.start),
    state,
    progress,
    error,
  };
}

export type RenderScenario = 'running' | 'fresh' | 'done';

/**
 * The render queue for the ten selected moments.
 * 'running' is the designed moment (what ?freeze shows): three done, one failed, one at 58%, five waiting.
 * 'fresh' is the queue right after "Render 10 clips". 'done' is every clip rendered.
 */
export function renderRows(scenario: RenderScenario = 'running'): RenderRow[] {
  return picked.map((m, i) => {
    if (scenario === 'done') return row(m, 'done', 100);
    if (scenario === 'fresh') return row(m, i === 0 ? 'rendering' : 'queued');
    if (i < 3) return row(m, 'done', 100);
    if (i === 3) return row(m, 'failed', 0, RENDER_FAILURE);
    if (i === 4) return row(m, 'rendering', 58);
    return row(m, 'queued');
  });
}

/** Seconds of rendering still to do: the rest of the running clip and every waiting one. */
export function renderSecondsLeft(rows: RenderRow[]): number {
  return rows.reduce((sum, r) => sum + (r.state === 'rendering' ? (1 - r.progress / 100) * RENDER_SECONDS_PER_CLIP : r.state === 'queued' ? RENDER_SECONDS_PER_CLIP : 0), 0);
}

/** "about 6 min left", "about 30 s left". */
export function renderTimeLeft(seconds: number): string {
  if (seconds < 50) return `about ${Math.max(5, Math.round(seconds / 5) * 5)} s left`;
  return `about ${Math.round(seconds / 60)} min left`;
}

/**
 * One step of the stand-in renderer: the running clip moves on by `step` percent; when it finishes, the next waiting clip starts.
 * A failed or cancelled clip stays as it is until someone asks for it again.
 */
export function advanceRender(rows: RenderRow[], step: number): RenderRow[] {
  let next = rows.map((r) => {
    if (r.state !== 'rendering') return r;
    const progress = Math.min(100, r.progress + step);
    return progress >= 100 ? { ...r, state: 'done' as const, progress: 100 } : { ...r, progress };
  });
  if (!next.some((r) => r.state === 'rendering')) {
    const waiting = next.findIndex((r) => r.state === 'queued');
    if (waiting >= 0) next = next.map((r, i) => (i === waiting ? { ...r, state: 'rendering' as const, progress: 0 } : r));
  }
  return next;
}
