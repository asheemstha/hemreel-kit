import { describe, expect, it } from 'vitest';
import { LINK_EXAMPLE, parsePostLink, readableLink, type BadLink, type PostLink } from '@/data/postLinks';
import { placeholderPostUrl } from '@/data/posts';

const ok = (text: string): PostLink => {
  const r = parsePostLink(text);
  if (!r.ok) throw new Error(`expected a post link, got ${r.reason}: ${text}`);
  return r;
};
const no = (text: string): BadLink => {
  const r = parsePostLink(text);
  if (r.ok) throw new Error(`expected a refusal, got ${r.platform}: ${text}`);
  return r;
};

describe('parsePostLink: TikTok', () => {
  it('reads a post link with its handle and id', () => {
    expect(ok('https://www.tiktok.com/@clipper.one/video/7436120045518230021')).toEqual({
      ok: true, platform: 'tiktok', handle: '@clipper.one', id: '7436120045518230021', url: 'https://www.tiktok.com/@clipper.one/video/7436120045518230021', short: false,
    });
  });
  it('strips the tracking query and takes links without https, with m. or in capitals', () => {
    const url = 'https://www.tiktok.com/@you/video/7436120045518230021';
    expect(ok('https://www.tiktok.com/@you/video/7436120045518230021?is_from_webapp=1&sender_device=pc&lang=en').url).toBe(url);
    expect(ok('tiktok.com/@you/video/7436120045518230021').url).toBe(url);
    expect(ok('m.tiktok.com/@you/video/7436120045518230021/').url).toBe(url);
    expect(ok('HTTPS://WWW.TIKTOK.COM/@you/video/7436120045518230021').url).toBe(url);
    expect(ok('  https://www.tiktok.com/@you/video/7436120045518230021  ').url).toBe(url);
  });
  it('takes the short share links and keeps them as pasted', () => {
    expect(ok('https://vm.tiktok.com/ZMabc12de/')).toMatchObject({ platform: 'tiktok', handle: null, id: 'ZMabc12de', url: 'https://vm.tiktok.com/ZMabc12de', short: true });
    expect(ok('vt.tiktok.com/ZSxyz98wq')).toMatchObject({ platform: 'tiktok', url: 'https://vt.tiktok.com/ZSxyz98wq', short: true });
    expect(ok('https://www.tiktok.com/t/ZTabc12de/')).toMatchObject({ platform: 'tiktok', url: 'https://www.tiktok.com/t/ZTabc12de', short: true });
  });
  it('refuses a profile, the home page and a link with no post', () => {
    expect(no('https://www.tiktok.com/@you')).toMatchObject({ reason: 'not-a-post', platform: 'tiktok' });
    expect(no('https://www.tiktok.com/@you').message).toMatch(/profile, not a post/);
    expect(no('https://www.tiktok.com/')).toMatchObject({ reason: 'not-a-post', platform: 'tiktok' });
    expect(no('https://www.tiktok.com/@you/video/')).toMatchObject({ reason: 'not-a-post' });
    expect(no('https://vm.tiktok.com/')).toMatchObject({ reason: 'not-a-post', platform: 'tiktok' });
  });
});

describe('parsePostLink: Instagram', () => {
  it('reads /reel/, /reels/ and /p/ links', () => {
    expect(ok('https://www.instagram.com/reel/C8xYz12AbCd/')).toMatchObject({ platform: 'reels', id: 'C8xYz12AbCd', handle: null, url: 'https://www.instagram.com/reel/C8xYz12AbCd/' });
    expect(ok('instagram.com/reels/C8xYz12AbCd').url).toBe('https://www.instagram.com/reel/C8xYz12AbCd/');
    expect(ok('https://www.instagram.com/p/C8xYz12AbCd/?igsh=MTFk&utm_source=ig_web_copy_link').url).toBe('https://www.instagram.com/p/C8xYz12AbCd/');
  });
  it('reads the share links that start with the account', () => {
    expect(ok('https://www.instagram.com/clipper.one/reel/C8xYz12AbCd/')).toMatchObject({ platform: 'reels', handle: '@clipper.one', url: 'https://www.instagram.com/reel/C8xYz12AbCd/' });
  });
  it('refuses a profile, the reels feed and a story', () => {
    expect(no('https://www.instagram.com/clipper.one/')).toMatchObject({ reason: 'not-a-post', platform: 'reels' });
    expect(no('https://www.instagram.com/clipper.one/').message).toMatch(/profile/);
    expect(no('https://www.instagram.com/reels/')).toMatchObject({ reason: 'not-a-post' });
    expect(no('https://www.instagram.com/stories/clipper.one/3312/')).toMatchObject({ reason: 'not-a-post' });
  });
});

describe('parsePostLink: YouTube', () => {
  it('reads Shorts, youtu.be and watch links', () => {
    expect(ok('https://www.youtube.com/shorts/dQw4w9WgXcQ?feature=share')).toMatchObject({ platform: 'shorts', id: 'dQw4w9WgXcQ', url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ', short: false });
    expect(ok('https://youtu.be/dQw4w9WgXcQ?si=AbCdEf123')).toMatchObject({ platform: 'shorts', url: 'https://youtu.be/dQw4w9WgXcQ', short: true });
    expect(ok('m.youtube.com/watch?v=dQw4w9WgXcQ&t=12s&feature=youtu.be').url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });
  it('refuses a channel and a video id of the wrong length', () => {
    expect(no('https://www.youtube.com/@clipperone')).toMatchObject({ reason: 'not-a-post', platform: 'shorts' });
    expect(no('https://www.youtube.com/@clipperone').message).toMatch(/channel/);
    expect(no('https://www.youtube.com/shorts/tooShort')).toMatchObject({ reason: 'not-a-post' });
    expect(no('https://www.youtube.com/watch')).toMatchObject({ reason: 'not-a-post' });
  });
});

describe('parsePostLink: X', () => {
  it('reads x.com and twitter.com status links', () => {
    expect(ok('https://x.com/clipper_one/status/1859012345678901234?s=20&t=abc')).toMatchObject({ platform: 'x', handle: '@clipper_one', id: '1859012345678901234', url: 'https://x.com/clipper_one/status/1859012345678901234' });
    expect(ok('twitter.com/clipper_one/status/1859012345678901234/video/1').url).toBe('https://x.com/clipper_one/status/1859012345678901234');
    expect(ok('https://mobile.twitter.com/clipper_one/status/1859012345678901234').platform).toBe('x');
    expect(ok('https://x.com/i/web/status/1859012345678901234')).toMatchObject({ handle: null, url: 'https://x.com/i/status/1859012345678901234' });
  });
  it('refuses a profile and the home page', () => {
    expect(no('https://x.com/clipper_one')).toMatchObject({ reason: 'not-a-post', platform: 'x' });
    expect(no('https://x.com/clipper_one').message).toMatch(/profile/);
    expect(no('https://x.com/home')).toMatchObject({ reason: 'not-a-post' });
  });
});

describe('parsePostLink: everything else', () => {
  it('says when nothing was typed', () => {
    expect(no('')).toMatchObject({ reason: 'empty' });
    expect(no('   ')).toMatchObject({ reason: 'empty' });
  });
  it('says when the text is not a link', () => {
    expect(no('posted it just now')).toMatchObject({ reason: 'not-a-link' });
    expect(no('tiktok')).toMatchObject({ reason: 'not-a-link' });
    expect(no('mailto:someone@example.com')).toMatchObject({ reason: 'not-a-link' });
    expect(no('javascript:alert(1)')).toMatchObject({ reason: 'not-a-link' });
  });
  it('says when the link is from a site hemreel does not post to', () => {
    const r = no('https://www.twitch.tv/videos/2290417733');
    expect(r.reason).toBe('other-site');
    expect(r.message).toMatch(/TikTok, Reels, Shorts and X/);
    expect(r.platform).toBeUndefined();
    // a look-alike host is another site, not TikTok
    expect(no('https://tiktok.com.example.org/@you/video/7436120045518230021').reason).toBe('other-site');
    expect(no('https://nottiktok.com/@you/video/7436120045518230021').reason).toBe('other-site');
  });
  it('finds the link inside pasted text and drops quotes and a trailing full stop', () => {
    expect(ok('Check this out https://www.tiktok.com/@you/video/7436120045518230021 #ad').platform).toBe('tiktok');
    expect(ok('"https://x.com/you/status/1859012345678901234"').platform).toBe('x');
    expect(ok('<https://youtu.be/dQw4w9WgXcQ>').platform).toBe('shorts');
    expect(ok('https://www.instagram.com/reel/C8xYz12AbCd/.').platform).toBe('reels');
  });
  it('every refusal carries a sentence without an em dash', () => {
    for (const text of ['', 'nope', 'https://example.com/a', 'https://www.tiktok.com/@you', 'https://www.instagram.com/you', 'https://www.youtube.com/@you', 'https://x.com/you']) {
      const r = no(text);
      expect(r.message.length).toBeGreaterThan(10);
      expect(r.message).not.toMatch(/—/);
    }
  });
});

describe('the kit’s own links', () => {
  it('the stand-in link for every platform parses back to that platform, unchanged', () => {
    for (const platform of ['tiktok', 'reels', 'shorts', 'x'] as const) {
      const url = placeholderPostUrl(platform, 'c12');
      expect(ok(url)).toMatchObject({ platform, url });
    }
  });
  it('readableLink drops the scheme, www and a trailing slash', () => {
    expect(readableLink('https://www.tiktok.com/@you/video/7436120045518230021')).toBe('tiktok.com/@you/video/7436120045518230021');
    expect(readableLink('https://www.instagram.com/reel/C8xYz12AbCd/')).toBe('instagram.com/reel/C8xYz12AbCd');
    expect(readableLink('https://x.com/you/status/1')).toBe('x.com/you/status/1');
  });
  it('has an example for every platform', () => {
    expect(Object.keys(LINK_EXAMPLE).sort()).toEqual(['reels', 'shorts', 'tiktok', 'x']);
  });
});
