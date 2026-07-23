import {
  Easing,
  cancelAnimation,
  runOnJS,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import type { Facing } from './officeBehaviorModel';
import { getMovementFacing, getStrideCount } from './officeMotionModel';
import {
  assertPathIsWalkable,
  getPathSegmentDurations,
  normalizedPointToPixels,
  type NormalizedPoint,
} from './officePhysicsModel';

export type SceneSize = Readonly<{ height: number; width: number }>;

export type ActorPosition = Readonly<{
  x: SharedValue<number>;
  y: SharedValue<number>;
}>;

export type ActorMotion = Readonly<{
  bob: SharedValue<number>;
  gait: SharedValue<number>;
  position: ActorPosition;
}>;

type PathActor = Readonly<{
  motion: ActorMotion;
  path: ReadonlyArray<NormalizedPoint>;
  setFacing: (facing: Facing) => void;
}>;

type TurnDelay = (duration: number) => Promise<boolean>;

function animateValue(
  value: SharedValue<number>,
  target: number,
  duration: number,
  easing = Easing.linear,
) {
  return new Promise<boolean>(resolve => {
    value.value = withTiming(target, { duration, easing }, finished => {
      'worklet';
      runOnJS(resolve)(Boolean(finished));
    });
  });
}

export function setActorPosition(
  position: ActorPosition,
  point: NormalizedPoint,
  sceneSize: SceneSize,
) {
  const pixels = normalizedPointToPixels(
    point,
    sceneSize.width,
    sceneSize.height,
  );
  position.x.value = pixels.x;
  position.y.value = pixels.y;
}

export function cancelActorMotion(motion: ActorMotion) {
  cancelAnimation(motion.position.x);
  cancelAnimation(motion.position.y);
  cancelAnimation(motion.gait);
  cancelAnimation(motion.bob);
  motion.gait.value = 0;
  motion.bob.value = 0;
}

export async function animateActorPosition(
  position: ActorPosition,
  target: NormalizedPoint,
  sceneSize: SceneSize,
  duration: number,
) {
  const targetPixels = normalizedPointToPixels(
    target,
    sceneSize.width,
    sceneSize.height,
  );
  const results = await Promise.all([
    animateValue(
      position.x,
      targetPixels.x,
      duration,
      Easing.inOut(Easing.cubic),
    ),
    animateValue(
      position.y,
      targetPixels.y,
      duration,
      Easing.inOut(Easing.cubic),
    ),
  ]);

  return results.every(Boolean);
}

async function animateSegment(
  actor: ActorMotion,
  target: NormalizedPoint,
  sceneSize: SceneSize,
  duration: number,
) {
  const targetPixels = normalizedPointToPixels(
    target,
    sceneSize.width,
    sceneSize.height,
  );
  const strideCount = getStrideCount(duration);
  const halfStride = Math.max(42, Math.floor(duration / strideCount / 2));
  actor.gait.value = 0;
  actor.bob.value = 0;
  actor.gait.value = withRepeat(
    withSequence(
      withTiming(1, {
        duration: halfStride,
        easing: Easing.inOut(Easing.quad),
      }),
      withTiming(0, {
        duration: halfStride,
        easing: Easing.inOut(Easing.quad),
      }),
    ),
    strideCount,
  );
  actor.bob.value = withRepeat(
    withSequence(
      withTiming(-1.1, {
        duration: halfStride,
        easing: Easing.inOut(Easing.quad),
      }),
      withTiming(0, {
        duration: halfStride,
        easing: Easing.inOut(Easing.quad),
      }),
    ),
    strideCount,
  );

  const results = await Promise.all([
    animateValue(actor.position.x, targetPixels.x, duration),
    animateValue(actor.position.y, targetPixels.y, duration),
  ]);
  cancelAnimation(actor.gait);
  cancelAnimation(actor.bob);
  actor.gait.value = 0;
  actor.bob.value = 0;

  return results.every(Boolean);
}

export async function playActorPath(
  actor: PathActor,
  duration: number,
  sceneSize: SceneSize,
  delayTurn: TurnDelay,
) {
  assertPathIsWalkable('employee animation path', actor.path);
  const facings = actor.path
    .slice(1)
    .map((point, index) => getMovementFacing(actor.path[index], point));
  const turnCount = facings.reduce(
    (count, facing, index) =>
      index > 0 && facing !== facings[index - 1] ? count + 1 : count,
    0,
  );
  const turnDuration = 65;
  const durations = getPathSegmentDurations(
    actor.path,
    duration - turnCount * turnDuration,
  );

  for (let index = 1; index < actor.path.length; index += 1) {
    const facing = facings[index - 1];
    const turnsAtCorner = index > 1 && facing !== facings[index - 2];
    actor.setFacing(facing);
    if (turnsAtCorner && !(await delayTurn(turnDuration))) return false;
    if (
      !(await animateSegment(
        actor.motion,
        actor.path[index],
        sceneSize,
        durations[index - 1],
      ))
    ) {
      return false;
    }
  }

  return true;
}
