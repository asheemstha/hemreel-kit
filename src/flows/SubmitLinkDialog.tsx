import { Dialog } from '@/ui/Dialog';

export interface SubmitLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * The clip whose link goes to the campaign.
   * No link stored yet (posted by hand): the dialog starts by asking for it. Link known: it goes straight to the submit steps.
   * Window closed: the same steps, with the late warning.
   */
  clipId: string | null;
}

/** STUB: replaced by the real link and submit flow. */
export function SubmitLinkDialog({ open, onOpenChange }: SubmitLinkDialogProps) {
  return <Dialog open={open} onOpenChange={onOpenChange} title="Submit link">Not built yet.</Dialog>;
}
