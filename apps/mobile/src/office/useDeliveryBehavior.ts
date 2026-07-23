import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import {
  DELIVERY_BUBBLES,
  DELIVERY_TIMING,
  type DeliveryPhase,
} from './officeDeliveryModel';
import {
  animateActorPosition,
  setActorPosition,
  type ActorPosition,
  type SceneSize,
} from './officeMotionAnimation';
import { OFFICE_ANCHORS } from './officePhysicsModel';

type UseDeliveryBehaviorOptions = {
  sceneSize: SceneSize;
  taskKey?: string;
  taskStatus?: 'completed' | 'failed' | 'working';
};

export function useDeliveryBehavior({
  sceneSize,
  taskKey,
  taskStatus,
}: UseDeliveryBehaviorOptions) {
  const [phase, setPhase] = useState<DeliveryPhase>('idle');
  const [reduceMotion, setReduceMotion] = useState(false);
  const iconX = useSharedValue(0);
  const iconY = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const lastTaskKey = useRef<string | undefined>(undefined);
  const deliveredForKey = useRef<string | undefined>(undefined);
  const runId = useRef(0);

  const iconPosition = useMemo<ActorPosition>(
    () => ({ x: iconX, y: iconY }),
    [iconX, iconY],
  );

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

  useEffect(() => {
    if (lastTaskKey.current === taskKey) return;
    lastTaskKey.current = taskKey;
    runId.current += 1;
    setPhase('idle');
    iconOpacity.value = 0;
  }, [iconOpacity, taskKey]);

  const runDelivery = useCallback(async () => {
    const currentRunId = runId.current;

    if (reduceMotion) {
      setActorPosition(iconPosition, OFFICE_ANCHORS.bossDesk, sceneSize);
      iconOpacity.value = 0;
      if (runId.current === currentRunId) setPhase('deskReady');
      return;
    }

    setActorPosition(iconPosition, OFFICE_ANCHORS.reviewerStand, sceneSize);
    iconOpacity.value = 1;
    if (runId.current !== currentRunId) return;
    setPhase('reviewerHandoff');

    const reachedSecretary = await animateActorPosition(
      iconPosition,
      OFFICE_ANCHORS.secretarySeat,
      sceneSize,
      DELIVERY_TIMING.reviewerHandoff,
    );
    if (runId.current !== currentRunId || !reachedSecretary) return;
    setPhase('secretaryHandoff');

    const reachedDesk = await animateActorPosition(
      iconPosition,
      OFFICE_ANCHORS.bossDesk,
      sceneSize,
      DELIVERY_TIMING.secretaryHandoff,
    );
    if (runId.current !== currentRunId || !reachedDesk) return;

    iconOpacity.value = 0;
    setPhase('deskReady');
  }, [iconOpacity, iconPosition, reduceMotion, sceneSize]);

  useEffect(() => {
    if (!taskKey) return;
    if (taskStatus !== 'completed' && taskStatus !== 'failed') return;
    if (deliveredForKey.current === taskKey) return;
    if (sceneSize.width <= 0 || sceneSize.height <= 0) return;

    deliveredForKey.current = taskKey;
    runDelivery();
  }, [runDelivery, sceneSize.height, sceneSize.width, taskKey, taskStatus]);

  const bubble =
    phase === 'reviewerHandoff' || phase === 'secretaryHandoff'
      ? DELIVERY_BUBBLES[phase]
      : undefined;

  return {
    bubble,
    iconOpacity,
    iconPosition,
    phase,
  };
}
