import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const CLOCK_TICK_MS = 30_000;

/**
 * Real-time clock for office schedule and lighting decisions. Ticks on an
 * interval while the app is active and re-syncs immediately on foreground
 * so the office does not keep animating in the background (per the
 * "no continuous background animation" product invariant) while still
 * reflecting true wall-clock time as soon as the user returns.
 */
export function useOfficeClock(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') setNow(new Date());
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  return now;
}
