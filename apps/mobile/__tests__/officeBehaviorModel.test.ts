import {
  HANDOFF_FRAMES,
  HANDOFF_TIMING,
  HANDOFF_TOTAL_DURATION,
} from '../src/office/officeBehaviorModel';
import {
  getMovementFacing,
  getStrideCount,
} from '../src/office/officeMotionModel';
import {
  OFFICE_ANCHORS,
  OFFICE_SEAT_CONSTRAINTS,
  STRATEGY_OUTBOUND_PATH,
  STRATEGY_RETURN_PATH,
  assertActorsDoNotOverlap,
  getPathSegmentDurations,
  getPathCollisions,
  normalizedPointToPixels,
} from '../src/office/officePhysicsModel';
import {
  EMPLOYEE_WORLD_ASPECT_RATIO,
  EMPLOYEE_WORLD_WIDTH_RATIO,
  OFFICE_SEAT_RIGS,
  isSeatBoundPose,
} from '../src/office/officeSeatModel';

test('keeps document ownership consistent across the handoff', () => {
  expect(HANDOFF_FRAMES.strategyWalking.documentOwner).toBe('strategy');
  expect(HANDOFF_FRAMES.strategyWalking.strategy.pose).toBe('walkWithFolder');
  expect(HANDOFF_FRAMES.handoff.documentOwner).toBe('transfer');
  expect(HANDOFF_FRAMES.reviewerSeating.documentOwner).toBe('reviewer');
  expect(HANDOFF_FRAMES.strategyReturning.strategy.pose).toBe('walkEmpty');
  expect(HANDOFF_FRAMES.strategyReturning.reviewer.pose).toBe(
    'seatedReviewing',
  );
  expect(HANDOFF_FRAMES.reviewing.reviewer.pose).toBe('seatedReviewing');
});

test('walks to the reviewer workstation and faces every return segment', () => {
  expect(STRATEGY_OUTBOUND_PATH[0]).toBe(OFFICE_ANCHORS.strategyStand);
  expect(STRATEGY_OUTBOUND_PATH.at(-1)).toBe(OFFICE_ANCHORS.reviewerVisitor);
  expect(OFFICE_ANCHORS.strategyStand.y).toBeGreaterThan(
    OFFICE_ANCHORS.strategySeat.y,
  );
  expect(OFFICE_ANCHORS.reviewerStand.y).toBeGreaterThan(
    OFFICE_ANCHORS.reviewerSeat.y,
  );
  expect(
    STRATEGY_RETURN_PATH.slice(1).map((point, index) =>
      getMovementFacing(STRATEGY_RETURN_PATH[index], point),
    ),
  ).toEqual(['south', 'west', 'north']);
  expect(HANDOFF_FRAMES.strategyTurningHome.strategy.facing).toBe('south');
  expect(HANDOFF_FRAMES.strategySeating.strategy.facing).toBe('north');
});

test('uses a layered seat transition before either employee enters a route', () => {
  expect(HANDOFF_FRAMES.strategyStanding.strategy.pose).toBe(
    'risingWithFolder',
  );
  expect(HANDOFF_FRAMES.reviewerStanding.reviewer.pose).toBe('risingEmpty');
  expect(HANDOFF_FRAMES.strategySeating.strategy.pose).toBe('risingEmpty');
  expect(HANDOFF_FRAMES.reviewerSeating.reviewer.pose).toBe('risingWithFolder');
  expect(isSeatBoundPose('risingWithFolder')).toBe(true);
  expect(OFFICE_SEAT_RIGS.strategy.facing).toBe('north');
});

test('keeps one world scale across seated, rising, and walking sprites', () => {
  expect(EMPLOYEE_WORLD_WIDTH_RATIO).toBe(0.105);
  expect(EMPLOYEE_WORLD_ASPECT_RATIO).toBe(1.5);
});

test('shows dialogue only during a real work exchange', () => {
  const phasesWithDialogue = Object.entries(HANDOFF_FRAMES)
    .filter(([, frame]) => frame.bubble)
    .map(([phase]) => phase);

  expect(phasesWithDialogue).toEqual(['conversation', 'handoff']);
});

test('derives cardinal facing from path geometry', () => {
  expect(getMovementFacing({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe('east');
  expect(getMovementFacing({ x: 1, y: 0 }, { x: 0, y: 0 })).toBe('west');
  expect(getMovementFacing({ x: 0, y: 1 }, { x: 0, y: 0 })).toBe('north');
  expect(getMovementFacing({ x: 0, y: 0 }, { x: 0, y: 1 })).toBe('south');
});

test('ties visible foot alternation to movement duration', () => {
  expect(getStrideCount(120)).toBe(1);
  expect(getStrideCount(520)).toBe(2);
  expect(getStrideCount(1040)).toBe(4);
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
  [STRATEGY_OUTBOUND_PATH, STRATEGY_RETURN_PATH].forEach(path =>
    expect(getPathCollisions(path)).toEqual([]),
  );
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
