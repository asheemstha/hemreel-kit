// Every key in hemreel. The "?" sheet renders from this list, so the sheet can never drift from the real bindings.
// source: 'brief' keys are fixed requirements. 'proposed' keys were added during design and may change.

export type KeyScope = 'review' | 'moments' | 'global';
export interface KeyBinding { id: string; scope: KeyScope; keys: string; aria: string; label: string; source: 'brief' | 'proposed' }

export const KEYMAP: KeyBinding[] = [
  { id: 'review.keep', scope: 'review', keys: 'P', aria: 'P', label: 'Keep the clip', source: 'brief' },
  { id: 'review.skip', scope: 'review', keys: 'X', aria: 'X', label: 'Skip the clip', source: 'brief' },
  { id: 'review.next', scope: 'review', keys: 'J', aria: 'J', label: 'Next clip', source: 'brief' },
  { id: 'review.prev', scope: 'review', keys: 'K', aria: 'K', label: 'Previous clip', source: 'brief' },
  { id: 'review.play', scope: 'review', keys: 'Space', aria: 'Space', label: 'Play or pause', source: 'brief' },
  { id: 'review.zone', scope: 'review', keys: 'Z', aria: 'Z', label: 'Cycle the safe zone overlay', source: 'brief' },
  { id: 'review.hook', scope: 'review', keys: 'E', aria: 'E', label: 'Edit the hook text', source: 'proposed' },
  { id: 'review.caption', scope: 'review', keys: 'C', aria: 'C', label: 'Edit the caption', source: 'proposed' },
  { id: 'review.in', scope: 'review', keys: 'I', aria: 'I', label: 'Set start at the playhead', source: 'proposed' },
  { id: 'review.out', scope: 'review', keys: 'O', aria: 'O', label: 'Set end at the playhead', source: 'proposed' },
  { id: 'review.undo', scope: 'review', keys: '⌘Z', aria: 'Meta+Z', label: 'Undo the last decision', source: 'proposed' },
  { id: 'moments.play', scope: 'moments', keys: 'Space', aria: 'Space', label: 'Play or pause', source: 'proposed' },
  { id: 'moments.add', scope: 'moments', keys: 'M', aria: 'M', label: 'Add a moment at the playhead', source: 'proposed' },
  { id: 'moments.in', scope: 'moments', keys: 'I', aria: 'I', label: 'Set in point', source: 'proposed' },
  { id: 'moments.out', scope: 'moments', keys: 'O', aria: 'O', label: 'Set out point', source: 'proposed' },
  { id: 'moments.nudge', scope: 'moments', keys: '← →', aria: 'ArrowLeft ArrowRight', label: 'Move the playhead one second', source: 'proposed' },
  { id: 'moments.remove', scope: 'moments', keys: '⌫', aria: 'Backspace', label: 'Remove the selected moment', source: 'proposed' },
  { id: 'moments.render', scope: 'moments', keys: '↵', aria: 'Enter', label: 'Render the selected moments', source: 'proposed' },
  { id: 'global.palette', scope: 'global', keys: '⌘K', aria: 'Meta+K', label: 'Search and jump anywhere', source: 'proposed' },
  { id: 'global.new', scope: 'global', keys: '⌘N', aria: 'Meta+N', label: 'New clips', source: 'proposed' },
  { id: 'global.goto', scope: 'global', keys: '⌘1 to ⌘6', aria: 'Meta+1 Meta+2 Meta+3 Meta+4 Meta+5 Meta+6', label: 'Home, Review, Moments, Live, Clips, History', source: 'proposed' },
  { id: 'global.settings', scope: 'global', keys: '⌘,', aria: 'Meta+Comma', label: 'Settings', source: 'proposed' },
  { id: 'global.default', scope: 'global', keys: '↵', aria: 'Enter', label: 'Do the highlighted action', source: 'proposed' },
  { id: 'global.back', scope: 'global', keys: 'Esc', aria: 'Escape', label: 'Close or go back', source: 'proposed' },
  { id: 'global.help', scope: 'global', keys: '?', aria: 'Shift+Slash', label: 'Show this sheet', source: 'brief' },
];

/** Single-letter keys must not fire while the user is typing in a field. */
export function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT';
}
