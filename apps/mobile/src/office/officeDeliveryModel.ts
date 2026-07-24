export type DeliveryPhase =
  | 'idle'
  | 'reviewerHandoff'
  | 'secretaryOutbound'
  | 'placing'
  | 'secretaryReturning'
  | 'deskReady';

export const DELIVERY_TIMING = {
  placing: 260,
  reviewerHandoff: 600,
  secretaryOutbound: 1400,
  secretaryReturn: 1400,
  secretarySeat: 220,
  secretaryStand: 220,
} as const;

export const DELIVERY_READY_DURATION =
  DELIVERY_TIMING.reviewerHandoff +
  DELIVERY_TIMING.secretaryStand +
  DELIVERY_TIMING.secretaryOutbound +
  DELIVERY_TIMING.placing;

export const DELIVERY_BUBBLES: Readonly<
  Partial<Record<DeliveryPhase, string>>
> = {
  reviewerHandoff: '顾宁：审核完成，请小岚送交老板。',
  secretaryOutbound: '小岚：收到，我现在送到老板桌。',
  placing: '小岚：汇报已放到老板桌上。',
  secretaryReturning: '小岚：结果已就绪，我正在返回前台。',
};
