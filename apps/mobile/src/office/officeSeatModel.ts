import type { EmployeePose } from './officeBehaviorModel';
import type { OfficeAnchorId, OfficeFacing } from './officePhysicsModel';

export const EMPLOYEE_WORLD_WIDTH_RATIO = 0.11;
export const EMPLOYEE_NEAR_FIELD_WIDTH_RATIO = 0.118;
export const EMPLOYEE_WORLD_ASPECT_RATIO = 1.5;
export const OFFICE_SEAT_FOREGROUND_DEPTH = 58;

export const OFFICE_EMPLOYEE_SPRITE_ANCHORS = {
  handoff: { x: 0.5, y: 0.92 },
  risingEmpty: { x: 0.5, y: 0.92 },
  risingWithFolder: { x: 0.5, y: 0.92 },
  seatedIdle: { x: 0.5, y: 0.84 },
  seatedReviewing: { x: 0.5, y: 0.84 },
  standingEmpty: { x: 0.5, y: 0.92 },
  standingWithFolder: { x: 0.5, y: 0.92 },
  walkEmpty: { x: 0.5, y: 0.92 },
  walkWithFolder: { x: 0.5, y: 0.92 },
} as const satisfies Record<EmployeePose, Readonly<{ x: number; y: number }>>;

export type OfficeSeatRig = Readonly<{
  facing: OfficeFacing;
  foregroundAnchorId: OfficeAnchorId;
  foregroundHeightRatio: number;
  foregroundWidthRatio: number;
  seatAnchorId: OfficeAnchorId;
  standAnchorId: OfficeAnchorId;
}>;

export const OFFICE_SEAT_RIGS = {
  strategy: {
    facing: 'north',
    foregroundAnchorId: 'strategySeat',
    foregroundHeightRatio: 1.25,
    foregroundWidthRatio: 0.16,
    seatAnchorId: 'strategySeat',
    standAnchorId: 'strategyStand',
  },
  reviewer: {
    facing: 'north',
    foregroundAnchorId: 'reviewerSeat',
    foregroundHeightRatio: 1.25,
    foregroundWidthRatio: 0.16,
    seatAnchorId: 'reviewerSeat',
    standAnchorId: 'reviewerStand',
  },
} as const satisfies Record<string, OfficeSeatRig>;

export function isSeatBoundPose(pose: EmployeePose) {
  return (
    pose === 'seatedIdle' ||
    pose === 'seatedReviewing' ||
    pose === 'risingEmpty' ||
    pose === 'risingWithFolder'
  );
}
