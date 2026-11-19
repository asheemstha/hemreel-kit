// The clips of tonight, and what has happened to each: kept or skipped, uploading, posted, submitted.
// One store feeds Home, Review, Clips and History, so posting on one screen shows up on the others.
// It is a plain external store (no provider needed). A screen that shows a designed state gets its own store through ClipStoreContext.
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { CLIPS, STREAMS, estimateAt10k, formatEstimate, type Clip, type ClipStage, type PostPlatform, type Stream } from '@/data/fixtures';
import { SUBMIT_WINDOW_MS } from '@/data/deadlines';
import { SEED_POSTS, placeholderPostUrl, type Post, type Upload } from '@/data/posts';
import { T0, useFrozenAt } from '@/hooks/clock';

export type Decision = 'review' | 'kept' | 'skipped';
/** Where a clip is in the job, worked out from its record and the time. */
export type ClipState = 'review' | 'kept' | 'skipped' | 'posting' | 'posted' | 'past-window' | 'submitted' | 'dismissed';

export interface ClipRecord {
  id: string;
  streamId: string;
  title: string;
  score: number;
  seconds: number;
  placeholder?: boolean;
  decision: Decision;
  posts: Post[];
  uploads: Upload[];
  /** A clip past its window that the person chose not to submit. It leaves "Needs you" and stays in History. */
  dismissed: boolean;
}

/** Designed starting points. 'default' is the brief's night; the others back the state routes. */
export type Scenario = 'default' | 'linked' | 'posting' | 'post-failed' | 'review-done' | 'empty';

const MIN = 60_000;

function record(c: Clip): ClipRecord {
  const { stage, ...rest } = c;
  return { ...rest, decision: stage === 'review' ? 'review' : 'kept', posts: (SEED_POSTS[c.id] ?? []).map((p) => ({ ...p })), uploads: [], dismissed: false };
}

export function seedClips(scenario: Scenario = 'default'): ClipRecord[] {
  if (scenario === 'empty') return [];
  const clips = CLIPS.map(record);
  const patch = (id: string, change: Partial<ClipRecord>) => {
    const i = clips.findIndex((c) => c.id === id);
    const old = clips[i];
    if (old) clips[i] = { ...old, ...change };
  };
  if (scenario === 'linked') {
    // the due clip went out through hemreel, so its link is already known
    patch('c11', { posts: (SEED_POSTS.c11 ?? []).map((p) => ({ ...p, url: placeholderPostUrl(p.platform, 'c11') })) });
  }
  if (scenario === 'posting') {
    patch('c9', { uploads: [{ platform: 'tiktok', state: 'uploading', progress: 62 }] });
    patch('c10', { uploads: [{ platform: 'tiktok', state: 'uploading', progress: 18 }] });
  }
  if (scenario === 'post-failed') {
    patch('c9', { posts: [{ platform: 'tiktok', url: placeholderPostUrl('tiktok', 'c9'), postedAt: T0 - MIN, submittedAt: null }] });
    patch('c10', { uploads: [{ platform: 'tiktok', state: 'failed', progress: 0, error: 'TikTok did not answer. Nothing was posted.' }] });
  }
  if (scenario === 'review-done') {
    // the queue-clear state of Review: 6 kept, 2 skipped
    clips.filter((c) => c.decision === 'review').forEach((c, i) => patch(c.id, { decision: i < 6 ? 'kept' : 'skipped' }));
  }
  return clips;
}

export interface UploadEvent { clipId: string; platform: PostPlatform; ok: boolean; error?: string }

export interface ClipStore {
  getState(): ClipRecord[];
  subscribe(listener: () => void): () => void;
  /** Back to a scenario's starting point. Tests call it between cases. */
  reset(scenario?: Scenario): void;
  decide(id: string, decision: Decision): void;
  /** Start uploading each clip to each platform. `failsWith` makes a platform's first attempt fail with that reason (fixtures only). */
  startPost(ids: string[], platforms: PostPlatform[], failsWith?: Partial<Record<PostPlatform, string>>): void;
  /** Move every running upload on by `step` percent. An upload that reaches 100 becomes a post, or a failure. Returns what finished. */
  tickUploads(step: number, now: number): UploadEvent[];
  retryUpload(id: string, platform: PostPlatform): void;
  /** Give up on a failed upload: it leaves the list and the clip goes back to Kept. */
  dropUpload(id: string, platform: PostPlatform): void;
  /** Store a post's link. If the clip has no post on that platform yet it was posted by hand: the post is recorded and its window starts at `now`. */
  addLink(id: string, platform: PostPlatform, url: string, now: number): void;
  /** Undo addLink for a post that was recorded by hand, or clear the link of one that was already there. */
  removeLink(id: string, platform: PostPlatform, wasNew: boolean): void;
  /** Mark every open post of the clip as handed to the campaign. */
  submit(id: string, now: number): void;
  /** Undo submit: posts submitted at exactly `at` are open again. */
  unsubmit(id: string, at: number): void;
  dismiss(id: string): void;
  restore(id: string): void;
}

export function createClipStore(scenario: Scenario = 'default'): ClipStore {
  let state = seedClips(scenario);
  const listeners = new Set<() => void>();
  const set = (next: ClipRecord[]) => {
    state = next;
    listeners.forEach((l) => l());
  };
  const update = (id: string, fn: (c: ClipRecord) => ClipRecord) => set(state.map((c) => (c.id === id ? fn(c) : c)));

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    reset: (s = scenario) => set(seedClips(s)),
    decide: (id, decision) => update(id, (c) => ({ ...c, decision })),
    startPost(ids, platforms, failsWith = {}) {
      set(state.map((c) => {
        if (!ids.includes(c.id)) return c;
        const fresh = platforms
          .filter((p) => !c.posts.some((x) => x.platform === p) && !c.uploads.some((u) => u.platform === p && u.state === 'uploading'))
          .map<Upload>((p) => ({ platform: p, state: 'uploading', progress: 0, failsWith: failsWith[p] }));
        return { ...c, decision: 'kept', uploads: [...c.uploads.filter((u) => !fresh.some((f) => f.platform === u.platform)), ...fresh] };
      }));
    },
    tickUploads(step, now) {
      const events: UploadEvent[] = [];
      if (!state.some((c) => c.uploads.some((u) => u.state === 'uploading'))) return events;
      set(state.map((c) => {
        if (!c.uploads.some((u) => u.state === 'uploading')) return c;
        const posts = [...c.posts];
        const uploads: Upload[] = [];
        for (const u of c.uploads) {
          if (u.state !== 'uploading') { uploads.push(u); continue; }
          const progress = Math.min(100, u.progress + step);
          if (progress < 100) { uploads.push({ ...u, progress }); continue; }
          if (u.failsWith) {
            uploads.push({ platform: u.platform, state: 'failed', progress: 0, error: u.failsWith });
            events.push({ clipId: c.id, platform: u.platform, ok: false, error: u.failsWith });
          } else {
            posts.push({ platform: u.platform, url: placeholderPostUrl(u.platform, c.id), postedAt: now, submittedAt: null });
            events.push({ clipId: c.id, platform: u.platform, ok: true });
          }
        }
        return { ...c, posts, uploads };
      }));
      return events;
    },
    retryUpload: (id, platform) => update(id, (c) => ({ ...c, uploads: c.uploads.map((u) => (u.platform === platform ? { platform, state: 'uploading', progress: 0 } : u)) })),
    dropUpload: (id, platform) => update(id, (c) => ({ ...c, uploads: c.uploads.filter((u) => u.platform !== platform) })),
    addLink: (id, platform, url, now) => update(id, (c) => {
      const has = c.posts.some((p) => p.platform === platform);
      const posts = has ? c.posts.map((p) => (p.platform === platform ? { ...p, url } : p)) : [...c.posts, { platform, url, postedAt: now, submittedAt: null }];
      return { ...c, decision: 'kept', posts, uploads: c.uploads.filter((u) => u.platform !== platform) };
    }),
    removeLink: (id, platform, wasNew) => update(id, (c) => ({
      ...c,
      posts: wasNew ? c.posts.filter((p) => p.platform !== platform) : c.posts.map((p) => (p.platform === platform ? { ...p, url: null } : p)),
    })),
    submit: (id, now) => update(id, (c) => ({ ...c, dismissed: false, posts: c.posts.map((p) => (p.submittedAt === null ? { ...p, submittedAt: now } : p)) })),
    unsubmit: (id, at) => update(id, (c) => ({ ...c, posts: c.posts.map((p) => (p.submittedAt === at ? { ...p, submittedAt: null } : p)) })),
    dismiss: (id) => update(id, (c) => ({ ...c, dismissed: true })),
    restore: (id) => update(id, (c) => ({ ...c, dismissed: false })),
  };
}

/** The store every screen shares unless a state route provides its own. */
export const clipStore = createClipStore();
export const ClipStoreContext = createContext<ClipStore>(clipStore);
export const useClipStore = (): ClipStore => useContext(ClipStoreContext);

/** Every clip record. The component re-renders when any of them changes. */
export function useClips(): ClipRecord[] {
  const store = useClipStore();
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

/** One clip record, or undefined. */
export function useClip(id: string | null | undefined): ClipRecord | undefined {
  return useClips().find((c) => c.id === id);
}

// ---- reading a record ----

/** Posts whose link has not been handed to the campaign. */
export const openPosts = (c: ClipRecord): Post[] => c.posts.filter((p) => p.submittedAt === null);

/** When the submit window of the clip's oldest open post closes. Null when nothing is open. */
export function deadlineOf(c: ClipRecord): number | null {
  const open = openPosts(c);
  return open.length ? Math.min(...open.map((p) => p.postedAt)) + SUBMIT_WINDOW_MS : null;
}

export function stateOf(c: ClipRecord, now: number): ClipState {
  if (c.posts.length === 0) return c.uploads.length ? 'posting' : c.decision;
  const deadline = deadlineOf(c);
  if (deadline === null) return 'submitted';
  if (c.dismissed) return 'dismissed';
  return deadline > now ? 'posted' : 'past-window';
}

/** True when a post was handed in after its window had closed. */
export const wasLate = (p: Post): boolean => p.submittedAt !== null && p.submittedAt > p.postedAt + SUBMIT_WINDOW_MS;

/** The stage word ClipCard and the brief use. Skipped and dismissed clips have no stage of their own there. */
export function stageOf(c: ClipRecord, now: number): ClipStage {
  const s = stateOf(c, now);
  if (s === 'skipped') return 'review';
  if (s === 'posting') return 'kept';
  if (s === 'dismissed') return 'past-window';
  return s;
}

export const streamOf = (c: Pick<ClipRecord, 'streamId'>): Stream | undefined => STREAMS.find((s) => s.id === c.streamId);
/** Dollars at 10K views, or null for a pool campaign. */
export const estimateOf = (c: Pick<ClipRecord, 'streamId'>): number | null => {
  const s = streamOf(c);
  return s ? estimateAt10k(s.pay) : null;
};
/** "≈ $15 at 10K views", or null for a pool campaign. */
export const estimateTextOf = (c: Pick<ClipRecord, 'streamId'>): string | null => {
  const s = streamOf(c);
  return s ? formatEstimate(s.pay) : null;
};

/** "17 min ago", "just now", "2 h 30 min ago". */
export function ago(then: number, now: number): string {
  const min = Math.round((now - then) / MIN);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  return min % 60 ? `${h} h ${min % 60} min ago` : `${h} h ago`;
}

export interface NightSummary {
  /** Posted, window still open, soonest deadline first. */
  due: ClipRecord[];
  /** Window closed, not submitted, not dismissed. */
  past: ClipRecord[];
  /** Uploads that failed and need a decision. */
  failed: ClipRecord[];
  /** Uploading right now. */
  posting: ClipRecord[];
  /** Kept and ready to post. */
  kept: ClipRecord[];
  review: ClipRecord[];
  submitted: ClipRecord[];
}

function summarizeWith(clips: ClipRecord[], state: (c: ClipRecord) => ClipState): NightSummary {
  const by = (s: ClipState) => clips.filter((c) => state(c) === s);
  const uploading = (c: ClipRecord) => c.uploads.some((u) => u.state === 'uploading');
  const failedUpload = (c: ClipRecord) => c.uploads.some((u) => u.state === 'failed');
  return {
    due: by('posted').sort((a, b) => (deadlineOf(a) ?? 0) - (deadlineOf(b) ?? 0)),
    past: by('past-window'),
    failed: clips.filter((c) => failedUpload(c) && !uploading(c)),
    posting: clips.filter(uploading),
    kept: by('kept'),
    review: by('review'),
    submitted: by('submitted'),
  };
}

/** Everything Home needs, in the order it shows it. */
export function summarize(clips: ClipRecord[], now: number): NightSummary {
  return summarizeWith(clips, (c) => stateOf(c, now));
}

/**
 * A value worked out from the clips and the clock. It is checked once a second, but the component only re-renders when the text changes,
 * so a screen does not redraw every second just because a window might close.
 */
function useTicking(read: (clips: ClipRecord[], now: number) => string): string {
  const store = useClipStore();
  const frozenAt = useFrozenAt();
  const subscribe = useCallback((notify: () => void) => {
    const stop = store.subscribe(notify);
    if (frozenAt !== null) return stop;
    const id = window.setInterval(notify, 1000);
    return () => { stop(); window.clearInterval(id); };
  }, [store, frozenAt]);
  const snapshot = () => read(store.getState(), frozenAt ?? Date.now());
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** The state of every clip by id. Changes only when a clip moves on: a window closing flips it without a redraw each second. */
export function useClipStates(): Map<string, ClipState> {
  const key = useTicking((clips, now) => clips.map((c) => `${c.id}=${stateOf(c, now)}`).join(','));
  return useMemo(() => new Map(key.split(',').filter(Boolean).map((pair) => pair.split('=') as [string, ClipState])), [key]);
}

/** The night at a glance, kept current as uploads finish and windows close. */
export function useSummary(): NightSummary {
  const clips = useClips();
  const states = useClipStates();
  return useMemo(() => summarizeWith(clips, (c) => states.get(c.id) ?? c.decision), [clips, states]);
}

/** What the DueChip in every top bar shows: how many links are due and the soonest deadline. Null when nothing is due. */
export function useDue(): { links: number; deadline: number } | null {
  const key = useTicking((clips, now) => {
    const deadlines = clips.filter((c) => stateOf(c, now) === 'posted').map((c) => deadlineOf(c) ?? 0);
    return deadlines.length ? `${deadlines.length}:${Math.min(...deadlines)}` : '';
  });
  return useMemo(() => {
    if (!key) return null;
    const [links = 0, deadline = 0] = key.split(':').map(Number);
    return { links, deadline };
  }, [key]);
}
