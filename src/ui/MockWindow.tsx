import type { ReactNode } from 'react';
import './mock-window.css';

/**
 * Gallery only: a 1440×900 macOS-style window. The traffic lights are drawn in neutral grey
 * (the unfocused-window look) so no colour outside the tokens is needed.
 * Layout: fixed 1440×900. The parent should not be narrower, or it scrolls horizontally.
 */
export function MockWindow({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="hr-window" data-title={title}>
      <span className="hr-window__lights" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <div className="hr-window__body">{children}</div>
    </div>
  );
}
