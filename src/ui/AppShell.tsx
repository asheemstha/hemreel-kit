import { useId, type ReactNode } from 'react';
import './app-shell.css';

export interface AppShellProps {
  /** A Sidebar or a Rail. */
  side: ReactNode;
  /** A TopBar. */
  topBar: ReactNode;
  children: ReactNode;
  /** The content landmark. Use "div" when the shell is nested inside another page's <main> (the gallery). */
  contentAs?: 'main' | 'div';
  /** Gallery: size to the parent (a MockWindow or a scaled frame) instead of the browser window. */
  fill?: boolean;
}

/**
 * Side navigation on the left, top bar, then a scrolling content area. Fills the window, minimum 1200×760.
 * Layout: fills the browser window (100vh, min 1200×760). With `fill`, the parent must have a definite width and height (MockWindow does).
 */
export function AppShell({ side, topBar, children, contentAs: Content = 'main', fill }: AppShellProps) {
  const id = `hr-content-${useId().replace(/:/g, '')}`;
  return (
    <div className="hr-shell" data-fill={fill || undefined}>
      <a className="hr-shell__skip" href={`#${id}`}>Skip to content</a>
      <div className="hr-shell__side">{side}</div>
      <div className="hr-shell__top">{topBar}</div>
      <Content className="hr-shell__content" id={id} tabIndex={-1}>
        {children}
      </Content>
    </div>
  );
}
