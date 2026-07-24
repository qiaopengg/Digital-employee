import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import type { EmployeeId } from './employeeProfiles';
import {
  DEPARTURE_ROUTES,
  DEPARTURE_TIMING,
  type DeparturePhase,
} from './officeDepartureModel';
import type { Facing } from './officeBehaviorModel';
import {
  animateActorPosition,
  cancelActorMotion,
  playActorPath,
  setActorPosition,
  type ActorMotion,
  type ActorPosition,
  type SceneSize,
} from './officeMotionAnimation';

type Options = {
  employeeId: EmployeeId;
  /** True once this employee has no task duty and should leave for the day. */
  enabled: boolean;
  sceneSize: SceneSize;
};

type PendingDelay = {
  resolve: (finished: boolean) => void;
  timer: ReturnType<typeof setTimeout>;
};

/**
 * Walks an off-duty employee out through the office exit once their shift
 * ends and they have no active task role. On the very first render where
 * `enabled` is already true (e.g. the app opened outside working hours),
 * the employee is treated as already gone and jumps straight to
 * `departed` without animating, since there was no visible "at desk"
 * moment to walk away from.
 */
export function useDepartureBehavior({
  employeeId,
  enabled,
  sceneSize,
}: Options) {
  const route = DEPARTURE_ROUTES[employeeId];
  const [phase, setPhase] = useState<DeparturePhase>(
    enabled ? 'departed' : 'atDesk',
  );
  const [facing, setFacing] = useState<Facing>('north');
  const [reduceMotion, setReduceMotion] = useState(false);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const bob = useSharedValue(0);
  const gait = useSharedValue(0);
  const pendingDelay = useRef<PendingDelay | undefined>(undefined);
  const runId = useRef(0);
  const hasMounted = useRef(false);
  const position = useMemo<ActorPosition>(() => ({ x, y }), [x, y]);
  const motion = useMemo<ActorMotion>(
    () => ({ bob, gait, position }),
    [bob, gait, position],
  );

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted) setReduceMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const cancelDelay = useCallback(() => {
    const active = pendingDelay.current;
    if (!active) return;
    clearTimeout(active.timer);
    pendingDelay.current = undefined;
    active.resolve(false);
  }, []);

  const delay = useCallback(
    (duration: number) => {
      cancelDelay();
      return new Promise<boolean>(resolve => {
        const timer = setTimeout(() => {
          pendingDelay.current = undefined;
          resolve(true);
        }, duration);
        pendingDelay.current = { resolve, timer };
      });
    },
    [cancelDelay],
  );

  const runDeparture = useCallback(async () => {
    const currentRunId = runId.current;
    cancelDelay();
    cancelActorMotion(motion);
    setActorPosition(position, route.home, sceneSize);
    setFacing('north');

    if (reduceMotion) {
      setActorPosition(position, route.exitPath.at(-1)!, sceneSize);
      setPhase('departed');
      return;
    }

    setPhase('leaving');
    if (
      !(await animateActorPosition(
        position,
        route.stand,
        sceneSize,
        DEPARTURE_TIMING.leaveSeat,
      )) ||
      runId.current !== currentRunId
    )
      return;
    if (
      !(await playActorPath(
        { motion, path: route.exitPath, setFacing },
        DEPARTURE_TIMING.outbound,
        sceneSize,
        delay,
      )) ||
      runId.current !== currentRunId
    )
      return;

    setPhase('departed');
  }, [cancelDelay, delay, motion, position, reduceMotion, route, sceneSize]);

  useEffect(() => {
    if (sceneSize.width <= 0 || sceneSize.height <= 0) return;

    runId.current += 1;
    const currentRunId = runId.current;

    if (!enabled) {
      cancelDelay();
      cancelActorMotion(motion);
      setPhase('atDesk');
      hasMounted.current = true;
      return;
    }

    if (!hasMounted.current) {
      // Cold start already outside working hours: there is no on-screen
      // "at desk" moment to depart from, so skip straight to departed.
      setActorPosition(position, route.exitPath.at(-1)!, sceneSize);
      setPhase('departed');
      hasMounted.current = true;
      return;
    }

    runDeparture();
    return () => {
      if (runId.current === currentRunId) return;
      cancelDelay();
      cancelActorMotion(motion);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sceneSize.height, sceneSize.width]);

  return { bob, facing, gait, phase, position };
}
