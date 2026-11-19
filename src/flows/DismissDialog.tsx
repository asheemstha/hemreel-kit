import { ConfirmDialog } from '@/ui/ConfirmDialog';

export interface DismissDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The clip past its submit window that the person wants off the "Needs you" list. */
  clipId: string | null;
}

/** STUB: replaced by the real dismiss confirmation. */
export function DismissDialog({ open, onOpenChange }: DismissDialogProps) {
  return <ConfirmDialog open={open} onOpenChange={onOpenChange} title="Dismiss?" confirmLabel="Dismiss" tone="neutral" onConfirm={() => {}} />;
}
