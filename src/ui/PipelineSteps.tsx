import { Check, CircleAlert, Minus } from 'lucide-react';
import { Meter } from './Meter';
import { Spinner } from './Spinner';
import './pipeline-steps.css';

export type StepState = 'queued' | 'running' | 'done' | 'failed' | 'skipped';

export interface PipelineStep {
  id: string;
  /** "Downloading", "Finding moments". */
  label: string;
  state: StepState;
  /** A short note: "41%", "2 of 10 clips", or the reason a step failed. */
  detail?: string;
  /** 0 to 100, for the running step. Leave it out when the amount of work is unknown. */
  progress?: number;
}

export interface PipelineStepsProps {
  steps: PipelineStep[];
  /** 'vertical' is the full list for a progress screen. 'horizontal' is one compact row for a project card. */
  orientation?: 'horizontal' | 'vertical';
  /** Accessible name, for example "Finding moments in Tomo · GTA VI launch night". */
  label: string;
}

const STATE_WORD: Record<StepState, string> = { queued: 'Waiting', running: 'Running', done: 'Done', failed: 'Failed', skipped: 'Skipped' };
const pct = (v: number) => Math.round(Math.min(100, Math.max(0, v)));

/** What to say when the step changes. The percent is left out so a screen reader is not flooded. */
function announcement(steps: PipelineStep[]): string {
  const failed = steps.find((s) => s.state === 'failed');
  if (failed) return `Failed at ${failed.label}${failed.detail ? `. ${failed.detail}` : ''}`;
  const running = steps.find((s) => s.state === 'running');
  if (running) return `Now: ${running.label}`;
  if (steps.length > 0 && steps.every((s) => s.state === 'done' || s.state === 'skipped')) return 'All steps done';
  return '';
}

function Marker({ state }: { state: StepState }) {
  return (
    <span className="hr-pipe__marker" data-state={state} aria-hidden="true">
      {state === 'done' ? <Check /> : state === 'running' ? <Spinner size={20} /> : state === 'failed' ? <CircleAlert /> : state === 'skipped' ? <Minus /> : <span className="hr-pipe__dot" />}
    </span>
  );
}

/**
 * What a project or job is doing: queued, downloading, finding, rendering, done.
 * Vertical lists every step with the running one's progress. Horizontal is a compact row that names only the current step.
 * Layout: vertical fills the parent's width. Horizontal hugs its content and wraps the text under the markers when it does not fit.
 */
export function PipelineSteps({ steps, orientation = 'vertical', label }: PipelineStepsProps) {
  const live = <span className="hr-sr-only" aria-live="polite">{announcement(steps)}</span>;

  if (orientation === 'horizontal') {
    const failed = steps.find((s) => s.state === 'failed');
    const running = steps.find((s) => s.state === 'running');
    const allDone = steps.length > 0 && steps.every((s) => s.state === 'done' || s.state === 'skipped');
    const next = steps.find((s) => s.state === 'queued');
    return (
      <div className="hr-pipe" data-orientation="horizontal" role="group" aria-label={label}>
        <ol className="hr-pipe__track">
          {steps.map((s) => (
            <li key={s.id} className="hr-pipe__seg" data-state={s.state} aria-current={s.state === 'running' ? 'step' : undefined}>
              {s.state === 'running' ? <span className="hr-pipe__seg-fill" style={{ width: `${s.progress === undefined ? 40 : pct(s.progress)}%` }} /> : null}
              <span className="hr-sr-only">{`${s.label}: ${STATE_WORD[s.state]}`}</span>
            </li>
          ))}
        </ol>
        <span className="hr-pipe__now" data-state={failed ? 'failed' : allDone ? 'done' : running ? 'running' : 'queued'}>
          {failed ? (
            <>
              <CircleAlert aria-hidden="true" />
              <span>{`Failed at ${failed.label.toLowerCase()}`}</span>
            </>
          ) : allDone ? (
            <>
              <Check aria-hidden="true" />
              <span>Done</span>
            </>
          ) : running ? (
            <>
              <span>{running.label}</span>
              {running.progress !== undefined ? <span className="hr-pipe__pct hr-tnum">{`${pct(running.progress)}%`}</span> : running.detail ? <span className="hr-pipe__pct hr-tnum">{running.detail}</span> : null}
            </>
          ) : (
            <span>{next ? 'Queued' : ''}</span>
          )}
        </span>
        {live}
      </div>
    );
  }

  return (
    <div className="hr-pipe" data-orientation="vertical">
      <ol className="hr-pipe__list" aria-label={label}>
        {steps.map((s) => (
          <li key={s.id} className="hr-pipe__step" data-state={s.state} aria-current={s.state === 'running' ? 'step' : undefined}>
            <Marker state={s.state} />
            <div className="hr-pipe__text">
              <div className="hr-pipe__head">
                <span className="hr-pipe__label">{s.label}</span>
                {s.state === 'failed' || s.state === 'skipped' ? <span className="hr-pipe__word">{STATE_WORD[s.state]}</span> : null}
                {s.state === 'done' || s.state === 'queued' ? <span className="hr-sr-only">{`, ${STATE_WORD[s.state].toLowerCase()}`}</span> : null}
                {s.state === 'running' && s.progress !== undefined ? <span className="hr-pipe__pct hr-tnum">{`${pct(s.progress)}%`}</span> : null}
              </div>
              {s.detail ? <p className="hr-pipe__detail hr-tnum">{s.detail}</p> : null}
              {s.state === 'running' ? (
                <Meter value={s.progress} label={`${s.label} progress`} valueText={s.progress === undefined ? 'Working' : `${pct(s.progress)} percent`} />
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      {live}
    </div>
  );
}
