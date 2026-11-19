import { describe, expect, it } from 'vitest';
import { DEADLINES, SUBMIT_WINDOW_MS } from '@/data/deadlines';
import { placeholderPostUrl } from '@/data/posts';
import { listOf, platformName, plural } from '@/data/words';
import { T0 } from '@/hooks/clock';
import { ago, createClipStore, deadlineOf, seedClips, stageOf, stateOf, summarize, wasLate } from '@/state/clips';

const MIN = 60_000;
const get = (store: ReturnType<typeof createClipStore>, id: string) => {
  const c = store.getState().find((x) => x.id === id);
  if (!c) throw new Error(`no clip ${id}`);
  return c;
};

describe('the designed night', () => {
  it('matches the brief: one link due, one past its window, two kept, eight to review, two submitted', () => {
    const night = summarize(seedClips(), T0);
    expect(night.due.map((c) => c.id)).toEqual(['c11']);
    expect(night.past.map((c) => c.id)).toEqual(['c12']);
    expect(night.kept.map((c) => c.id)).toEqual(['c9', 'c10']);
    expect(night.review).toHaveLength(8);
    expect(night.submitted.map((c) => c.id)).toEqual(['c13', 'c14']);
    expect(night.failed).toEqual([]);
    expect(night.posting).toEqual([]);
  });

  it('gives the due clip the designed deadline and no link yet', () => {
    const c11 = seedClips().find((c) => c.id === 'c11');
    expect(c11 && deadlineOf(c11)).toBe(DEADLINES.submit);
    expect(c11?.posts[0]?.url).toBeNull();
  });

  it('a window that runs out turns a posted clip into a past-window one', () => {
    const c11 = seedClips().find((c) => c.id === 'c11');
    if (!c11) throw new Error('no c11');
    expect(stateOf(c11, T0)).toBe('posted');
    expect(stateOf(c11, DEADLINES.submit + 1)).toBe('past-window');
  });
});

describe('clip store', () => {
  it('keeps, skips and puts a clip back', () => {
    const store = createClipStore();
    store.decide('c1', 'kept');
    expect(stateOf(get(store, 'c1'), T0)).toBe('kept');
    store.decide('c1', 'skipped');
    expect(stateOf(get(store, 'c1'), T0)).toBe('skipped');
    expect(stageOf(get(store, 'c1'), T0)).toBe('review');
    store.decide('c1', 'review');
    expect(summarize(store.getState(), T0).review).toHaveLength(8);
  });

  it('tells listeners and stops telling them after unsubscribe', () => {
    const store = createClipStore();
    let calls = 0;
    const stop = store.subscribe(() => { calls += 1; });
    store.decide('c1', 'kept');
    stop();
    store.decide('c2', 'kept');
    expect(calls).toBe(1);
  });

  it('uploads become posts with a link, and the window starts when they finish', () => {
    const store = createClipStore();
    store.startPost(['c9', 'c10'], ['tiktok']);
    expect(stateOf(get(store, 'c9'), T0)).toBe('posting');
    expect(summarize(store.getState(), T0).posting).toHaveLength(2);
    expect(store.tickUploads(60, T0)).toEqual([]);
    const done = store.tickUploads(60, T0 + 5000);
    expect(done).toEqual([{ clipId: 'c9', platform: 'tiktok', ok: true }, { clipId: 'c10', platform: 'tiktok', ok: true }]);
    const c9 = get(store, 'c9');
    expect(c9.uploads).toEqual([]);
    expect(c9.posts[0]).toMatchObject({ platform: 'tiktok', url: placeholderPostUrl('tiktok', 'c9'), postedAt: T0 + 5000, submittedAt: null });
    expect(deadlineOf(c9)).toBe(T0 + 5000 + SUBMIT_WINDOW_MS);
    expect(stateOf(c9, T0 + 6000)).toBe('posted');
  });

  it('does not upload twice to a platform the clip is already on', () => {
    const store = createClipStore();
    store.startPost(['c12'], ['tiktok']);
    expect(get(store, 'c12').uploads).toEqual([]);
  });

  it('a failed upload waits for a decision: try again succeeds, give up returns the clip to Kept', () => {
    const store = createClipStore();
    store.startPost(['c9'], ['tiktok'], { tiktok: 'TikTok did not answer.' });
    expect(store.tickUploads(100, T0)).toEqual([{ clipId: 'c9', platform: 'tiktok', ok: false, error: 'TikTok did not answer.' }]);
    expect(summarize(store.getState(), T0).failed.map((c) => c.id)).toEqual(['c9']);
    store.retryUpload('c9', 'tiktok');
    expect(store.tickUploads(100, T0)).toEqual([{ clipId: 'c9', platform: 'tiktok', ok: true }]);

    const other = createClipStore('post-failed');
    expect(summarize(other.getState(), T0).failed.map((c) => c.id)).toEqual(['c10']);
    other.dropUpload('c10', 'tiktok');
    expect(stateOf(get(other, 'c10'), T0)).toBe('kept');
  });

  it('adds a link to a post that had none, and can take it back', () => {
    const store = createClipStore();
    store.addLink('c11', 'tiktok', 'https://www.tiktok.com/@a/video/1', T0);
    expect(get(store, 'c11').posts[0]).toMatchObject({ url: 'https://www.tiktok.com/@a/video/1', postedAt: DEADLINES.submit - SUBMIT_WINDOW_MS });
    store.removeLink('c11', 'tiktok', false);
    expect(get(store, 'c11').posts[0]?.url).toBeNull();
  });

  it('a link for a clip posted by hand records the post and starts its window then', () => {
    const store = createClipStore();
    store.addLink('c9', 'reels', 'https://www.instagram.com/reel/abc/', T0 + 1000);
    const c9 = get(store, 'c9');
    expect(c9.posts).toEqual([{ platform: 'reels', url: 'https://www.instagram.com/reel/abc/', postedAt: T0 + 1000, submittedAt: null }]);
    expect(stateOf(c9, T0 + 2000)).toBe('posted');
    store.removeLink('c9', 'reels', true);
    expect(stateOf(get(store, 'c9'), T0 + 2000)).toBe('kept');
  });

  it('submits in time, undoes it, and knows a late submit', () => {
    const store = createClipStore();
    store.submit('c11', T0);
    expect(stateOf(get(store, 'c11'), T0)).toBe('submitted');
    expect(get(store, 'c11').posts.some(wasLate)).toBe(false);
    store.unsubmit('c11', T0);
    expect(stateOf(get(store, 'c11'), T0)).toBe('posted');
    store.submit('c12', T0);
    expect(get(store, 'c12').posts.some(wasLate)).toBe(true);
  });

  it('dismiss takes a past-window clip off the list and restore brings it back', () => {
    const store = createClipStore();
    store.dismiss('c12');
    expect(stateOf(get(store, 'c12'), T0)).toBe('dismissed');
    expect(summarize(store.getState(), T0).past).toEqual([]);
    store.restore('c12');
    expect(summarize(store.getState(), T0).past.map((c) => c.id)).toEqual(['c12']);
  });

  it('reset puts the night back, and scenarios start where they say', () => {
    const store = createClipStore();
    store.decide('c1', 'kept');
    store.reset();
    expect(summarize(store.getState(), T0).review).toHaveLength(8);
    expect(createClipStore('empty').getState()).toEqual([]);
    expect(summarize(seedClips('review-done'), T0).kept).toHaveLength(8);
    expect(summarize(seedClips('posting'), T0).posting.map((c) => c.id)).toEqual(['c9', 'c10']);
    expect(seedClips('linked').find((c) => c.id === 'c11')?.posts[0]?.url).toBe(placeholderPostUrl('tiktok', 'c11'));
  });
});

describe('wording', () => {
  it('says how long ago', () => {
    expect(ago(T0 - 20_000, T0)).toBe('just now');
    expect(ago(T0 - 17 * MIN, T0)).toBe('17 min ago');
    expect(ago(T0 - 120 * MIN, T0)).toBe('2 h ago');
    expect(ago(T0 - 150 * MIN, T0)).toBe('2 h 30 min ago');
  });
  it('counts, lists and names platforms', () => {
    expect(plural(1, 'clip')).toBe('1 clip');
    expect(plural(2, 'clip')).toBe('2 clips');
    expect(plural(2, 'reply', 'replies')).toBe('2 replies');
    expect(listOf([])).toBe('');
    expect(listOf(['TikTok'])).toBe('TikTok');
    expect(listOf(['TikTok', 'Reels'])).toBe('TikTok and Reels');
    expect(listOf(['TikTok', 'Reels', 'Shorts'])).toBe('TikTok, Reels and Shorts');
    expect(platformName('shorts')).toBe('Shorts');
    expect(platformName('shorts', true)).toBe('YouTube Shorts');
  });
  it('placeholder links are stable and differ by clip', () => {
    expect(placeholderPostUrl('tiktok', 'c9')).toBe(placeholderPostUrl('tiktok', 'c9'));
    expect(placeholderPostUrl('tiktok', 'c9')).not.toBe(placeholderPostUrl('tiktok', 'c10'));
    expect(placeholderPostUrl('x', 'c9')).toMatch(/^https:\/\/x\.com\/yourhandle\/status\/\d{19}$/);
  });
});
