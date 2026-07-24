import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import type { EmployeeId } from './employeeProfiles';
import {
  IDLE_ACTIVITY_ROUTES,
  IDLE_ACTIVITY_TIMING,
  createSeededRandom,
  seedForEmployee,
  type IdleActivityPhase,
} from './officeActivityModel';
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
import { MAX_AWAY_FROM_DESK_MS } from './officeScheduleModel';

type Options = {
  employeeId: EmployeeId;
  enabled: boolean;
  onComplete: () => void;
  sceneSize: SceneSize;
};

type PendingDelay = {
  resolve: (finished: boolean) => void;
  timer: ReturnType<typeof setTimeout>;
};

export function useIdleActivityBehavior({
  employeeId,
  enabled,
  onComplete,
  sceneSize,
}: Options) {
  const route = IDLE_ACTIVITY_ROUTES[employeeId];
  const [phase, setPhase] = useState<IdleActivityPhase>('atDesk');
  const [facing, setFacing] = useState<Facing>('north');
  const [reduceMotion, setReduceMotion] = useState(false);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const bob = useSharedValue(0);
  const gait = useSharedValue(0);
  const pendingDelay = useRef<PendingDelay | undefined>(undefined);
  const awayDeadline = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const runId = useRef(0);
  const random = useRef(createSeededRandom(seedForEmployee(employeeId)));
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

  const cancelAwayDeadline = useCallback(() => {
    if (!awayDeadline.current) return;
    clearTimeout(awayDeadline.current);
    awayDeadline.current = undefined;
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

  const resetHome = useCallback(() => {
    cancelAwayDeadline();
    cancelDelay();
    cancelActorMotion(motion);
    setActorPosition(position, route.home, sceneSize);
    setFacing('north');
    setPhase('atDesk');
  }, [
    cancelAwayDeadline,
    cancelDelay,
    motion,
    position,
    route.home,
    sceneSize,
  ]);

  const finish = useCallback(() => {
    resetHome();
    onComplete();
  }, [onComplete, resetHome]);

  const runActivity = useCallback(async () => {
    const currentRunId = runId.current;
    resetHome();

    if (reduceMotion) {
      onComplete();
      return;
    }

    const destination =
      route.destinations[
        Math.floor(random.current() * route.destinations.length)
      ];
    const corridorEntry = { x: 0.54, y: route.stand.y };
    const roomDoor = { x: 0.58, y: destination.y };
    const outboundPath = [route.stand, corridorEntry, roomDoor, destination];
    const returnPath = [...outboundPath].reverse();

    awayDeadline.current = setTimeout(() => {
      awayDeadline.current = undefined;
      if (runId.current !== currentRunId) return;
      runId.current += 1;
      finish();
    }, MAX_AWAY_FROM_DESK_MS);

    setPhase('departing');
    if (
      !(await animateActorPosition(
        position,
        route.stand,
        sceneSize,
        IDLE_ACTIVITY_TIMING.leaveSeat,
      ))
    )
      return;
    if (
      !(await playActorPath(
        { motion, path: outboundPath, setFacing },
        IDLE_ACTIVITY_TIMING.outbound,
        sceneSize,
        delay,
      )) ||
      runId.current !== currentRunId
    )
      return;

    setPhase('away');
    const stay =
      IDLE_ACTIVITY_TIMING.stayMin +
      random.current() *
        (IDLE_ACTIVITY_TIMING.stayMax - IDLE_ACTIVITY_TIMING.stayMin);
    if (!(await delay(stay)) || runId.current !== currentRunId) return;

    setPhase('returning');
    if (
      !(await playActorPath(
        { motion, path: returnPath, setFacing },
        IDLE_ACTIVITY_TIMING.returnWalk,
        sceneSize,
        delay,
      )) ||
      runId.current !== currentRunId
    )
      return;
    if (
      !(await animateActorPosition(
        position,
        route.home,
        sceneSize,
        IDLE_ACTIVITY_TIMING.takeSeat,
      )) ||
      runId.current !== currentRunId
    )
      return;

    cancelAwayDeadline();
    setFacing('north');
    setPhase('atDesk');
    onComplete();
  }, [
    cancelAwayDeadline,
    delay,
    finish,
    motion,
    onComplete,
    position,
    reduceMotion,
    resetHome,
    route,
    sceneSize,
  ]);

  useEffect(() => {
    runId.current += 1;
    if (sceneSize.width <= 0 || sceneSize.height <= 0 || !enabled) {
      if (sceneSize.width > 0 && sceneSize.height > 0) resetHome();
      return;
    }

    runActivity();
    return () => {
      runId.current += 1;
      cancelAwayDeadline();
      cancelDelay();
      cancelActorMotion(motion);
    };
  }, [
    cancelAwayDeadline,
    cancelDelay,
    enabled,
    motion,
    resetHome,
    runActivity,
    sceneSize.height,
    sceneSize.width,
  ]);

  return { bob, facing, gait, phase, position };
}
