import { LoaderCircle } from 'lucide-react';
import './spinner.css';

/** Decorative spinner. Pair it with visible text or a role="status" region. */
export function Spinner({ size = 20, onStage }: { size?: 16 | 20 | 30; onStage?: boolean }) {
  return <LoaderCircle className="hr-spinner" width={size} height={size} data-stage={onStage || undefined} aria-hidden="true" />;
}
