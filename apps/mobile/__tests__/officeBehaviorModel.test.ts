import {
  HANDOFF_FRAMES,
  HANDOFF_TIMING,
  HANDOFF_TOTAL_DURATION,
} from '../src/office/officeBehaviorModel';
import {
  OFFICE_SEAT_CONSTRAINTS,
  REVIEWER_APPROACH_PATH,
  REVIEWER_RETURN_PATH,
  STRATEGY_OUTBOUND_PATH,
  STRATEGY_RETURN_PATH,
  assertActorsDoNotOverlap,
  getPathSegmentDurations,
  getPathCollisions,
  normalizedPointToPixels,
} from '../src/office/officePhysicsModel';

test('keeps document ownership consistent across the handoff', () => {
  expect(HANDOFF_FRAMES.strategyWalking.strategy.pose).toBe('walkWithFolder');
  expect(HANDOFF_FRAMES.returning.strategy.pose).toBe('walkEmpty');
  expect(HANDOFF_FRAMES.returning.reviewer.pose).toBe('walkWithFolder');
  expect(HANDOFF_FRAMES.reviewing.reviewer.pose).toBe('seatedReviewing');
});

test('allocates walking time by path distance', () => {
  const durations = getPathSegmentDurations(
    STRATEGY_OUTBOUND_PATH,
    HANDOFF_TIMING.outboundWalk,
  );

  expect(durations).toHaveLength(STRATEGY_OUTBOUND_PATH.length - 1);
  expect(durations.reduce((sum, duration) => sum + duration, 0)).toBeCloseTo(
    HANDOFF_TIMING.outboundWalk,
    -1,
  );
  expect(durations.every(duration => duration > 0)).toBe(true);
});

test('finishes the visible flow inside the five-second product limit', () => {
  expect(HANDOFF_TOTAL_DURATION).toBeLessThanOrEqual(5000);
  expect(HANDOFF_TOTAL_DURATION).toBeGreaterThanOrEqual(3500);
});

test('keeps every employee route outside furniture collision bodies', () => {
  [
    STRATEGY_OUTBOUND_PATH,
    STRATEGY_RETURN_PATH,
    REVIEWER_APPROACH_PATH,
    REVIEWER_RETURN_PATH,
  ].forEach(path => expect(getPathCollisions(path)).toEqual([]));
});

test('rejects a route that crosses the strategy workstation', () => {
  expect(
    getPathCollisions([
      { x: 0.1, y: 0.5 },
      { x: 0.5, y: 0.5 },
    ]),
  ).toContain('workstation-strategy');
});

test('rejects two employees occupying the same physical point', () => {
  expect(() =>
    assertActorsDoNotOverlap(
      'test stance',
      { x: 0.5, y: 0.5 },
      { x: 0.51, y: 0.5 },
    ),
  ).toThrow('overlaps actors');
});

test('binds working and resting poses to furniture-facing constraints', () => {
  expect(OFFICE_SEAT_CONSTRAINTS.strategyWorkstation).toMatchObject({
    facing: 'north',
    interaction: 'computer',
  });
  expect(OFFICE_SEAT_CONSTRAINTS.reviewerWorkstation).toMatchObject({
    facing: 'north',
    interaction: 'computer',
  });
  expect(OFFICE_SEAT_CONSTRAINTS.sofaLeft).toMatchObject({
    facing: 'east',
    interaction: 'rest',
  });
});

test('maps semantic scene points to the rendered office size', () => {
  expect(normalizedPointToPixels({ x: 0.2, y: 0.4 }, 390, 600)).toEqual({
    x: 78,
    y: 240,
  });
});
