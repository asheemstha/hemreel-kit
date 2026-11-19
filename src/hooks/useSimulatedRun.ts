import { useEffect, useRef } from 'react';
import { useFrozen } from './clock';

/**
 * Stands in for a long job (finding moments, rendering): calls `tick` every `ms` while `active`.
 * It stands still while the clock is frozen (?freeze), so screenshots show the designed moment of the run.
 */
export function useSimulatedRun(active: boolean, tick: () => void, ms = 250): void {
  const frozen = useFrozen();
  const latest = useRef(tick);
  useEffect(() => {
    latest.current = tick;
  });
  useEffect(() => {
    if (!active || frozen) return;
    const id = window.setInterval(() => latest.current(), ms);
    return () => window.clearInterval(id);
  }, [active, frozen, ms]);
}
