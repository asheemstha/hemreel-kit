import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/** The moment the page loaded. Fixture deadlines are set relative to it, so a frozen clock always shows the designed times. */
export const T0 = Date.now();

const FrozenContext = createContext<number | null>(null);

/** Freezes every countdown at `at` (default T0). The gallery uses it for screenshots with ?freeze. */
export function ClockProvider({ frozen, at = T0, children }: { frozen: boolean; at?: number; children: ReactNode }) {
  return <FrozenContext.Provider value={frozen ? at : null}>{children}</FrozenContext.Provider>;
}

/** The frozen time, or null while the clock runs. */
export function useFrozenAt(): number | null {
  return useContext(FrozenContext);
}

/** True while the clock is frozen (?freeze). Simulated jobs stand still then, so screenshots show the designed moment. */
export function useFrozen(): boolean {
  return useContext(FrozenContext) !== null;
}

/** The current time, updated once a second, or the frozen time. */
export function useNow(): number {
  const frozen = useContext(FrozenContext);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (frozen !== null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [frozen]);
  return frozen ?? now;
}
