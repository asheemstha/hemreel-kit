import { Keyboard } from 'lucide-react';
import type { ReactNode } from 'react';
import { DueChip } from './DueChip';
import { IconButton } from './IconButton';
import './top-bar.css';

export interface TopBarProps {
  title: ReactNode;
  /** Quiet note after the title, for example "Wed 18 Nov · 3 streams · 14 clips". */
  note?: ReactNode;
  /** Filters, pickers, notes. */
  left?: ReactNode;
  /** Progress, counts, actions. */
  right?: ReactNode;
  /** The submit countdown. Null or zero links hides it. */
  due?: { links: number; deadline: number } | null;
  onHelp?: () => void;
  /** Heading level of the title. 1 on a screen; lower when nested in a gallery page. */
  headingLevel?: 1 | 2 | 3 | 4;
}

/**
 * 56 px top bar. The DueChip and the help button always sit at the far right.
 * Layout: fills the parent's width, 56 px tall (AppShell's top row).
 */
export function TopBar({ title, note, left, right, due, onHelp, headingLevel = 1 }: TopBarProps) {
  const H = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4';
  return (
    <header className="hr-topbar">
      <div className="hr-topbar__start">
        <H className="hr-topbar__title">{title}</H>
        {note ? <span className="hr-topbar__note">{note}</span> : null}
        {left ? <div className="hr-topbar__slot">{left}</div> : null}
      </div>
      <div className="hr-topbar__end">
        {right ? <div className="hr-topbar__slot">{right}</div> : null}
        {due ? <DueChip links={due.links} deadline={due.deadline} /> : null}
        <IconButton aria-label="Keyboard shortcuts" icon={<Keyboard />} shortcut="?" ariaKeyShortcuts="Shift+Slash" tooltipSide="bottom" onClick={onHelp} />
      </div>
    </header>
  );
}
