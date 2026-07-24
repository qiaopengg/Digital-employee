import type {
  AnimatedEmployeeId,
  EmployeePose,
} from './officeBehaviorModel';
import type { OfficeAnchorId, OfficeFacing } from './officePhysicsModel';

export const EMPLOYEE_WORLD_WIDTH_RATIO = 0.11;
export const EMPLOYEE_REVIEWER_WIDTH_RATIO = 0.118;
export const EMPLOYEE_NEAR_FIELD_WIDTH_RATIO = 0.118;
export const EMPLOYEE_WORLD_ASPECT_RATIO = 1.5;
export const OFFICE_SEAT_FOREGROUND_DEPTH = 58;

type SpriteAnchor = Readonly<{ x: number; y: number }>;

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
} as const satisfies Record<EmployeePose, SpriteAnchor>;

export type OfficeEmployeeVisualRig = Readonly<{
  aspectRatio: number;
  poseAnchors: Readonly<Record<EmployeePose, SpriteAnchor>>;
  widthRatio: number;
}>;

export const OFFICE_EMPLOYEE_VISUAL_RIGS: Record<
  AnimatedEmployeeId,
  OfficeEmployeeVisualRig
> = {
  strategy: {
    aspectRatio: EMPLOYEE_WORLD_ASPECT_RATIO,
    poseAnchors: OFFICE_EMPLOYEE_SPRITE_ANCHORS,
    widthRatio: EMPLOYEE_WORLD_WIDTH_RATIO,
  },
  reviewer: {
    aspectRatio: EMPLOYEE_WORLD_ASPECT_RATIO,
    poseAnchors: {
      ...OFFICE_EMPLOYEE_SPRITE_ANCHORS,
      seatedIdle: { x: 0.5, y: 0.88 },
      seatedReviewing: { x: 0.5, y: 0.88 },
    },
    widthRatio: EMPLOYEE_WORLD_WIDTH_RATIO,
  },
};

export function getOfficeEmployeeVisualRig(employeeId: AnimatedEmployeeId) {
  return OFFICE_EMPLOYEE_VISUAL_RIGS[employeeId];
}

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
