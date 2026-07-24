import type { EmployeeId } from './employeeProfiles';
import { OFFICE_ANCHORS, type NormalizedPoint } from './officePhysicsModel';

export type IdleActivityPhase = 'atDesk' | 'departing' | 'away' | 'returning';

export type IdleActivityRoute = Readonly<{
  destinations: ReadonlyArray<NormalizedPoint>;
  home: NormalizedPoint;
  stand: NormalizedPoint;
}>;

const ROOM_DESTINATIONS: ReadonlyArray<NormalizedPoint> = [
  { x: 0.78, y: 0.43 }, // 会议室内部
  { x: 0.78, y: 0.72 }, // 休息室内部
];

export const IDLE_ACTIVITY_ROUTES: Record<EmployeeId, IdleActivityRoute> = {
  strategy: {
    home: OFFICE_ANCHORS.strategySeat,
    stand: OFFICE_ANCHORS.strategyStand,
    destinations: ROOM_DESTINATIONS,
  },
  reviewer: {
    home: OFFICE_ANCHORS.reviewerSeat,
    stand: OFFICE_ANCHORS.reviewerStand,
    destinations: ROOM_DESTINATIONS,
  },
  secretary: {
    home: OFFICE_ANCHORS.secretarySeat,
    stand: OFFICE_ANCHORS.secretaryStand,
    destinations: ROOM_DESTINATIONS,
  },
  break: {
    home: OFFICE_ANCHORS.contentSeat,
    stand: OFFICE_ANCHORS.contentStand,
    destinations: ROOM_DESTINATIONS,
  },
};

export const IDLE_ACTIVITY_TIMING = {
  leaveSeat: 260,
  outbound: 1400,
  stayMin: 1800,
  stayMax: 3600,
  returnWalk: 1400,
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
  return [...employeeId].reduce(
    (seed, char) => seed * 31 + char.charCodeAt(0),
    17,
  );
}

export function getLocalOfficeDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

/** Select exactly two stable-but-random employees for each local calendar day. */
export function selectDailyActivityEmployees(
  dateKey: string,
  employeeIds: ReadonlyArray<EmployeeId>,
  count = 2,
): ReadonlyArray<EmployeeId> {
  const seed = [...dateKey].reduce(
    (value, char) => value * 31 + char.charCodeAt(0),
    23,
  );
  const random = createSeededRandom(seed);
  const candidates = [...employeeIds];

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [
      candidates[swapIndex],
      candidates[index],
    ];
  }

  return candidates.slice(0, Math.min(count, candidates.length));
}
