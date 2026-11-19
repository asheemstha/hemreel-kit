import type { ComponentType } from 'react';

export interface ScreenRoute {
  path: string;
  title: string;
  note: string;
  Component: ComponentType;
  /** A state of the money path (find, render, post, link, submit). The index lists these on their own. */
  flow?: boolean;
}

// Screens load by file so the gallery runs while they are being built.
const modules = import.meta.glob<Record<string, ComponentType>>('../screens/*.tsx', { eager: true });
function pick(file: string, name: string): ComponentType {
  return modules[`../screens/${file}.tsx`]?.[name] ?? (() => <main className="g-page"><h1 className="g-h1">{name}</h1><p className="g-lede">Not built yet.</p></main>);
}

export const SCREEN_ROUTES: ScreenRoute[] = [
  { path: '/home', title: 'Home', note: 'What needs me, what could it earn', Component: pick('Home', 'HomeScreen') },
  { path: '/review', title: 'Review', note: 'Clip review with every key', Component: pick('Review', 'ReviewScreen') },
  { path: '/moments', title: 'Moments', note: 'Source, result and timeline', Component: pick('Moments', 'MomentsScreen') },
  { path: '/new', title: 'New clips', note: 'Source and workflow', Component: pick('NewClips', 'NewClipsScreen') },
  { path: '/live', title: 'Live', note: 'Watched channels', Component: pick('Live', 'LiveScreen') },
  { path: '/settings', title: 'Settings', note: 'Accounts, checks, AI scoring', Component: pick('Settings', 'SettingsScreen') },
  { path: '/clips', title: 'Clips', note: 'Every clip by where it is in the job', Component: pick('Clips', 'ClipsScreen') },
  { path: '/history', title: 'History', note: 'Every post, its link and whether it was submitted in time', Component: pick('History', 'HistoryScreen') },
  { path: '/render', title: 'Render queue', note: 'One row per clip, with progress', Component: pick('RenderQueue', 'RenderQueueScreen') },
  { path: '/home/empty', title: 'Home · empty', note: 'Nothing needs you yet', Component: pick('Home', 'HomeEmpty') },
  { path: '/home/loading', title: 'Home · loading', note: 'Skeletons and status line', Component: pick('Home', 'HomeLoading') },
  { path: '/home/error', title: 'Home · error', note: 'Couldn’t load your clips', Component: pick('Home', 'HomeError') },
  { path: '/review/empty', title: 'Review · queue clear', note: '6 kept, 2 skipped', Component: pick('Review', 'ReviewEmpty') },
  { path: '/review/loading', title: 'Review · loading', note: 'Stage loading, details skeleton', Component: pick('Review', 'ReviewLoading') },
  { path: '/review/error', title: 'Review · error', note: 'Clip didn’t render', Component: pick('Review', 'ReviewError') },
  { path: '/review/keys', title: 'Review · shortcuts', note: 'Shortcut sheet open', Component: pick('Review', 'ReviewKeys') },
  // The money path: find, render, post, link, submit.
  { flow: true, path: '/new/finding', title: 'Find moments · running', note: 'Downloading, reading chat, transcribing, finding, scoring', Component: pick('Finding', 'FindingScreen') },
  { flow: true, path: '/new/failed', title: 'Find moments · failed', note: 'The reason, try again and the log', Component: pick('Finding', 'FindingFailed') },
  { flow: true, path: '/new/done', title: 'Find moments · done', note: 'Found 12 moments. 8 strong.', Component: pick('Finding', 'FindingDone') },
  { flow: true, path: '/render/done', title: 'Render queue · done', note: 'Every clip rendered', Component: pick('RenderQueue', 'RenderQueueDone') },
  { flow: true, path: '/render/empty', title: 'Render queue · empty', note: 'Nothing is rendering', Component: pick('RenderQueue', 'RenderQueueEmpty') },
  { flow: true, path: '/home/post', title: 'Post · choose and check', note: 'Accounts, captions, the #ad check', Component: pick('Home', 'HomePost') },
  { flow: true, path: '/home/post-all', title: 'Post · three accounts', note: 'A caption per platform, YouTube title', Component: pick('Home', 'HomePostAll') },
  { flow: true, path: '/home/posting', title: 'Post · uploading', note: 'Progress per clip and platform', Component: pick('Home', 'HomePosting') },
  { flow: true, path: '/home/post-failed', title: 'Post · one failed', note: 'The reason and "Try again"', Component: pick('Home', 'HomePostFailed') },
  { flow: true, path: '/home/link', title: 'Submit · paste the link', note: 'Posted by hand, link not known yet', Component: pick('Home', 'HomeLink') },
  { flow: true, path: '/home/submit', title: 'Submit · hand it in', note: 'Copy, open the campaign, mark submitted', Component: pick('Home', 'HomeSubmit') },
  { flow: true, path: '/home/late', title: 'Submit · late', note: 'The window has closed', Component: pick('Home', 'HomeLate') },
  { flow: true, path: '/home/dismiss', title: 'Submit · dismiss', note: 'Confirm before it leaves the list', Component: pick('Home', 'HomeDismiss') },
  { flow: true, path: '/clips/kept', title: 'Clips · kept', note: 'Ready to post', Component: pick('Clips', 'ClipsKept') },
  { flow: true, path: '/clips/posted', title: 'Clips · posted', note: 'Links to submit, with timers', Component: pick('Clips', 'ClipsPosted') },
  { flow: true, path: '/clips/submitted', title: 'Clips · submitted', note: 'Done', Component: pick('Clips', 'ClipsSubmitted') },
  { flow: true, path: '/clips/empty', title: 'Clips · empty', note: 'Nothing to clip yet', Component: pick('Clips', 'ClipsEmpty') },
  { flow: true, path: '/clips/loading', title: 'Clips · loading', note: 'Card skeletons', Component: pick('Clips', 'ClipsLoading') },
  { flow: true, path: '/clips/error', title: 'Clips · error', note: 'Couldn’t load your clips', Component: pick('Clips', 'ClipsError') },
  { flow: true, path: '/history/empty', title: 'History · empty', note: 'Nothing posted yet', Component: pick('History', 'HistoryEmpty') },
  { flow: true, path: '/history/loading', title: 'History · loading', note: 'Row skeletons', Component: pick('History', 'HistoryLoading') },
  { flow: true, path: '/history/error', title: 'History · error', note: 'Couldn’t load your posts', Component: pick('History', 'HistoryError') },
];
