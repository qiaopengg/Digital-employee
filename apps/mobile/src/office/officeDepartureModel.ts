import type { EmployeeId } from './employeeProfiles';
import { OFFICE_ANCHORS, type NormalizedPoint } from './officePhysicsModel';

export type DeparturePhase = 'atDesk' | 'leaving' | 'departed';

export type DepartureRoute = Readonly<{
  exitPath: ReadonlyArray<NormalizedPoint>;
  home: NormalizedPoint;
  stand: NormalizedPoint;
}>;

const CENTRAL_CORRIDOR_X = 0.54;
const CORRIDOR_EXIT_Y = 0.89;

function buildExitPath(stand: NormalizedPoint): ReadonlyArray<NormalizedPoint> {
  return [
    stand,
    { x: CENTRAL_CORRIDOR_X, y: stand.y },
    { x: CENTRAL_CORRIDOR_X, y: CORRIDOR_EXIT_Y },
    OFFICE_ANCHORS.officeExit,
  ];
}

export const DEPARTURE_ROUTES: Record<EmployeeId, DepartureRoute> = {
  strategy: {
    exitPath: buildExitPath(OFFICE_ANCHORS.strategyStand),
    home: OFFICE_ANCHORS.strategySeat,
    stand: OFFICE_ANCHORS.strategyStand,
  },
  reviewer: {
    exitPath: buildExitPath(OFFICE_ANCHORS.reviewerStand),
    home: OFFICE_ANCHORS.reviewerSeat,
    stand: OFFICE_ANCHORS.reviewerStand,
  },
  secretary: {
    exitPath: buildExitPath(OFFICE_ANCHORS.secretaryStand),
    home: OFFICE_ANCHORS.secretarySeat,
    stand: OFFICE_ANCHORS.secretaryStand,
  },
  break: {
    exitPath: buildExitPath(OFFICE_ANCHORS.contentStand),
    home: OFFICE_ANCHORS.contentSeat,
    stand: OFFICE_ANCHORS.contentStand,
  },
};

export const DEPARTURE_TIMING = {
  leaveSeat: 260,
  outbound: 1700,
} as const;
