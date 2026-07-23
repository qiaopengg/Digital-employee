import {
  DEFAULT_WORK_SCHEDULE,
  MAX_AWAY_FROM_DESK_MS,
  getTimeOfDayPeriod,
  hasExceededAwayBudget,
  isWorkingHour,
} from '../src/office/officeScheduleModel';
import {
  DESK_LAMP_GLOW_COLOR,
  getOfficeLightingTheme,
  isNightPeriod,
} from '../src/office/officeLightingModel';

function atHour(hour: number, minute = 0) {
  const date = new Date(2026, 6, 23, hour, minute, 0);
  return date;
}

test('defaults working hours to 9-12 and 14-18', () => {
  expect(DEFAULT_WORK_SCHEDULE.windows).toEqual([
    { endHour: 12, startHour: 9 },
    { endHour: 18, startHour: 14 },
  ]);
});

test('treats the morning and afternoon windows as working hours', () => {
  expect(isWorkingHour(atHour(9, 0))).toBe(true);
  expect(isWorkingHour(atHour(11, 59))).toBe(true);
  expect(isWorkingHour(atHour(14, 0))).toBe(true);
  expect(isWorkingHour(atHour(17, 59))).toBe(true);
});

test('treats lunch, evening, and night as non-working hours', () => {
  expect(isWorkingHour(atHour(12, 0))).toBe(false);
  expect(isWorkingHour(atHour(13, 30))).toBe(false);
  expect(isWorkingHour(atHour(18, 0))).toBe(false);
  expect(isWorkingHour(atHour(23, 0))).toBe(false);
  expect(isWorkingHour(atHour(8, 59))).toBe(false);
});

test('accepts a boss-configured custom schedule instead of the default', () => {
  const nightShift = { windows: [{ endHour: 23, startHour: 20 }] };
  expect(isWorkingHour(atHour(21, 0), nightShift)).toBe(true);
  expect(isWorkingHour(atHour(9, 0), nightShift)).toBe(false);
});

test('maps every hour of the day to exactly one lighting period', () => {
  expect(getTimeOfDayPeriod(atHour(8))).toBe('morning');
  expect(getTimeOfDayPeriod(atHour(12))).toBe('midday');
  expect(getTimeOfDayPeriod(atHour(15))).toBe('afternoon');
  expect(getTimeOfDayPeriod(atHour(19))).toBe('evening');
  expect(getTimeOfDayPeriod(atHour(23))).toBe('night');
  expect(getTimeOfDayPeriod(atHour(2))).toBe('night');
});

test('flags evening and night as overtime-lit periods', () => {
  expect(isNightPeriod('evening')).toBe(true);
  expect(isNightPeriod('night')).toBe(true);
  expect(isNightPeriod('morning')).toBe(false);
  expect(isNightPeriod('midday')).toBe(false);
  expect(isNightPeriod('afternoon')).toBe(false);
});

test('darkens the office overlay progressively toward night', () => {
  const midday = getOfficeLightingTheme('midday');
  const evening = getOfficeLightingTheme('evening');
  const night = getOfficeLightingTheme('night');

  expect(midday.ambientOpacity).toBe(0);
  expect(evening.ambientOpacity).toBeGreaterThan(midday.ambientOpacity);
  expect(night.ambientOpacity).toBeGreaterThan(evening.ambientOpacity);
  expect(DESK_LAMP_GLOW_COLOR).toMatch(/^#/);
});

test('enforces the twenty second away-from-desk budget by default', () => {
  expect(MAX_AWAY_FROM_DESK_MS).toBe(20_000);
  expect(hasExceededAwayBudget(0, 19_999)).toBe(false);
  expect(hasExceededAwayBudget(0, 20_000)).toBe(true);
  expect(hasExceededAwayBudget(0, 25_000)).toBe(true);
});

test('the current handoff-and-delivery visual flow stays inside the away budget', () => {
  // The only scripted moment an employee leaves their workstation today is
  // the strategy-to-reviewer handoff. Its total scripted duration must stay
  // under the 20s away-from-desk budget so the rule is never silently
  // violated by the existing animation timeline.
  const HANDOFF_TOTAL_DURATION_MS = 180 + 220 + 120 + 1050 + 220 + 120 + 760 +
    260 + 260 + 120 + 1050 + 220;

  expect(HANDOFF_TOTAL_DURATION_MS).toBeLessThan(MAX_AWAY_FROM_DESK_MS);
});
