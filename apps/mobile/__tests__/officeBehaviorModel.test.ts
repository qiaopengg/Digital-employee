import {
  HANDOFF_FRAMES,
  HANDOFF_TIMING,
  HANDOFF_TOTAL_DURATION,
} from '../src/office/officeBehaviorModel';
import {
  OFFICE_FLOW_ORDER,
  OFFICE_FUNCTIONAL_ZONES,
  OFFICE_WORKSTATIONS,
} from '../src/office/officeLayoutModel';
import {
  DEFAULT_TASK_TEAM,
  getOfficeEmployee,
  officeEmployees,
} from '../src/office/officeSceneModel';
import {
  getMovementFacing,
  getStrideCount,
} from '../src/office/officeMotionModel';
import {
  OFFICE_ANCHORS,
  OFFICE_SEAT_CONSTRAINTS,
  HANDOFF_STANCE_RADIUS,
  STRATEGY_OUTBOUND_PATH,
  STRATEGY_RETURN_PATH,
  assertActorsDoNotOverlap,
  getPathSegmentDurations,
  getPathCollisions,
  normalizedPointToPixels,
} from '../src/office/officePhysicsModel';
import {
  EMPLOYEE_NEAR_FIELD_WIDTH_RATIO,
  EMPLOYEE_WORLD_ASPECT_RATIO,
  EMPLOYEE_WORLD_WIDTH_RATIO,
  OFFICE_EMPLOYEE_SPRITE_ANCHORS,
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

test('gives every visible employee a real task role, personality, and skills', () => {
  expect(officeEmployees).toHaveLength(4);
  officeEmployees.forEach(employee => {
    expect(employee.personality.length).toBeGreaterThan(10);
    expect(employee.collaborationStyle.length).toBeGreaterThan(10);
    expect(employee.skills.length).toBeGreaterThanOrEqual(3);
    expect(employee.traits.length).toBeGreaterThanOrEqual(4);
  });
  expect(getOfficeEmployee('secretary').status).toBe('始终在岗');
  expect(DEFAULT_TASK_TEAM).toEqual([
    'secretary',
    'strategy',
    'reviewer',
    'secretary',
  ]);
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
  ).toEqual(['west']);
  expect(STRATEGY_OUTBOUND_PATH).toHaveLength(2);
  expect(
    Math.hypot(
      OFFICE_ANCHORS.reviewerVisitor.x - OFFICE_ANCHORS.strategyStand.x,
      OFFICE_ANCHORS.reviewerVisitor.y - OFFICE_ANCHORS.strategyStand.y,
    ),
  ).toBeCloseTo(0.105, 3);
  expect(
    Math.hypot(
      OFFICE_ANCHORS.reviewerVisitor.x - OFFICE_ANCHORS.reviewerStand.x,
      OFFICE_ANCHORS.reviewerVisitor.y - OFFICE_ANCHORS.reviewerStand.y,
    ),
  ).toBeGreaterThanOrEqual(HANDOFF_STANCE_RADIUS * 2);
  expect(HANDOFF_FRAMES.strategyTurningHome.strategy.facing).toBe('west');
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
  expect(EMPLOYEE_WORLD_WIDTH_RATIO).toBe(0.11);
  expect(EMPLOYEE_NEAR_FIELD_WIDTH_RATIO).toBe(0.118);
  expect(EMPLOYEE_NEAR_FIELD_WIDTH_RATIO).toBeGreaterThan(
    EMPLOYEE_WORLD_WIDTH_RATIO,
  );
  expect(EMPLOYEE_WORLD_ASPECT_RATIO).toBe(1.5);
  expect(OFFICE_EMPLOYEE_SPRITE_ANCHORS.seatedIdle.y).toBe(0.84);
  expect(OFFICE_EMPLOYEE_SPRITE_ANCHORS.seatedReviewing.y).toBe(0.84);
  expect(OFFICE_EMPLOYEE_SPRITE_ANCHORS.walkEmpty.y).toBe(0.92);
});

test('models six equal-purpose workstations as an ordered two-by-three grid', () => {
  expect(OFFICE_WORKSTATIONS).toHaveLength(6);
  expect(
    OFFICE_WORKSTATIONS.map(({ gridColumn, gridRow }) => [
      gridColumn,
      gridRow,
    ]),
  ).toEqual([
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
    [0, 2],
    [1, 2],
  ]);
  expect(
    OFFICE_WORKSTATIONS.filter(workstation => !workstation.occupiedBy),
  ).toHaveLength(4);
  expect(
    OFFICE_WORKSTATIONS[1].seat.x - OFFICE_WORKSTATIONS[0].seat.x,
  ).toBeCloseTo(0.19, 3);
});

test('keeps intake and reporting flows ordered around the main corridor', () => {
  expect(OFFICE_FLOW_ORDER.taskIntake).toEqual([
    'entrance',
    'reception',
    'mainCorridor',
    'openOffice',
  ]);
  expect(OFFICE_FLOW_ORDER.reportToBoss).toEqual([
    'openOffice',
    'mainCorridor',
    'bossOffice',
  ]);
  expect(OFFICE_FUNCTIONAL_ZONES.mainCorridor.x).toBeGreaterThanOrEqual(0.48);
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
      { x: 0.05, y: 0.17 },
      { x: 0.35, y: 0.17 },
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
  expect(OFFICE_SEAT_CONSTRAINTS.secretaryReception).toMatchObject({
    anchorId: 'secretarySeat',
    facing: 'north',
    interaction: 'computer',
  });
  expect(OFFICE_SEAT_CONSTRAINTS.sofaLeft).toMatchObject({
    anchorId: 'sofaSeat',
    facing: 'south',
    interaction: 'rest',
  });
  expect(OFFICE_ANCHORS.secretarySeat).toEqual({ x: 0.145, y: 0.745 });
  expect(OFFICE_ANCHORS.sofaSeat).toEqual({ x: 0.69, y: 0.69 });
});

test('maps semantic scene points to the rendered office size', () => {
  expect(normalizedPointToPixels({ x: 0.2, y: 0.4 }, 390, 600)).toEqual({
    x: 78,
    y: 240,
  });
});
