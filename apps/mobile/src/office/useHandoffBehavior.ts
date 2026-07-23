import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import {
  HANDOFF_FRAMES,
  HANDOFF_TIMING,
  type Facing,
  type HandoffPhase,
} from './officeBehaviorModel';
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
  HANDOFF_STANCE_RADIUS,
  STRATEGY_OUTBOUND_PATH,
  STRATEGY_RETURN_PATH,
  assertActorsDoNotOverlap,
} from './officePhysicsModel';

type UseHandoffBehaviorOptions = {
  enabled: boolean;
  onComplete: () => void;
  replayToken: number;
  sceneSize: SceneSize;
};

type PendingDelay = {
  resolve: (finished: boolean) => void;
  timer: ReturnType<typeof setTimeout>;
};

export function useHandoffBehavior({
  enabled,
  onComplete,
  replayToken,
  sceneSize,
}: UseHandoffBehaviorOptions) {
  const [phase, setPhase] = useState<HandoffPhase>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [strategyFacing, setStrategyFacing] = useState<Facing>('north');
  const [reviewerFacing, setReviewerFacing] = useState<Facing>('north');
  const strategyX = useSharedValue(0);
  const strategyY = useSharedValue(0);
  const reviewerX = useSharedValue(0);
  const reviewerY = useSharedValue(0);
  const strategyBob = useSharedValue(0);
  const reviewerBob = useSharedValue(0);
  const strategyGait = useSharedValue(0);
  const reviewerGait = useSharedValue(0);
  const completionCallback = useRef(onComplete);
  const lastReplayToken = useRef<number | undefined>(undefined);
  const pendingDelay = useRef<PendingDelay | undefined>(undefined);
  const runId = useRef(0);

  const strategyPosition = useMemo<ActorPosition>(
    () => ({ x: strategyX, y: strategyY }),
    [strategyX, strategyY],
  );
  const reviewerPosition = useMemo<ActorPosition>(
    () => ({ x: reviewerX, y: reviewerY }),
    [reviewerX, reviewerY],
  );
  const strategyMotion = useMemo<ActorMotion>(
    () => ({
      bob: strategyBob,
      gait: strategyGait,
      position: strategyPosition,
    }),
    [strategyBob, strategyGait, strategyPosition],
  );
  const reviewerMotion = useMemo<ActorMotion>(
    () => ({
      bob: reviewerBob,
      gait: reviewerGait,
      position: reviewerPosition,
    }),
    [reviewerBob, reviewerGait, reviewerPosition],
  );

  useEffect(() => {
    completionCallback.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) setReduceMotion(enabled);
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
    const activeDelay = pendingDelay.current;
    if (!activeDelay) return;
    clearTimeout(activeDelay.timer);
    pendingDelay.current = undefined;
    activeDelay.resolve(false);
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
    cancelActorMotion(strategyMotion);
    cancelActorMotion(reviewerMotion);
  }, [cancelDelay, reviewerMotion, strategyMotion]);

  const resetToHome = useCallback(() => {
    setActorPosition(strategyPosition, OFFICE_ANCHORS.strategySeat, sceneSize);
    setActorPosition(reviewerPosition, OFFICE_ANCHORS.reviewerSeat, sceneSize);
    strategyBob.value = 0;
    reviewerBob.value = 0;
    strategyGait.value = 0;
    reviewerGait.value = 0;
    setStrategyFacing('north');
    setReviewerFacing('north');
  }, [
    reviewerBob,
    reviewerGait,
    reviewerPosition,
    sceneSize,
    strategyBob,
    strategyGait,
    strategyPosition,
  ]);

  const playStrategyPath = useCallback(
    (path: typeof STRATEGY_OUTBOUND_PATH, duration: number) =>
      playActorPath(
        {
          motion: strategyMotion,
          path,
          setFacing: setStrategyFacing,
        },
        duration,
        sceneSize,
        delay,
      ),
    [delay, sceneSize, strategyMotion],
  );

  const runBehavior = useCallback(async () => {
    assertActorsDoNotOverlap(
      'workstation handoff stance',
      OFFICE_ANCHORS.reviewerVisitor,
      OFFICE_ANCHORS.reviewerStand,
      HANDOFF_STANCE_RADIUS,
    );
    cancelCurrentRun();
    const currentRunId = runId.current + 1;
    runId.current = currentRunId;
    resetToHome();
    setPhase('idle');
    setIsRunning(true);
    let completed = false;

    try {
      if (reduceMotion) {
        setActorPosition(
          strategyPosition,
          OFFICE_ANCHORS.reviewerVisitor,
          sceneSize,
        );
        setActorPosition(
          reviewerPosition,
          OFFICE_ANCHORS.reviewerStand,
          sceneSize,
        );
        setStrategyFacing('west');
        setReviewerFacing('east');
        setPhase('conversation');
        if (!(await delay(220))) return;
        setPhase('handoff');
        if (!(await delay(220))) return;
        resetToHome();
        setPhase('reviewing');
        completed = true;
        return;
      }

      if (!(await delay(HANDOFF_TIMING.idle))) return;
      setPhase('strategyStanding');
      if (
        !(await animateActorPosition(
          strategyPosition,
          OFFICE_ANCHORS.strategyStand,
          sceneSize,
          HANDOFF_TIMING.strategyStand,
        ))
      ) {
        return;
      }

      setStrategyFacing('east');
      setPhase('strategyTurning');
      if (!(await delay(HANDOFF_TIMING.strategyTurn))) return;

      setPhase('strategyWalking');
      if (
        !(await playStrategyPath(
          STRATEGY_OUTBOUND_PATH,
          HANDOFF_TIMING.outboundWalk,
        ))
      ) {
        return;
      }

      setStrategyFacing('east');
      setPhase('reviewerStanding');
      if (
        !(await animateActorPosition(
          reviewerPosition,
          OFFICE_ANCHORS.reviewerStand,
          sceneSize,
          HANDOFF_TIMING.reviewerStand,
        ))
      ) {
        return;
      }

      setReviewerFacing('west');
      setPhase('reviewerTurning');
      if (!(await delay(HANDOFF_TIMING.reviewerTurn))) return;

      setPhase('conversation');
      if (!(await delay(HANDOFF_TIMING.conversation))) return;
      setPhase('handoff');
      if (!(await delay(HANDOFF_TIMING.handoff))) return;

      setReviewerFacing('north');
      setPhase('reviewerSeating');
      if (
        !(await animateActorPosition(
          reviewerPosition,
          OFFICE_ANCHORS.reviewerSeat,
          sceneSize,
          HANDOFF_TIMING.reviewerSeating,
        ))
      ) {
        return;
      }

      setStrategyFacing('west');
      setPhase('strategyTurningHome');
      if (!(await delay(HANDOFF_TIMING.strategyTurnHome))) return;

      setPhase('strategyReturning');
      if (
        !(await playStrategyPath(
          STRATEGY_RETURN_PATH,
          HANDOFF_TIMING.returnWalk,
        ))
      ) {
        return;
      }

      setStrategyFacing('north');
      setPhase('strategySeating');
      if (
        !(await animateActorPosition(
          strategyPosition,
          OFFICE_ANCHORS.strategySeat,
          sceneSize,
          HANDOFF_TIMING.strategySeating,
        ))
      ) {
        return;
      }

      setPhase('reviewing');
      completed = true;
    } finally {
      if (runId.current === currentRunId) {
        setIsRunning(false);
        if (completed) completionCallback.current();
      }
    }
  }, [
    cancelCurrentRun,
    delay,
    playStrategyPath,
    reduceMotion,
    resetToHome,
    reviewerPosition,
    sceneSize,
    strategyPosition,
  ]);

  useEffect(() => {
    if (sceneSize.height <= 0 || sceneSize.width <= 0) return;

    if (!enabled) {
      runId.current += 1;
      cancelCurrentRun();
      lastReplayToken.current = undefined;
      resetToHome();
      setPhase('idle');
      setIsRunning(false);
      return;
    }

    if (lastReplayToken.current === replayToken) return;
    lastReplayToken.current = replayToken;
    runBehavior();
  }, [
    cancelCurrentRun,
    enabled,
    replayToken,
    resetToHome,
    runBehavior,
    sceneSize.height,
    sceneSize.width,
  ]);

  useEffect(() => {
    return () => {
      runId.current += 1;
      cancelCurrentRun();
    };
  }, [cancelCurrentRun]);

  const frame = HANDOFF_FRAMES[phase];

  return {
    frame: {
      ...frame,
      reviewer: { ...frame.reviewer, facing: reviewerFacing },
      strategy: { ...frame.strategy, facing: strategyFacing },
    },
    isRunning,
    phase,
    reviewerBob,
    reviewerGait,
    reviewerPosition,
    strategyBob,
    strategyGait,
    strategyPosition,
  };
}
