import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import type { Facing } from './officeBehaviorModel';
import {
  DELIVERY_BUBBLES,
  DELIVERY_TIMING,
  type DeliveryPhase,
} from './officeDeliveryModel';
import type { IdleActivityPhase } from './officeActivityModel';
import {
  animateActorPosition,
  cancelActorMotion,
  playActorPath,
  setActorPosition,
  type ActorMotion,
  type ActorPosition,
  type SceneSize,
} from './officeMotionAnimation';
import {
  OFFICE_ANCHORS,
  SECRETARY_BOSS_OUTBOUND_PATH,
  SECRETARY_BOSS_RETURN_PATH,
} from './officePhysicsModel';

type Options = {
  enabled: boolean;
  sceneSize: SceneSize;
  taskKey?: string;
};

type PendingDelay = {
  resolve: (finished: boolean) => void;
  timer: ReturnType<typeof setTimeout>;
};

export function useDeliveryBehavior({ enabled, sceneSize, taskKey }: Options) {
  const [phase, setPhase] = useState<DeliveryPhase>('idle');
  const [resultReady, setResultReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [secretaryFacing, setSecretaryFacing] = useState<Facing>('north');
  const iconX = useSharedValue(0);
  const iconY = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const secretaryX = useSharedValue(0);
  const secretaryY = useSharedValue(0);
  const secretaryBob = useSharedValue(0);
  const secretaryGait = useSharedValue(0);
  const activeTaskKey = useRef<string | undefined>(undefined);
  const deliveredForKey = useRef<string | undefined>(undefined);
  const pendingDelay = useRef<PendingDelay | undefined>(undefined);
  const runId = useRef(0);

  const iconPosition = useMemo<ActorPosition>(
    () => ({ x: iconX, y: iconY }),
    [iconX, iconY],
  );
  const secretaryPosition = useMemo<ActorPosition>(
    () => ({ x: secretaryX, y: secretaryY }),
    [secretaryX, secretaryY],
  );
  const secretaryMotion = useMemo<ActorMotion>(
    () => ({
      bob: secretaryBob,
      gait: secretaryGait,
      position: secretaryPosition,
    }),
    [secretaryBob, secretaryGait, secretaryPosition],
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

  const cancelCurrentRun = useCallback(() => {
    cancelDelay();
    cancelActorMotion(secretaryMotion);
  }, [cancelDelay, secretaryMotion]);

  const resetSecretary = useCallback(() => {
    cancelCurrentRun();
    setActorPosition(
      secretaryPosition,
      OFFICE_ANCHORS.secretarySeat,
      sceneSize,
    );
    setSecretaryFacing('north');
  }, [cancelCurrentRun, sceneSize, secretaryPosition]);

  const playSecretaryPath = useCallback(
    (
      path: typeof SECRETARY_BOSS_OUTBOUND_PATH,
      duration: number,
    ) =>
      playActorPath(
        { motion: secretaryMotion, path, setFacing: setSecretaryFacing },
        duration,
        sceneSize,
        delay,
      ),
    [delay, sceneSize, secretaryMotion],
  );

  const runDelivery = useCallback(async () => {
    cancelCurrentRun();
    const currentRunId = runId.current + 1;
    runId.current = currentRunId;
    resetSecretary();
    setResultReady(false);
    setActorPosition(iconPosition, OFFICE_ANCHORS.reviewerStand, sceneSize);
    iconOpacity.value = 1;

    if (reduceMotion) {
      setActorPosition(iconPosition, OFFICE_ANCHORS.bossDesk, sceneSize);
      iconOpacity.value = 0;
      setResultReady(true);
      setPhase('deskReady');
      return;
    }

    setPhase('reviewerHandoff');
    if (
      !(await animateActorPosition(
        iconPosition,
        OFFICE_ANCHORS.secretarySeat,
        sceneSize,
        DELIVERY_TIMING.reviewerHandoff,
      )) ||
      runId.current !== currentRunId
    ) {
      return;
    }

    setPhase('secretaryOutbound');
    if (
      !(await animateActorPosition(
        secretaryPosition,
        OFFICE_ANCHORS.secretaryStand,
        sceneSize,
        DELIVERY_TIMING.secretaryStand,
      ))
    ) {
      return;
    }
    if (
      !(await playSecretaryPath(
        SECRETARY_BOSS_OUTBOUND_PATH,
        DELIVERY_TIMING.secretaryOutbound,
      )) ||
      runId.current !== currentRunId
    ) {
      return;
    }

    setPhase('placing');
    setActorPosition(
      iconPosition,
      OFFICE_ANCHORS.bossDeskApproach,
      sceneSize,
    );
    if (
      !(await animateActorPosition(
        iconPosition,
        OFFICE_ANCHORS.bossDesk,
        sceneSize,
        DELIVERY_TIMING.placing,
      )) ||
      runId.current !== currentRunId
    ) {
      return;
    }

    iconOpacity.value = 0;
    setResultReady(true);
    setPhase('secretaryReturning');
    if (
      !(await playSecretaryPath(
        SECRETARY_BOSS_RETURN_PATH,
        DELIVERY_TIMING.secretaryReturn,
      )) ||
      runId.current !== currentRunId
    ) {
      return;
    }

    setSecretaryFacing('north');
    if (
      !(await animateActorPosition(
        secretaryPosition,
        OFFICE_ANCHORS.secretarySeat,
        sceneSize,
        DELIVERY_TIMING.secretarySeat,
      )) ||
      runId.current !== currentRunId
    ) {
      return;
    }
    setPhase('deskReady');
  }, [
    cancelCurrentRun,
    iconOpacity,
    iconPosition,
    playSecretaryPath,
    reduceMotion,
    resetSecretary,
    sceneSize,
    secretaryPosition,
  ]);

  useEffect(() => {
    if (sceneSize.width <= 0 || sceneSize.height <= 0) return;

    if (activeTaskKey.current !== taskKey) {
      runId.current += 1;
      cancelCurrentRun();
      activeTaskKey.current = taskKey;
      deliveredForKey.current = undefined;
      setResultReady(false);
      setPhase('idle');
      iconOpacity.value = 0;
      resetSecretary();
    }

    if (!enabled || !taskKey) {
      runId.current += 1;
      cancelCurrentRun();
      iconOpacity.value = 0;
      resetSecretary();
      setPhase('idle');
      return;
    }
    if (deliveredForKey.current === taskKey) return;

    deliveredForKey.current = taskKey;
    runDelivery();
  }, [
    cancelCurrentRun,
    enabled,
    iconOpacity,
    resetSecretary,
    runDelivery,
    sceneSize.height,
    sceneSize.width,
    taskKey,
  ]);

  useEffect(
    () => () => {
      runId.current += 1;
      cancelCurrentRun();
    },
    [cancelCurrentRun],
  );

  const secretaryPhase: IdleActivityPhase =
    phase === 'idle' || phase === 'reviewerHandoff' || phase === 'deskReady'
      ? 'atDesk'
      : phase === 'secretaryReturning'
      ? 'returning'
      : phase === 'placing'
      ? 'away'
      : 'departing';

  return {
    bubble: DELIVERY_BUBBLES[phase],
    documentIsCarried: phase === 'secretaryOutbound',
    iconOpacity,
    iconPosition,
    phase,
    resultReady,
    secretaryBob,
    secretaryFacing,
    secretaryGait,
    secretaryPhase,
    secretaryPosition,
  };
}
