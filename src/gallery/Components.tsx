import { Component, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { Button } from '@/ui/Button';

// Sections load by file so the page keeps working while a group is still being built.
const modules = import.meta.glob<Record<string, ComponentType>>('./sections/*.tsx', { eager: true });
const ORDER = ['Primitives', 'Forms', 'Inputs', 'Pickers', 'Shell', 'Blocks', 'Overlays', 'Clip', 'Stage', 'Data'];
const SECTIONS = ORDER.flatMap((name) => {
  const mod = modules[`./sections/${name}.tsx`];
  const C = mod?.[`${name}Section`];
  return C ? [{ name, C }] : [];
});

const TOC: Array<[string, string[]]> = [
  ['Primitives', ['button', 'iconbutton', 'kbd', 'chip', 'score', 'livepill', 'avatar', 'thumb', 'meter', 'card', 'divider', 'skeleton', 'spinner', 'tooltip', 'logo']],
  ['Form controls', ['field', 'textarea', 'toggle', 'segmented', 'checkbox', 'radiocard', 'stepper', 'select', 'dropzone', 'caption-editor', 'trim-row', 'spend-meter', 'facecam-layout']],
  ['More inputs', ['slider', 'number-field', 'timecode-field', 'secret-field', 'search-field', 'file-field']],
  ['Pickers and tags', ['color-field', 'font-picker', 'tag-input', 'template-field', 'date-picker']],
  ['Navigation and shell', ['app-shell', 'sidebar', 'nav-item', 'rail', 'top-bar', 'due-chip', 'stream-row']],
  ['Navigation and content', ['tabs', 'accordion', 'breadcrumb', 'pagination', 'pipeline-steps', 'copy-button', 'inline-edit', 'clip-card', 'bulk-bar', 'log-viewer']],
  ['Overlays', ['dialog', 'confirm-dialog', 'popover', 'context-menu', 'drawer', 'command-palette']],
  ['Clip and review', ['stat-card', 'job-row', 'countdown', 'thumb-strip', 'queue-row', 'progress-pips', 'score-card', 'band-track', 'earn-box', 'decision-bar', 'toast', 'shortcut-sheet', 'banner', 'empty-state']],
  ['Video stage and timeline', ['video-stage', 'player', 'safe-zone', 'transport', 'scrubber', 'source-preview', 'moment-list', 'timeline-overview', 'timeline-detail', 'lane-bars']],
  ['Data display', ['table', 'channel-cell', 'settings-row', 'check-row', 'step-list', 'pay-terms']],
];

/** One group failing to render must not blank the rest of the page. */
class SectionBoundary extends Component<{ name: string; children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };
  static getDerivedStateFromError(error: unknown) {
    return { message: error instanceof Error ? error.message : String(error) };
  }
  render() {
    if (this.state.message === null) return this.props.children;
    return <p role="alert" className="g-lede">{`The ${this.props.name} group failed to render: ${this.state.message}`}</p>;
  }
}

const label = (id: string) => id.split('-').map((w, i) => (i === 0 ? w[0]?.toUpperCase() + w.slice(1) : w)).join(' ');

/** Gallery toggle that forces reduced motion so the effect can be seen without changing system settings. */
export function ReducedMotionToggle() {
  const [on, setOn] = useState(() => document.documentElement.dataset.motion === 'reduce');
  useEffect(() => {
    if (on) document.documentElement.dataset.motion = 'reduce';
    else delete document.documentElement.dataset.motion;
  }, [on]);
  return (
    <Button size="sm" kind={on ? 'dark' : 'secondary'} aria-pressed={on} onClick={() => setOn((v) => !v)}>
      {on ? 'Reduced motion on' : 'Reduce motion'}
    </Button>
  );
}

export function Components() {
  return (
    <main className="g-page" id="main">
      <h1 className="g-h1">Components</h1>
      <p className="g-lede">Every component in the kit, with every state labelled. Interactive ones are live: hover, focus with Tab, press, and use the arrow keys.</p>
      <div className="g-layout">
        <nav className="g-toc" aria-label="Components">
          {TOC.map(([group, ids]) => (
            <div key={group} className="g-stack" data-gap="8">
              <strong>{group}</strong>
              {ids.map((id) => <a key={id} href={`#${id}`}>{label(id)}</a>)}
            </div>
          ))}
        </nav>
        <div>
          {SECTIONS.map(({ name, C }) => <SectionBoundary key={name} name={name}><C /></SectionBoundary>)}
        </div>
      </div>
    </main>
  );
}
