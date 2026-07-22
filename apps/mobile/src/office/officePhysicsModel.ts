export type NormalizedPoint = Readonly<{
  x: number;
  y: number;
}>;

export type NormalizedRect = Readonly<{
  height: number;
  width: number;
  x: number;
  y: number;
}>;

export type OfficeAnchorId =
  | 'strategySeat'
  | 'strategyEgress'
  | 'strategyMeet'
  | 'reviewerSeat'
  | 'reviewerEgress'
  | 'reviewerMeet'
  | 'secretaryStanding'
  | 'sofaSeat';

export type OfficeFacing = 'east' | 'north' | 'south' | 'west';

export type SeatConstraint = Readonly<{
  anchorId: OfficeAnchorId;
  facing: OfficeFacing;
  interaction: 'computer' | 'rest';
}>;

export type OfficeCollider = Readonly<{
  id: string;
  rect: NormalizedRect;
}>;

export const OFFICE_ANCHORS: Record<OfficeAnchorId, NormalizedPoint> = {
  strategySeat: { x: 0.295, y: 0.515 },
  strategyEgress: { x: 0.295, y: 0.64 },
  strategyMeet: { x: 0.46, y: 0.625 },
  reviewerSeat: { x: 0.665, y: 0.515 },
  reviewerEgress: { x: 0.665, y: 0.64 },
  reviewerMeet: { x: 0.56, y: 0.625 },
  secretaryStanding: { x: 0.84, y: 0.36 },
  sofaSeat: { x: 0.15, y: 0.82 },
};

export const OFFICE_SEAT_CONSTRAINTS = {
  reviewerWorkstation: {
    anchorId: 'reviewerSeat',
    facing: 'north',
    interaction: 'computer',
  },
  sofaLeft: {
    anchorId: 'sofaSeat',
    facing: 'east',
    interaction: 'rest',
  },
  strategyWorkstation: {
    anchorId: 'strategySeat',
    facing: 'north',
    interaction: 'computer',
  },
} as const satisfies Record<string, SeatConstraint>;

export const OFFICE_COLLIDERS: ReadonlyArray<OfficeCollider> = [
  {
    id: 'kitchenette',
    rect: { height: 0.21, width: 0.86, x: 0.06, y: 0 },
  },
  {
    id: 'workstation-top-left',
    rect: { height: 0.17, width: 0.28, x: 0.16, y: 0.235 },
  },
  {
    id: 'workstation-top-right',
    rect: { height: 0.17, width: 0.28, x: 0.56, y: 0.235 },
  },
  {
    id: 'workstation-strategy',
    rect: { height: 0.16, width: 0.28, x: 0.15, y: 0.43 },
  },
  {
    id: 'workstation-reviewer',
    rect: { height: 0.16, width: 0.28, x: 0.56, y: 0.43 },
  },
  {
    id: 'sofa',
    rect: { height: 0.23, width: 0.2, x: 0.02, y: 0.72 },
  },
  {
    id: 'meeting-room',
    rect: { height: 0.31, width: 0.39, x: 0.6, y: 0.67 },
  },
];

export const STRATEGY_OUTBOUND_PATH: ReadonlyArray<NormalizedPoint> = [
  OFFICE_ANCHORS.strategyEgress,
  { x: OFFICE_ANCHORS.strategyEgress.x, y: 0.65 },
  { x: OFFICE_ANCHORS.strategyMeet.x, y: 0.65 },
  OFFICE_ANCHORS.strategyMeet,
];

export const STRATEGY_RETURN_PATH: ReadonlyArray<NormalizedPoint> = [
  ...STRATEGY_OUTBOUND_PATH,
].reverse();

export const REVIEWER_APPROACH_PATH: ReadonlyArray<NormalizedPoint> = [
  OFFICE_ANCHORS.reviewerEgress,
  { x: OFFICE_ANCHORS.reviewerEgress.x, y: 0.65 },
  { x: OFFICE_ANCHORS.reviewerMeet.x, y: 0.65 },
  OFFICE_ANCHORS.reviewerMeet,
];

export const REVIEWER_RETURN_PATH: ReadonlyArray<NormalizedPoint> = [
  ...REVIEWER_APPROACH_PATH,
].reverse();

export const ACTOR_COLLISION_RADIUS = 0.018;

export function normalizedPointToPixels(
  point: NormalizedPoint,
  width: number,
  height: number,
) {
  return {
    x: point.x * width,
    y: point.y * height,
  };
}

export function getAnchoredTopLeft(
  anchor: NormalizedPoint,
  sceneWidth: number,
  sceneHeight: number,
  actorWidth: number,
  actorHeight: number,
  spriteAnchor: NormalizedPoint,
) {
  const anchorPixels = normalizedPointToPixels(anchor, sceneWidth, sceneHeight);

  return {
    left: anchorPixels.x - actorWidth * spriteAnchor.x,
    top: anchorPixels.y - actorHeight * spriteAnchor.y,
  };
}

function expandRect(rect: NormalizedRect, amount: number): NormalizedRect {
  return {
    height: rect.height + amount * 2,
    width: rect.width + amount * 2,
    x: rect.x - amount,
    y: rect.y - amount,
  };
}

function segmentIntersectsRect(
  start: NormalizedPoint,
  end: NormalizedPoint,
  rect: NormalizedRect,
) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const p = [-deltaX, deltaX, -deltaY, deltaY];
  const q = [
    start.x - rect.x,
    rect.x + rect.width - start.x,
    start.y - rect.y,
    rect.y + rect.height - start.y,
  ];
  let entryTime = 0;
  let exitTime = 1;

  for (let index = 0; index < p.length; index += 1) {
    if (p[index] === 0) {
      if (q[index] < 0) return false;
      continue;
    }

    const ratio = q[index] / p[index];
    if (p[index] < 0) {
      entryTime = Math.max(entryTime, ratio);
    } else {
      exitTime = Math.min(exitTime, ratio);
    }

    if (entryTime > exitTime) return false;
  }

  return true;
}

export function getPathCollisions(
  path: ReadonlyArray<NormalizedPoint>,
  colliders: ReadonlyArray<OfficeCollider> = OFFICE_COLLIDERS,
  actorRadius = ACTOR_COLLISION_RADIUS,
) {
  const collisions = new Set<string>();

  for (let pointIndex = 1; pointIndex < path.length; pointIndex += 1) {
    const start = path[pointIndex - 1];
    const end = path[pointIndex];

    colliders.forEach(collider => {
      if (
        segmentIntersectsRect(
          start,
          end,
          expandRect(collider.rect, actorRadius),
        )
      ) {
        collisions.add(collider.id);
      }
    });
  }

  return [...collisions];
}

export function assertPathIsWalkable(
  pathName: string,
  path: ReadonlyArray<NormalizedPoint>,
) {
  if (path.length < 2) {
    throw new Error(`${pathName} requires at least two navigation points`);
  }

  const outOfBoundsPoint = path.find(
    point => point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1,
  );
  if (outOfBoundsPoint) {
    throw new Error(`${pathName} contains an out-of-bounds point`);
  }

  const collisions = getPathCollisions(path);
  if (collisions.length > 0) {
    throw new Error(
      `${pathName} crosses office colliders: ${collisions.join(', ')}`,
    );
  }
}

export function assertActorsDoNotOverlap(
  context: string,
  first: NormalizedPoint,
  second: NormalizedPoint,
  actorRadius = ACTOR_COLLISION_RADIUS,
) {
  const distance = Math.hypot(first.x - second.x, first.y - second.y);
  const minimumDistance = actorRadius * 2;

  if (distance < minimumDistance) {
    throw new Error(
      `${context} overlaps actors: ${distance.toFixed(
        3,
      )} < ${minimumDistance.toFixed(3)}`,
    );
  }
}

export function getPathSegmentDurations(
  path: ReadonlyArray<NormalizedPoint>,
  totalDuration: number,
) {
  const distances = path.slice(1).map((point, index) => {
    const previous = path[index];
    return Math.hypot(point.x - previous.x, point.y - previous.y);
  });
  const totalDistance = distances.reduce((sum, distance) => sum + distance, 0);

  if (totalDistance === 0) {
    return distances.map(() => 0);
  }

  return distances.map(distance =>
    Math.round((distance / totalDistance) * totalDuration),
  );
}
