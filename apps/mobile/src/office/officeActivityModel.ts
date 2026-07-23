import type { EmployeeId } from './employeeProfiles';
import type { NormalizedPoint } from './officePhysicsModel';

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
    home: { x: 0.185, y: 0.24 },
    stand: { x: 0.185, y: 0.262 },
    destinations: [{ x: 0.52, y: 0.262 }, { x: 0.56, y: 0.262 }],
  },
  reviewer: {
    home: { x: 0.375, y: 0.24 },
    stand: { x: 0.375, y: 0.262 },
    destinations: [{ x: 0.52, y: 0.262 }, { x: 0.56, y: 0.262 }],
  },
  secretary: {
    home: { x: 0.145, y: 0.745 },
    stand: { x: 0.385, y: 0.79 },
    destinations: [{ x: 0.49, y: 0.79 }, { x: 0.55, y: 0.79 }],
  },
  break: {
    home: { x: 0.17, y: 0.39 },
    stand: { x: 0.17, y: 0.412 },
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
