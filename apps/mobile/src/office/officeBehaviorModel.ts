export type AnimatedEmployeeId = 'strategy' | 'reviewer';

export type EmployeePose =
  | 'seatedIdle'
  | 'seatedReviewing'
  | 'walkWithFolder'
  | 'walkEmpty'
  | 'handoff';

export type Facing = 'left' | 'right';

export type HandoffPhase =
  | 'idle'
  | 'strategyStanding'
  | 'strategyWalking'
  | 'reviewerStanding'
  | 'conversation'
  | 'handoff'
  | 'returning'
  | 'reviewing';

export type ActorFrame = Readonly<{
  facing: Facing;
  pose: EmployeePose;
  status: string;
}>;

export type HandoffFrame = Readonly<{
  bubble: string;
  reviewer: ActorFrame;
  strategy: ActorFrame;
}>;

export const HANDOFF_TIMING = {
  conversation: 700,
  handoff: 360,
  idle: 420,
  outboundWalk: 1100,
  reviewerApproach: 420,
  returnWalk: 1100,
  strategyStand: 280,
} as const;

export const HANDOFF_TOTAL_DURATION = Object.values(HANDOFF_TIMING).reduce(
  (total, duration) => total + duration,
  0,
);

export const HANDOFF_FRAMES: Record<HandoffPhase, HandoffFrame> = {
  idle: {
    bubble: '林策正在工位整理结构稿',
    strategy: {
      facing: 'right',
      pose: 'seatedIdle',
      status: '整理交接资料',
    },
    reviewer: {
      facing: 'left',
      pose: 'seatedIdle',
      status: '在工位等待',
    },
  },
  strategyStanding: {
    bubble: '林策：结构稿整理好了，我送过去。',
    strategy: {
      facing: 'right',
      pose: 'walkWithFolder',
      status: '起身取件',
    },
    reviewer: {
      facing: 'left',
      pose: 'seatedIdle',
      status: '在工位等待',
    },
  },
  strategyWalking: {
    bubble: '林策正携带资料前往顾宁工位',
    strategy: {
      facing: 'right',
      pose: 'walkWithFolder',
      status: '前往顾宁工位',
    },
    reviewer: {
      facing: 'left',
      pose: 'seatedIdle',
      status: '在工位等待',
    },
  },
  reviewerStanding: {
    bubble: '顾宁注意到同事，起身准备接收',
    strategy: {
      facing: 'right',
      pose: 'handoff',
      status: '等待确认',
    },
    reviewer: {
      facing: 'left',
      pose: 'walkEmpty',
      status: '起身迎接',
    },
  },
  conversation: {
    bubble: '林策：结构和风险项已标注，请你重点复核。',
    strategy: {
      facing: 'right',
      pose: 'handoff',
      status: '说明重点',
    },
    reviewer: {
      facing: 'left',
      pose: 'handoff',
      status: '确认要求',
    },
  },
  handoff: {
    bubble: '顾宁：收到，我先核对事实，再检查表达。',
    strategy: {
      facing: 'right',
      pose: 'handoff',
      status: '交出资料',
    },
    reviewer: {
      facing: 'left',
      pose: 'handoff',
      status: '接收资料',
    },
  },
  returning: {
    bubble: '交接完成，双方返回各自工位',
    strategy: {
      facing: 'left',
      pose: 'walkEmpty',
      status: '返回工位',
    },
    reviewer: {
      facing: 'right',
      pose: 'walkWithFolder',
      status: '带资料入座',
    },
  },
  reviewing: {
    bubble: '顾宁开始审核，林策继续处理后续工作',
    strategy: {
      facing: 'right',
      pose: 'seatedIdle',
      status: '继续工作',
    },
    reviewer: {
      facing: 'left',
      pose: 'seatedReviewing',
      status: '正在审核',
    },
  },
};
