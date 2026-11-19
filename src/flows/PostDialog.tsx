import { Dialog } from '@/ui/Dialog';
import type { Account } from '@/data/posts';

export interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The clips to post. If any of them is already uploading, or has a failed upload, the dialog opens on the upload status instead. */
  clipIds: string[];
  /** Posting accounts. Defaults to the ones in Settings (ACCOUNTS). */
  accounts?: Account[];
}

/** STUB: replaced by the real post flow. */
export function PostDialog({ open, onOpenChange, clipIds }: PostDialogProps) {
  return <Dialog open={open} onOpenChange={onOpenChange} title={`Post ${clipIds.length} clips`}>Not built yet.</Dialog>;
}
