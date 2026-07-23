import type { Facing } from './officeBehaviorModel';
import type { NormalizedPoint } from './officePhysicsModel';

export function getMovementFacing(
  start: NormalizedPoint,
  end: NormalizedPoint,
): Facing {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX >= 0 ? 'east' : 'west';
  }

  return deltaY >= 0 ? 'south' : 'north';
}

export function getStrideCount(duration: number) {
  return Math.max(1, Math.round(duration / 260));
}
