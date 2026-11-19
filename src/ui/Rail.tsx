import { Clapperboard, History, House, Keyboard, LayoutGrid, Plus, Radio, Scissors, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { WATCHED } from '@/data/fixtures';
import { Mark } from './Logo';
import type { NavId } from './Sidebar';
import { Tooltip } from './Tooltip';
import './icon-button.css';
import './rail.css';

export interface RailProps {
  current: NavId;
  onHelp?: () => void;
  /** Accessible name of the nav landmark. Must be unique on the page. */
  navLabel?: string;
}

const liveCount = WATCHED.filter((w) => w.live).length;

function RailLink({ to, icon, label, shortcut, aria, current, dot }: {
  to: string; icon: ReactNode; label: string; shortcut: string; aria: string; current: boolean; dot?: string;
}) {
  return (
    <Tooltip label={label} shortcut={shortcut} side="right">
      <Link to={to} className="hr-rail__item" aria-label={dot ?? label} aria-current={current ? 'page' : undefined} aria-keyshortcuts={aria}>
        <span aria-hidden="true">{icon}</span>
        {dot ? <span className="hr-rail__dot" aria-hidden="true" /> : null}
      </Link>
    </Tooltip>
  );
}

/**
 * 56 px icon rail used on Review and Moments, where the stage needs the width.
 * Layout: 56 px wide, full height of its parent (AppShell's side column).
 */
export function Rail({ current, onHelp, navLabel = 'Main' }: RailProps) {
  return (
    <nav className="hr-rail" aria-label={navLabel}>
      <Link to="/home" className="hr-rail__logo" aria-label="hemreel, go to Home">
        <Mark height={24} label={null} />
      </Link>
      <Tooltip label="New clips" shortcut="⌘N" side="right">
        <Link to="/new" className="hr-iconbtn" data-kind="accent" data-size="40" aria-label="New clips" aria-keyshortcuts="Meta+N"
          aria-current={current === 'new' ? 'page' : undefined}>
          <span className="hr-iconbtn__icon" aria-hidden="true"><Plus /></span>
        </Link>
      </Tooltip>
      <span className="hr-rail__sep" aria-hidden="true" />
      <RailLink to="/home" icon={<House />} label="Home" shortcut="⌘1" aria="Meta+1" current={current === 'home'} />
      <RailLink to="/review" icon={<Clapperboard />} label="Review" shortcut="⌘2" aria="Meta+2" current={current === 'review'} />
      <RailLink to="/moments" icon={<Scissors />} label="Moments" shortcut="⌘3" aria="Meta+3" current={current === 'moments'} />
      <RailLink to="/live" icon={<Radio />} label="Live" shortcut="⌘4" aria="Meta+4" current={current === 'live'}
        dot={liveCount ? `Live, ${liveCount} channels on air` : undefined} />
      <RailLink to="/clips" icon={<LayoutGrid />} label="Clips" shortcut="⌘5" aria="Meta+5" current={current === 'clips'} />
      <RailLink to="/history" icon={<History />} label="History" shortcut="⌘6" aria="Meta+6" current={current === 'history'} />
      <span className="hr-rail__spacer" />
      <RailLink to="/settings" icon={<Settings />} label="Settings" shortcut="⌘," aria="Meta+Comma" current={current === 'settings'} />
      <Tooltip label="Shortcuts" shortcut="?" side="right">
        <button type="button" className="hr-rail__item" aria-label="Shortcuts" aria-keyshortcuts="Shift+Slash" onClick={onHelp}>
          <span aria-hidden="true"><Keyboard /></span>
        </button>
      </Tooltip>
    </nav>
  );
}
