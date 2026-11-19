import { Clapperboard, History, House, Keyboard, LayoutGrid, Plus, Radio, Scissors, Settings } from 'lucide-react';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '@/ui/AppShell';
import { CommandPalette, type CommandGroup } from '@/ui/CommandPalette';
import { MockWindow } from '@/ui/MockWindow';
import { Rail } from '@/ui/Rail';
import { ShortcutSheet } from '@/ui/ShortcutSheet';
import { Sidebar, type NavId } from '@/ui/Sidebar';
import { ToastHost } from '@/ui/Toast';
import { useHotkeys, type HotkeyHandlers } from '@/hooks/useHotkeys';
import type { KeyScope } from '@/data/keymap';
import { UploadRunner } from '@/flows/UploadRunner';
import { ClipStoreContext, clipStore, createClipStore, useSummary, type Scenario } from '@/state/clips';
import './screens.css';

const GOTO = ['/home', '/review', '/moments', '/live', '/clips', '/history'];

interface FrameApi { openHelp: () => void; keysRef: { current: HotkeyHandlers }; side: ReactNode }
const FrameContext = createContext<FrameApi>({ openHelp: () => {}, keysRef: { current: {} }, side: null });
/** Lets a screen's TopBar open the shortcut sheet. */
export const useFrame = () => useContext(FrameContext);

/** Registers a screen's key handlers with the frame's single window listener. */
export function useScreenKeys(handlers: HotkeyHandlers) {
  const { keysRef } = useContext(FrameContext);
  useEffect(() => {
    keysRef.current = handlers;
  });
  useEffect(() => () => { keysRef.current = {}; }, [keysRef]);
}

export interface ScreenFrameProps {
  title: string;
  nav: 'sidebar' | 'rail';
  current: NavId;
  /** Sidebar without counts and streams (empty and loading states). */
  bare?: boolean;
  /** When given, the frame renders the shell. Leave it out and render <ScreenShell> inside when the top bar needs the screen's state. */
  topBar?: ReactNode;
  children: ReactNode;
  /** Screen-specific key scope. Global keys always work. */
  scope?: KeyScope | null;
  /** Start with the shortcut sheet open (the /review/keys route). */
  helpOpen?: boolean;
  /**
   * A designed starting point for the clips (uploads running, an upload failed, the queue decided).
   * The screen then gets a store of its own, so a state route never changes what the other screens show.
   */
  scenario?: Scenario;
}

/**
 * A product screen inside the 1440×900 gallery window: the shell, the shortcut sheet,
 * the command palette, the toast host, the clip store and the global keys (?, ⌘K, ⌘1 to ⌘6, ⌘N, ⌘,).
 */
export function ScreenFrame({ title, nav, current, bare, topBar, children, scope = null, helpOpen = false, scenario }: ScreenFrameProps) {
  const [help, setHelp] = useState(helpOpen);
  const [store] = useState(() => (scenario ? createClipStore(scenario) : clipStore));
  const navigate = useNavigate();
  const [palette, setPalette] = useState(false);
  // Everything the palette offers here is something the kit can really do: go to a screen or open the shortcut sheet.
  const commands = useMemo<CommandGroup[]>(() => [
    {
      heading: 'Go to',
      items: [
        { id: 'home', label: 'Home', icon: <House />, shortcut: '⌘1', onSelect: () => navigate('/home') },
        { id: 'review', label: 'Review', icon: <Clapperboard />, shortcut: '⌘2', keywords: ['clips', 'keep', 'skip'], onSelect: () => navigate('/review') },
        { id: 'moments', label: 'Moments', icon: <Scissors />, shortcut: '⌘3', keywords: ['timeline', 'trim'], onSelect: () => navigate('/moments') },
        { id: 'live', label: 'Live', icon: <Radio />, shortcut: '⌘4', keywords: ['channels', 'watch'], onSelect: () => navigate('/live') },
        { id: 'clips', label: 'Clips', icon: <LayoutGrid />, shortcut: '⌘5', keywords: ['inbox', 'kept', 'posted', 'submitted'], onSelect: () => navigate('/clips') },
        { id: 'history', label: 'History', icon: <History />, shortcut: '⌘6', keywords: ['posts', 'links', 'submitted', 'late'], onSelect: () => navigate('/history') },
        { id: 'new', label: 'New clips', icon: <Plus />, shortcut: '⌘N', keywords: ['stream', 'link', 'find moments'], onSelect: () => navigate('/new') },
        { id: 'settings', label: 'Settings', icon: <Settings />, shortcut: '⌘,', keywords: ['accounts', 'spending', 'checks'], onSelect: () => navigate('/settings') },
      ],
    },
    { heading: 'Help', items: [{ id: 'keys', label: 'Keyboard shortcuts', icon: <Keyboard />, shortcut: '?', onSelect: () => setHelp(true) }] },
  ], [navigate]);
  const globalKeys: HotkeyHandlers = {
    'global.help': () => setHelp(true),
    'global.palette': () => setPalette(true),
    'global.new': () => navigate('/new'),
    'global.settings': () => navigate('/settings'),
    'global.goto': (_e, _b, combo) => {
      const n = Number(combo.slice(-1));
      const to = GOTO[n - 1];
      if (to) navigate(to);
    },
  };
  const keysRef = useRef<HotkeyHandlers>({});
  useHotkeys(scope, () => ({ ...globalKeys, ...keysRef.current }));
  const openHelp = () => setHelp(true);
  const side = nav === 'sidebar' ? <FrameSidebar current={current} bare={bare} onHelp={openHelp} /> : <Rail current={current} onHelp={openHelp} />;
  return (
    <ClipStoreContext.Provider value={store}>
      <div className="g-screen">
        <MockWindow title={`hemreel, ${title}`}>
          <FrameContext.Provider value={{ openHelp, keysRef, side }}>
            <ToastHost>
              <UploadRunner />
              {topBar === undefined ? children : <ScreenShell topBar={topBar}>{children}</ScreenShell>}
            </ToastHost>
          </FrameContext.Provider>
        </MockWindow>
        <ShortcutSheet open={help} onOpenChange={setHelp} />
        <CommandPalette open={palette} onOpenChange={setPalette} groups={commands} placeholder="Search screens and actions" />
      </div>
    </ClipStoreContext.Provider>
  );
}

/** The sidebar with the Review count taken from the clip store, so it drops as clips are kept and skipped. */
function FrameSidebar({ current, bare, onHelp }: { current: NavId; bare?: boolean; onHelp: () => void }) {
  const { review } = useSummary();
  return <Sidebar current={current} bare={bare} counts={{ review: review.length }} onHelp={onHelp} />;
}

/** The shell inside a ScreenFrame: the frame's side navigation, a top bar and the content. */
export function ScreenShell({ topBar, children }: { topBar: ReactNode; children: ReactNode }) {
  const { side } = useContext(FrameContext);
  return <AppShell fill side={side} topBar={topBar}>{children}</AppShell>;
}
