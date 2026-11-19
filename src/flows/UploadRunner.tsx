import { useEffect } from 'react';
import { useFrozen } from '@/hooks/clock';
import { useClipStore, useClips } from '@/state/clips';

/**
 * Stands in for the posting service: moves running uploads forward until each becomes a post.
 * Mounted once per screen by ScreenFrame, inside the toast host. It stands still while the clock is frozen (?freeze).
 * STUB: the post flow adds the toasts for "posted" and "couldn't post".
 */
export function UploadRunner() {
  const store = useClipStore();
  const frozen = useFrozen();
  const active = useClips().some((c) => c.uploads.some((u) => u.state === 'uploading'));
  useEffect(() => {
    if (frozen || !active) return;
    const id = window.setInterval(() => store.tickUploads(7, Date.now()), 300);
    return () => window.clearInterval(id);
  }, [store, frozen, active]);
  return null;
}
