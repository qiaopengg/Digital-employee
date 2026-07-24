import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { cancelAnimation, useSharedValue } from 'react-native-reanimated';

import type { Facing } from './officeBehaviorModel';
import {
  DELIVERY_BUBBLES,
  DELIVERY_TIMING,
  REVIEWER_BOSS_OUTBOUND_PATH,
  REVIEWER_BOSS_RETURN_PATH,
  REVIEWER_SECRETARY_OUTBOUND_PATH,
  REVIEWER_SECRETARY_RETURN_PATH,
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
  type NormalizedPoint,
} from './officePhysicsModel';

export type DeliveryDocumentCarrier = 'reviewer' | 'secretary';

export type UseDeliveryBehaviorOptions = {
  bossPresent: boolean;
  enabled: boolean;
  sceneSize: SceneSize;
  taskKey?: string;
};

type PendingDelay = {
  resolve: (finished: boolean) => void;
  timer: ReturnType<typeof setTimeout>;
};

export function useDeliveryBehavior({
  bossPresent,
  enabled,
  sceneSize,
  taskKey,
}: UseDeliveryBehaviorOptions) {
  const [phase, setPhase] = useState<DeliveryPhase>('idle');
  const [resultReady, setResultReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [reviewerFacing, setReviewerFacing] = useState<Facing>('north');
  const [secretaryFacing, setSecretaryFacing] = useState<Facing>('north');
  const iconX = useSharedValue(0);
  const iconY = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const reviewerX = useSharedValue(0);
  const reviewerY = useSharedValue(0);
  const reviewerBob = useSharedValue(0);
  const reviewerGait = useSharedValue(0);
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
  const reviewerPosition = useMemo<ActorPosition>(
    () => ({ x: reviewerX, y: reviewerY }),
    [reviewerX, reviewerY],
  );
  const reviewerMotion = useMemo<ActorMotion>(
    () => ({
      bob: reviewerBob,
      gait: reviewerGait,
      position: reviewerPosition,
    }),
    [reviewerBob, reviewerGait, reviewerPosition],
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
    cancelActorMotion(reviewerMotion);
    cancelActorMotion(secretaryMotion);
    cancelAnimation(iconX);
    cancelAnimation(iconY);
    cancelAnimation(iconOpacity);
  }, [cancelDelay, iconOpacity, iconX, iconY, reviewerMotion, secretaryMotion]);

  const resetActors = useCallback(() => {
    setActorPosition(reviewerPosition, OFFICE_ANCHORS.reviewerSeat, sceneSize);
    setActorPosition(
      secretaryPosition,
      OFFICE_ANCHORS.secretarySeat,
      sceneSize,
    );
    reviewerBob.value = 0;
    reviewerGait.value = 0;
    secretaryBob.value = 0;
    secretaryGait.value = 0;
    setReviewerFacing('north');
    setSecretaryFacing('north');
  }, [
    reviewerBob,
    reviewerGait,
    reviewerPosition,
    sceneSize,
    secretaryBob,
    secretaryGait,
    secretaryPosition,
  ]);

  const playReviewerPath = useCallback(
    (path: ReadonlyArray<NormalizedPoint>, duration: number) =>
      playActorPath(
        { motion: reviewerMotion, path, setFacing: setReviewerFacing },
        duration,
        sceneSize,
        delay,
      ),
    [delay, reviewerMotion, sceneSize],
  );

  const playSecretaryPath = useCallback(
    (path: ReadonlyArray<NormalizedPoint>, duration: number) =>
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
    resetActors();
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

    setPhase('reviewerStanding');
    if (
      !(await animateActorPosition(
        reviewerPosition,
        OFFICE_ANCHORS.reviewerStand,
        sceneSize,
        DELIVERY_TIMING.reviewerStand,
      )) ||
      runId.current !== currentRunId
    ) {
      return;
    }

    if (!bossPresent) {
      setPhase('secretaryStanding');
      if (
        !(await animateActorPosition(
          secretaryPosition,
          OFFICE_ANCHORS.secretaryStand,
          sceneSize,
          DELIVERY_TIMING.secretaryStand,
        )) ||
        runId.current !== currentRunId
      ) {
        return;
      }
    }

    setPhase('reviewerOutbound');
    const reviewerOutboundPath = bossPresent
      ? REVIEWER_BOSS_OUTBOUND_PATH
      : REVIEWER_SECRETARY_OUTBOUND_PATH;
    const reviewerOutboundDuration = bossPresent
      ? DELIVERY_TIMING.reviewerToBoss
      : DELIVERY_TIMING.reviewerToSecretary;
    if (
      !(await playReviewerPath(
        reviewerOutboundPath,
        reviewerOutboundDuration,
      )) ||
      runId.current !== currentRunId
    ) {
      return;
    }

    if (bossPresent) {
      setPhase('reviewerPlacing');
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

      setPhase('reviewerReturning');
      if (
        !(await playReviewerPath(
          REVIEWER_BOSS_RETURN_PATH,
          DELIVERY_TIMING.reviewerReturnBoss,
        )) ||
        runId.current !== currentRunId
      ) {
        return;
      }
    } else {
      setPhase('reviewerHandoff');
      if (
        !(await delay(DELIVERY_TIMING.reviewerHandoff)) ||
        runId.current !== currentRunId
      ) {
        return;
      }

      setPhase('reviewerReturning');
      if (
        !(await playReviewerPath(
          REVIEWER_SECRETARY_RETURN_PATH,
          DELIVERY_TIMING.reviewerReturnSecretary,
        )) ||
        runId.current !== currentRunId
      ) {
        return;
      }
    }

    setReviewerFacing('north');
    setPhase('reviewerSeating');
    if (
      !(await animateActorPosition(
        reviewerPosition,
        OFFICE_ANCHORS.reviewerSeat,
        sceneSize,
        DELIVERY_TIMING.reviewerSeat,
      )) ||
      runId.current !== currentRunId
    ) {
      return;
    }

    if (!bossPresent) {
      setPhase('secretaryOutbound');
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
      setPhase('secretarySeating');
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
    }

    setPhase('deskReady');
  }, [
    bossPresent,
    cancelCurrentRun,
    delay,
    iconOpacity,
    iconPosition,
    playReviewerPath,
    playSecretaryPath,
    reduceMotion,
    resetActors,
    reviewerPosition,
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
      resetActors();
    }

    if (!enabled || !taskKey) {
      runId.current += 1;
      cancelCurrentRun();
      deliveredForKey.current = undefined;
      iconOpacity.value = 0;
      setResultReady(false);
      setPhase('idle');
      resetActors();
      return;
    }
    if (deliveredForKey.current === taskKey) return;

    deliveredForKey.current = taskKey;
    runDelivery();
  }, [
    cancelCurrentRun,
    enabled,
    iconOpacity,
    resetActors,
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

  const reviewerPhase: IdleActivityPhase =
    phase === 'idle' ||
    phase === 'secretaryOutbound' ||
    phase === 'placing' ||
    phase === 'secretaryReturning' ||
    phase === 'secretarySeating' ||
    phase === 'deskReady'
      ? 'atDesk'
      : phase === 'reviewerReturning' || phase === 'reviewerSeating'
      ? 'returning'
      : phase === 'reviewerHandoff' || phase === 'reviewerPlacing'
      ? 'away'
      : 'departing';

  const secretaryPhase: IdleActivityPhase = bossPresent
    ? 'atDesk'
    : phase === 'idle' || phase === 'reviewerStanding' || phase === 'deskReady'
    ? 'atDesk'
    : phase === 'secretaryReturning' || phase === 'secretarySeating'
    ? 'returning'
    : phase === 'secretaryStanding' || phase === 'secretaryOutbound'
    ? 'departing'
    : 'away';

  const documentCarrier: DeliveryDocumentCarrier | undefined =
    phase === 'reviewerStanding' ||
    phase === 'secretaryStanding' ||
    phase === 'reviewerOutbound' ||
    phase === 'reviewerHandoff'
      ? 'reviewer'
      : !bossPresent &&
        (phase === 'reviewerReturning' ||
          phase === 'reviewerSeating' ||
          phase === 'secretaryOutbound')
      ? 'secretary'
      : undefined;

  return {
    bubble: DELIVERY_BUBBLES[phase],
    deskReady: phase === 'deskReady',
    documentCarrier,
    iconOpacity,
    iconPosition,
    phase,
    resultReady,
    reviewerBob,
    reviewerFacing,
    reviewerGait,
    reviewerPhase,
    reviewerPosition,
    secretaryBob,
    secretaryFacing,
    secretaryGait,
    secretaryPhase,
    secretaryPosition,
  };
}
