import { Check, CircleAlert, X } from 'lucide-react';
import { forwardRef } from 'react';
import { Button } from './Button';
import { Kbd } from './Kbd';
import './decision-bar.css';

export type DecisionState = 'ready' | 'keep-off' | 'loading';

export interface DecisionBarProps {
  onKeep?: () => void;
  onSkip?: () => void;
  state?: DecisionState;
}

/** Skip and Keep, the two biggest targets on the review screen. The ref points at Keep. */
export const DecisionBar = forwardRef<HTMLButtonElement, DecisionBarProps>(function DecisionBar({ onKeep, onSkip, state = 'ready' }, ref) {
  const loading = state === 'loading';
  return (
    <div className="hr-decision" data-state={state}>
      <div className="hr-decision__buttons">
        <Button className="hr-decision__skip" kind="secondary" size="xl" icon={<X />} shortcut="X" onClick={onSkip} disabled={loading}>Skip</Button>
        <Button ref={ref} className="hr-decision__keep" kind="primary" size="xl" icon={<Check />} shortcut="P" onClick={onKeep} disabled={loading || state === 'keep-off'}>Keep</Button>
      </div>
      {state === 'keep-off' ? (
        <p className="hr-decision__fail"><CircleAlert aria-hidden="true" />Keep is off until this clip renders.</p>
      ) : null}
      <div className="hr-decision__notes">
        <span>After a decision the next unreviewed clip loads.</span>
        <span className="hr-decision__undo"><Kbd>⌘Z</Kbd> undo</span>
      </div>
    </div>
  );
});
