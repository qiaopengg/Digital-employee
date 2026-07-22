import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

import {
  HANDOFF_FRAMES,
  HANDOFF_TIMING,
  type HandoffPhase,
} from './officeBehaviorModel';
import {
  OFFICE_ANCHORS,
  REVIEWER_APPROACH_PATH,
  REVIEWER_RETURN_PATH,
  STRATEGY_OUTBOUND_PATH,
  STRATEGY_RETURN_PATH,
  assertActorsDoNotOverlap,
  assertPathIsWalkable,
  getPathSegmentDurations,
  normalizedPointToPixels,
  type NormalizedPoint,
} from './officePhysicsModel';

type SceneSize = Readonly<{
  height: number;
  width: number;
}>;

type UseHandoffBehaviorOptions = {
  onComplete: () => void;
  replayToken: number;
  sceneSize: SceneSize;
};

type BehaviorAnimation = ReturnType<typeof Animated.timing>;

function createPathAnimation(
  position: Animated.ValueXY,
  bob: Animated.Value,
  path: ReadonlyArray<NormalizedPoint>,
  sceneSize: SceneSize,
  totalDuration: number,
) {
  assertPathIsWalkable('employee animation path', path);
  const durations = getPathSegmentDurations(path, totalDuration);
  const movement = Animated.sequence(
    path.slice(1).map((point, index) => {
      const target = normalizedPointToPixels(
        point,
        sceneSize.width,
        sceneSize.height,
      );

      return Animated.parallel([
        Animated.timing(position.x, {
          duration: durations[index],
          easing: Easing.linear,
          toValue: target.x,
          useNativeDriver: true,
        }),
        Animated.timing(position.y, {
          duration: durations[index],
          easing: Easing.linear,
          toValue: target.y,
          useNativeDriver: true,
        }),
      ]);
    }),
  );
  const bobIterations = Math.max(1, Math.round(totalDuration / 240));
  const bobHalfStep = Math.max(
    70,
    Math.floor(totalDuration / bobIterations / 2),
  );
  const bodyMotion = Animated.loop(
    Animated.sequence([
      Animated.timing(bob, {
        duration: bobHalfStep,
        easing: Easing.inOut(Easing.quad),
        toValue: -2.4,
        useNativeDriver: true,
      }),
      Animated.timing(bob, {
        duration: bobHalfStep,
        easing: Easing.inOut(Easing.quad),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]),
    { iterations: bobIterations },
  );

  return Animated.parallel([movement, bodyMotion], { stopTogether: false });
}

function setPosition(
  value: Animated.ValueXY,
  point: NormalizedPoint,
  sceneSize: SceneSize,
) {
  value.setValue(
    normalizedPointToPixels(point, sceneSize.width, sceneSize.height),
  );
}

export function useHandoffBehavior({
  onComplete,
  replayToken,
  sceneSize,
}: UseHandoffBehaviorOptions) {
  const [phase, setPhase] = useState<HandoffPhase>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const strategyPosition = useRef(new Animated.ValueXY()).current;
  const reviewerPosition = useRef(new Animated.ValueXY()).current;
  const strategyBob = useRef(new Animated.Value(0)).current;
  const reviewerBob = useRef(new Animated.Value(0)).current;
  const activeAnimation = useRef<BehaviorAnimation | undefined>(undefined);
  const completionCallback = useRef(onComplete);
  const lastReplayToken = useRef<number | undefined>(undefined);
  const runId = useRef(0);

  useEffect(() => {
    completionCallback.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) {
        setReduceMotion(enabled);
      }
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

  const play = useCallback((animation: BehaviorAnimation) => {
    return new Promise<boolean>(resolve => {
      activeAnimation.current = animation;
      animation.start(({ finished }) => resolve(finished));
    });
  }, []);

  const resetToHome = useCallback(() => {
    setPosition(strategyPosition, OFFICE_ANCHORS.strategySeat, sceneSize);
    setPosition(reviewerPosition, OFFICE_ANCHORS.reviewerSeat, sceneSize);
    strategyBob.setValue(0);
    reviewerBob.setValue(0);
  }, [reviewerBob, reviewerPosition, sceneSize, strategyBob, strategyPosition]);

  const runBehavior = useCallback(async () => {
    assertActorsDoNotOverlap(
      'handoff stance',
      OFFICE_ANCHORS.strategyMeet,
      OFFICE_ANCHORS.reviewerMeet,
    );
    activeAnimation.current?.stop();
    const currentRunId = runId.current + 1;
    runId.current = currentRunId;
    resetToHome();
    setPhase('idle');
    setIsRunning(true);
    let completed = false;

    try {
      if (reduceMotion) {
        setPosition(strategyPosition, OFFICE_ANCHORS.strategyMeet, sceneSize);
        setPosition(reviewerPosition, OFFICE_ANCHORS.reviewerMeet, sceneSize);
        setPhase('conversation');
        if (!(await play(Animated.delay(240)))) return;
        setPhase('handoff');
        if (!(await play(Animated.delay(240)))) return;
        resetToHome();
        setPhase('reviewing');
        completed = true;
        return;
      }

      if (!(await play(Animated.delay(HANDOFF_TIMING.idle)))) return;
      setPosition(strategyPosition, OFFICE_ANCHORS.strategyEgress, sceneSize);
      setPhase('strategyStanding');
      if (!(await play(Animated.delay(HANDOFF_TIMING.strategyStand)))) return;

      setPhase('strategyWalking');
      if (
        !(await play(
          createPathAnimation(
            strategyPosition,
            strategyBob,
            STRATEGY_OUTBOUND_PATH,
            sceneSize,
            HANDOFF_TIMING.outboundWalk,
          ),
        ))
      )
        return;

      setPhase('reviewerStanding');
      setPosition(reviewerPosition, OFFICE_ANCHORS.reviewerEgress, sceneSize);
      if (
        !(await play(
          createPathAnimation(
            reviewerPosition,
            reviewerBob,
            REVIEWER_APPROACH_PATH,
            sceneSize,
            HANDOFF_TIMING.reviewerApproach,
          ),
        ))
      )
        return;

      setPhase('conversation');
      if (!(await play(Animated.delay(HANDOFF_TIMING.conversation)))) return;

      setPhase('handoff');
      if (!(await play(Animated.delay(HANDOFF_TIMING.handoff)))) return;

      setPhase('returning');
      if (
        !(await play(
          Animated.parallel([
            createPathAnimation(
              strategyPosition,
              strategyBob,
              STRATEGY_RETURN_PATH,
              sceneSize,
              HANDOFF_TIMING.returnWalk,
            ),
            createPathAnimation(
              reviewerPosition,
              reviewerBob,
              REVIEWER_RETURN_PATH,
              sceneSize,
              HANDOFF_TIMING.returnWalk,
            ),
          ]),
        ))
      )
        return;

      resetToHome();
      setPhase('reviewing');
      completed = true;
    } finally {
      if (runId.current === currentRunId) {
        setIsRunning(false);
        if (completed) {
          completionCallback.current();
        }
      }
    }
  }, [
    play,
    reduceMotion,
    resetToHome,
    reviewerBob,
    reviewerPosition,
    sceneSize,
    strategyBob,
    strategyPosition,
  ]);

  useEffect(() => {
    if (
      sceneSize.height <= 0 ||
      sceneSize.width <= 0 ||
      lastReplayToken.current === replayToken
    ) {
      return;
    }

    lastReplayToken.current = replayToken;
    runBehavior();
  }, [replayToken, runBehavior, sceneSize.height, sceneSize.width]);

  useEffect(() => {
    return () => {
      runId.current += 1;
      activeAnimation.current?.stop();
    };
  }, []);

  return {
    frame: HANDOFF_FRAMES[phase],
    isRunning,
    phase,
    reviewerBob,
    reviewerPosition,
    strategyBob,
    strategyPosition,
  };
}
