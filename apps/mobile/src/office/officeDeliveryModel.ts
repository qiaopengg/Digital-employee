import { OFFICE_ANCHORS, type NormalizedPoint } from './officePhysicsModel';

export type DeliveryPhase =
  | 'idle'
  | 'reviewerStanding'
  | 'secretaryStanding'
  | 'reviewerOutbound'
  | 'reviewerHandoff'
  | 'reviewerPlacing'
  | 'reviewerReturning'
  | 'reviewerSeating'
  | 'secretaryOutbound'
  | 'placing'
  | 'secretaryReturning'
  | 'secretarySeating'
  | 'deskReady';

export const DELIVERY_TIMING = {
  placing: 260,
  reviewerHandoff: 320,
  reviewerReturnBoss: 1150,
  reviewerReturnSecretary: 1750,
  reviewerSeat: 220,
  reviewerStand: 220,
  reviewerToBoss: 1150,
  reviewerToSecretary: 1750,
  secretaryOutbound: 1400,
  secretaryReturn: 1400,
  secretarySeat: 220,
  secretaryStand: 220,
} as const;

const CENTRAL_CORRIDOR_X = 0.54;
export const REVIEWER_SECRETARY_HANDOFF: NormalizedPoint = {
  x: OFFICE_ANCHORS.secretaryStand.x + 0.045,
  y: OFFICE_ANCHORS.secretaryStand.y,
};

export const REVIEWER_BOSS_OUTBOUND_PATH: ReadonlyArray<NormalizedPoint> = [
  OFFICE_ANCHORS.reviewerStand,
  { x: CENTRAL_CORRIDOR_X, y: OFFICE_ANCHORS.reviewerStand.y },
  { x: CENTRAL_CORRIDOR_X, y: OFFICE_ANCHORS.bossDeskApproach.y },
  OFFICE_ANCHORS.bossDeskApproach,
];

export const REVIEWER_BOSS_RETURN_PATH: ReadonlyArray<NormalizedPoint> = [
  ...REVIEWER_BOSS_OUTBOUND_PATH,
].reverse();

export const REVIEWER_SECRETARY_OUTBOUND_PATH: ReadonlyArray<NormalizedPoint> =
  [
    OFFICE_ANCHORS.reviewerStand,
    { x: CENTRAL_CORRIDOR_X, y: OFFICE_ANCHORS.reviewerStand.y },
    { x: CENTRAL_CORRIDOR_X, y: OFFICE_ANCHORS.secretaryStand.y },
    REVIEWER_SECRETARY_HANDOFF,
  ];

export const REVIEWER_SECRETARY_RETURN_PATH: ReadonlyArray<NormalizedPoint> = [
  ...REVIEWER_SECRETARY_OUTBOUND_PATH,
].reverse();

export const DELIVERY_READY_DURATION =
  DELIVERY_TIMING.reviewerStand +
  DELIVERY_TIMING.secretaryStand +
  DELIVERY_TIMING.reviewerToSecretary +
  DELIVERY_TIMING.reviewerHandoff +
  DELIVERY_TIMING.reviewerReturnSecretary +
  DELIVERY_TIMING.reviewerSeat +
  DELIVERY_TIMING.secretaryOutbound +
  DELIVERY_TIMING.placing;

export const DELIVERY_BUBBLES: Readonly<
  Partial<Record<DeliveryPhase, string>>
> = {
  reviewerOutbound: '顾宁：终审完成，我来送交。',
  reviewerHandoff: '顾宁：小岚，请转交老板。',
  reviewerPlacing: '顾宁：汇报已送达老板桌。',
  reviewerReturning: '顾宁：结果已就绪，我正在返回工位。',
  secretaryOutbound: '小岚：收到，我现在送到老板桌。',
  placing: '小岚：汇报已放到老板桌上。',
  secretaryReturning: '小岚：结果已就绪，我正在返回前台。',
};
