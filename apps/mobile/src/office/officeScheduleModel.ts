export type WorkingWindow = Readonly<{
  endHour: number;
  startHour: number;
}>;

export type WorkSchedule = Readonly<{
  windows: ReadonlyArray<WorkingWindow>;
}>;

export const DEFAULT_WORK_SCHEDULE: WorkSchedule = {
  windows: [
    { endHour: 12, startHour: 9 },
    { endHour: 18, startHour: 14 },
  ],
};

export type TimeOfDayPeriod =
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'evening'
  | 'night';

/**
 * Away-from-desk grace period. Employees who are not at their workstation
 * during working hours must return within this budget; this is a pure
 * duration constant so the rule can be unit tested without a running clock.
 */
export const MAX_AWAY_FROM_DESK_MS = 20_000;

function isWithinWindow(hour: number, window: WorkingWindow): boolean {
  return hour >= window.startHour && hour < window.endHour;
}

export function isWorkingHour(
  date: Date,
  schedule: WorkSchedule = DEFAULT_WORK_SCHEDULE,
): boolean {
  const hour = date.getHours() + date.getMinutes() / 60;
  return schedule.windows.some(window => isWithinWindow(hour, window));
}

export function getTimeOfDayPeriod(date: Date): TimeOfDayPeriod {
  const hour = date.getHours();

  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 20) return 'evening';
  return 'night';
}

/**
 * True once an actor has been away from their assigned workstation for at
 * least MAX_AWAY_FROM_DESK_MS while inside working hours. Pass the
 * millisecond timestamp the actor left the seat and the current timestamp;
 * both come from the same clock source so this stays deterministic in tests.
 */
export function hasExceededAwayBudget(
  awaySinceMs: number,
  nowMs: number,
  budgetMs: number = MAX_AWAY_FROM_DESK_MS,
): boolean {
  return nowMs - awaySinceMs >= budgetMs;
}
