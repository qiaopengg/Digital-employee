export type DeliveryPhase =
  | 'idle'
  | 'reviewerHandoff'
  | 'secretaryHandoff'
  | 'deskReady';

export const DELIVERY_TIMING = {
  reviewerHandoff: 900,
  secretaryHandoff: 900,
} as const;

export const DELIVERY_BUBBLES: Readonly<
  Record<'reviewerHandoff' | 'secretaryHandoff', string>
> = {
  reviewerHandoff: '顾宁：审核已完成，交给小岚安排汇报。',
  secretaryHandoff: '小岚：已放到老板桌上，请查看正式结果。',
};
