import { Clapperboard, History, House, Keyboard, LayoutGrid, Plus, Radio, Scissors, Settings } from 'lucide-react';
import { Link } from 'react-router';
import { CLIPS, STREAMS, WATCHED } from '@/data/fixtures';
import { Kbd } from './Kbd';
import { Logo } from './Logo';
import { NavItem } from './NavItem';
import { StreamRow } from './StreamRow';
import './button.css';
import './sidebar.css';

export type NavId = 'home' | 'review' | 'moments' | 'live' | 'clips' | 'history' | 'new' | 'settings';

export interface SidebarProps {
  current: NavId;
  /** Empty and loading states: no counts and no streams. */
  bare?: boolean;
  counts?: { review?: number; live?: number };
  onHelp?: () => void;
  /** Accessible name of the nav landmark. Must be unique on the page. */
  navLabel?: string;
}

const reviewCount = CLIPS.filter((c) => c.stage === 'review').length;
const liveCount = WATCHED.filter((w) => w.live).length;

/**
 * 232 px sidebar: logo, New clips, nav (Home, Review, Moments, Live, Clips, History), streams, then Settings and Shortcuts pinned to the bottom.
 * Layout: 232 px wide, full height of its parent (AppShell's side column).
 */
export function Sidebar({ current, bare = false, counts, onHelp, navLabel = 'Main' }: SidebarProps) {
  const review = bare ? undefined : (counts?.review ?? reviewCount);
  const live = bare ? 0 : (counts?.live ?? liveCount);
  const isNew = current === 'new';
  return (
    <nav className="hr-sidebar" aria-label={navLabel}>
      <div className="hr-sidebar__logo">
        <Link to="/home" className="hr-sidebar__home" aria-label="hemreel, go to Home">
          <Logo />
        </Link>
      </div>
      <Link
        to="/new"
        className="hr-btn hr-sidebar__new"
        data-block=""
        data-kind={isNew ? 'dark' : 'primary'}
        data-size="md"
        aria-current={isNew ? 'page' : undefined}
        aria-keyshortcuts="Meta+N"
      >
        <span className="hr-btn__icon" aria-hidden="true"><Plus /></span>
        <span className="hr-btn__label">New clips</span>
        <Kbd tone={isNew ? 'ink' : 'accent'} decorative hint>⌘N</Kbd>
      </Link>
      <ul className="hr-sidebar__list">
        <li><NavItem to="/home" icon={<House />} label="Home" current={current === 'home'} shortcut="⌘1" ariaKeyShortcuts="Meta+1" /></li>
        <li>
          <NavItem to="/review" icon={<Clapperboard />} label="Review" current={current === 'review'} count={review || undefined}
            shortcut={review ? undefined : '⌘2'} ariaKeyShortcuts="Meta+2" />
        </li>
        <li><NavItem to="/moments" icon={<Scissors />} label="Moments" current={current === 'moments'} shortcut="⌘3" ariaKeyShortcuts="Meta+3" /></li>
        <li>
          <NavItem to="/live" icon={<Radio />} label="Live" current={current === 'live'} live={live ? `${live} LIVE` : undefined}
            shortcut={live ? undefined : '⌘4'} ariaKeyShortcuts="Meta+4" />
        </li>
        <li><NavItem to="/clips" icon={<LayoutGrid />} label="Clips" current={current === 'clips'} shortcut="⌘5" ariaKeyShortcuts="Meta+5" /></li>
        <li><NavItem to="/history" icon={<History />} label="History" current={current === 'history'} shortcut="⌘6" ariaKeyShortcuts="Meta+6" /></li>
      </ul>
      {bare ? null : (
        <div className="hr-sidebar__streams">
          <h2 className="hr-sidebar__heading">Streams</h2>
          <ul className="hr-sidebar__list">
            {STREAMS.map((s) => (
              <li key={s.id}>
                <StreamRow name={s.channel} subtitle={s.title} live={s.live}
                  count={s.live ? undefined : CLIPS.filter((c) => c.streamId === s.id && c.stage === 'review').length} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul className="hr-sidebar__list hr-sidebar__bottom">
        <li><NavItem to="/settings" icon={<Settings />} label="Settings" current={current === 'settings'} shortcut="⌘," ariaKeyShortcuts="Meta+Comma" /></li>
        <li><NavItem icon={<Keyboard />} label="Shortcuts" onClick={onHelp} shortcut="?" ariaKeyShortcuts="Shift+Slash" /></li>
      </ul>
    </nav>
  );
}
