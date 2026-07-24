import type { EmployeeId } from './employeeProfiles';
import { OFFICE_ANCHORS, type NormalizedPoint } from './officePhysicsModel';

export type IdleActivityPhase =
  | 'atDesk'
  | 'departing'
  | 'away'
  | 'returning';

export type IdleActivityRoute = Readonly<{
  destinations: ReadonlyArray<NormalizedPoint>;
  home: NormalizedPoint;
  stand: NormalizedPoint;
}>;

export const IDLE_ACTIVITY_ROUTES: Record<EmployeeId, IdleActivityRoute> = {
  strategy: {
    home: OFFICE_ANCHORS.strategySeat,
    stand: OFFICE_ANCHORS.strategyStand,
    destinations: [{ x: 0.52, y: 0.262 }, { x: 0.56, y: 0.262 }],
  },
  reviewer: {
    home: OFFICE_ANCHORS.reviewerSeat,
    stand: OFFICE_ANCHORS.reviewerStand,
    destinations: [{ x: 0.52, y: 0.262 }, { x: 0.56, y: 0.262 }],
  },
  secretary: {
    home: OFFICE_ANCHORS.secretarySeat,
    stand: OFFICE_ANCHORS.secretaryStand,
    destinations: [{ x: 0.49, y: 0.79 }, { x: 0.55, y: 0.79 }],
  },
  break: {
    home: OFFICE_ANCHORS.contentSeat,
    stand: OFFICE_ANCHORS.contentStand,
    destinations: [{ x: 0.52, y: 0.412 }, { x: 0.56, y: 0.412 }],
  },
};

export const IDLE_ACTIVITY_TIMING = {
  leaveSeat: 260,
  outbound: 1050,
  stayMin: 1800,
  stayMax: 3600,
  returnWalk: 1050,
  takeSeat: 260,
  nextActivityMin: 5500,
  nextActivityMax: 10500,
} as const;

export const MAX_SCRIPTED_AWAY_MS =
  IDLE_ACTIVITY_TIMING.leaveSeat +
  IDLE_ACTIVITY_TIMING.outbound +
  IDLE_ACTIVITY_TIMING.stayMax +
  IDLE_ACTIVITY_TIMING.returnWalk +
  IDLE_ACTIVITY_TIMING.takeSeat;

export function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function seedForEmployee(employeeId: EmployeeId) {
  return [...employeeId].reduce((seed, char) => seed * 31 + char.charCodeAt(0), 17);
}
