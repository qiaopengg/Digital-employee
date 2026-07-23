import type { OfficeFacing } from './officePhysicsModel';

export type AnimatedEmployeeId = 'strategy' | 'reviewer';

export type EmployeePose =
  | 'seatedIdle'
  | 'seatedReviewing'
  | 'risingEmpty'
  | 'risingWithFolder'
  | 'standingEmpty'
  | 'standingWithFolder'
  | 'walkWithFolder'
  | 'walkEmpty'
  | 'handoff';

export type EmployeeActivity = 'working' | 'moving' | 'handoff' | 'reviewing';

export type Facing = OfficeFacing;

export type HandoffPhase =
  | 'idle'
  | 'strategyStanding'
  | 'strategyTurning'
  | 'strategyWalking'
  | 'reviewerStanding'
  | 'reviewerTurning'
  | 'conversation'
  | 'handoff'
  | 'reviewerSeating'
  | 'strategyTurningHome'
  | 'strategyReturning'
  | 'strategySeating'
  | 'reviewing';

export type DocumentOwner = 'strategy' | 'transfer' | 'reviewer';

export type ActorFrame = Readonly<{
  activity: EmployeeActivity;
  facing: Facing;
  pose: EmployeePose;
  status: string;
}>;

export type HandoffFrame = Readonly<{
  bubble?: string;
  documentOwner: DocumentOwner;
  reviewer: ActorFrame;
  strategy: ActorFrame;
}>;

export const HANDOFF_TIMING = {
  conversation: 760,
  handoff: 260,
  idle: 180,
  outboundWalk: 1050,
  reviewerSeating: 260,
  reviewerStand: 220,
  reviewerTurn: 120,
  returnWalk: 1050,
  strategySeating: 220,
  strategyStand: 220,
  strategyTurn: 120,
  strategyTurnHome: 120,
} as const;

export const HANDOFF_TOTAL_DURATION = Object.values(HANDOFF_TIMING).reduce(
  (total, duration) => total + duration,
  0,
);

export const HANDOFF_FRAMES: Record<HandoffPhase, HandoffFrame> = {
  idle: {
    documentOwner: 'strategy',
    strategy: {
      activity: 'working',
      facing: 'north',
      pose: 'seatedIdle',
      status: '在工位整理交接资料',
    },
    reviewer: {
      activity: 'working',
      facing: 'north',
      pose: 'seatedIdle',
      status: '在工位处理审核队列',
    },
  },
  strategyStanding: {
    documentOwner: 'strategy',
    strategy: {
      activity: 'moving',
      facing: 'north',
      pose: 'risingWithFolder',
      status: '离椅起身并携带资料',
    },
    reviewer: {
      activity: 'working',
      facing: 'north',
      pose: 'seatedIdle',
      status: '在工位处理审核队列',
    },
  },
  strategyTurning: {
    documentOwner: 'strategy',
    strategy: {
      activity: 'moving',
      facing: 'south',
      pose: 'standingWithFolder',
      status: '站稳后转向主通道',
    },
    reviewer: {
      activity: 'working',
      facing: 'north',
      pose: 'seatedIdle',
      status: '在工位处理审核队列',
    },
  },
  strategyWalking: {
    documentOwner: 'strategy',
    strategy: {
      activity: 'moving',
      facing: 'south',
      pose: 'walkWithFolder',
      status: '沿通道前往审核人工位',
    },
    reviewer: {
      activity: 'working',
      facing: 'north',
      pose: 'seatedIdle',
      status: '在工位处理审核队列',
    },
  },
  reviewerStanding: {
    documentOwner: 'strategy',
    strategy: {
      activity: 'handoff',
      facing: 'west',
      pose: 'standingWithFolder',
      status: '已到达审核人工位旁',
    },
    reviewer: {
      activity: 'moving',
      facing: 'north',
      pose: 'risingEmpty',
      status: '离椅起身准备接收',
    },
  },
  reviewerTurning: {
    documentOwner: 'strategy',
    strategy: {
      activity: 'handoff',
      facing: 'west',
      pose: 'standingWithFolder',
      status: '等待审核人确认',
    },
    reviewer: {
      activity: 'handoff',
      facing: 'east',
      pose: 'standingEmpty',
      status: '站稳后转向提交人',
    },
  },
  conversation: {
    bubble: '林策：结构和风险项已标注，请重点复核。',
    documentOwner: 'strategy',
    strategy: {
      activity: 'handoff',
      facing: 'west',
      pose: 'handoff',
      status: '说明交接重点',
    },
    reviewer: {
      activity: 'handoff',
      facing: 'east',
      pose: 'handoff',
      status: '确认审核要求',
    },
  },
  handoff: {
    bubble: '顾宁：收到，我先核对事实，再检查表达。',
    documentOwner: 'transfer',
    strategy: {
      activity: 'handoff',
      facing: 'west',
      pose: 'handoff',
      status: '交出资料',
    },
    reviewer: {
      activity: 'handoff',
      facing: 'east',
      pose: 'handoff',
      status: '接收资料',
    },
  },
  reviewerSeating: {
    documentOwner: 'reviewer',
    strategy: {
      activity: 'handoff',
      facing: 'west',
      pose: 'standingEmpty',
      status: '确认交接完成',
    },
    reviewer: {
      activity: 'reviewing',
      facing: 'north',
      pose: 'risingWithFolder',
      status: '携资料回到座位',
    },
  },
  strategyTurningHome: {
    documentOwner: 'reviewer',
    strategy: {
      activity: 'moving',
      facing: 'south',
      pose: 'standingEmpty',
      status: '转身准备返回工位',
    },
    reviewer: {
      activity: 'reviewing',
      facing: 'north',
      pose: 'seatedReviewing',
      status: '在工位开始审核',
    },
  },
  strategyReturning: {
    documentOwner: 'reviewer',
    strategy: {
      activity: 'moving',
      facing: 'south',
      pose: 'walkEmpty',
      status: '沿通道正向返回工位',
    },
    reviewer: {
      activity: 'reviewing',
      facing: 'north',
      pose: 'seatedReviewing',
      status: '在工位审核资料',
    },
  },
  strategySeating: {
    documentOwner: 'reviewer',
    strategy: {
      activity: 'working',
      facing: 'north',
      pose: 'risingEmpty',
      status: '回到椅前并面向电脑入座',
    },
    reviewer: {
      activity: 'reviewing',
      facing: 'north',
      pose: 'seatedReviewing',
      status: '在工位审核资料',
    },
  },
  reviewing: {
    documentOwner: 'reviewer',
    strategy: {
      activity: 'working',
      facing: 'north',
      pose: 'seatedIdle',
      status: '在工位继续处理后续工作',
    },
    reviewer: {
      activity: 'reviewing',
      facing: 'north',
      pose: 'seatedReviewing',
      status: '在工位审核资料',
    },
  },
};
