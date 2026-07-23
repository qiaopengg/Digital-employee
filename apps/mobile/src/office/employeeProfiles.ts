import type { ImageSourcePropType } from 'react-native';

export type EmployeeId = 'strategy' | 'reviewer' | 'secretary' | 'break';

export type EmployeeSkill = Readonly<{
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
}>;

export type EmployeeProfile = Readonly<{
  collaborationStyle: string;
  detail: string;
  id: EmployeeId;
  image: ImageSourcePropType;
  name: string;
  personality: string;
  role: string;
  skills: ReadonlyArray<EmployeeSkill>;
  status: string;
  systemRole:
    | 'task_intake'
    | 'work_planning'
    | 'quality_review'
    | 'content_delivery';
  traits: ReadonlyArray<string>;
}>;

export const officeEmployees: ReadonlyArray<EmployeeProfile> = [
  {
    id: 'strategy',
    name: '林策',
    role: '需求与策略负责人',
    status: '正在交接',
    detail: '把用户目标拆成可执行结构，并组织统一成果。',
    personality: '理性、主动、偏结构化；遇到信息缺口会先确认边界。',
    collaborationStyle: '先给结论框架，再交给审核经理检查事实与风险。',
    systemRole: 'work_planning',
    traits: ['逻辑 92', '创意 78', '沟通 84', '稳定 88'],
    skills: [
      { name: '需求理解', level: 5 },
      { name: '方案规划', level: 5 },
      { name: '结构化写作', level: 4 },
    ],
    image: require('../assets/office/employee-strategy.png'),
  },
  {
    id: 'reviewer',
    name: '顾宁',
    role: '质量与审核经理',
    status: '等待接收',
    detail: '负责事实一致性、风险、表达和交付完整性复核。',
    personality: '谨慎、直接、证据优先；不会为了好听而掩盖限制。',
    collaborationStyle: '接收统一成果后完成复核，只汇报真实发现。',
    systemRole: 'quality_review',
    traits: ['严谨 96', '风险 94', '表达 86', '稳定 91'],
    skills: [
      { name: '事实核验', level: 5 },
      { name: '风险审查', level: 5 },
      { name: '文字优化', level: 4 },
    ],
    image: require('../assets/office/employee-reviewer.png'),
  },
  {
    id: 'secretary',
    name: '小岚',
    role: '老板秘书',
    status: '始终在岗',
    detail: '负责接单、进度归纳、岗位代管和最终汇报入口。',
    personality: '可靠、克制、响应迅速；永不离职且不进入请假状态。',
    collaborationStyle: '先确认老板目标，再派给最合适的员工并汇总进度。',
    systemRole: 'task_intake',
    traits: ['响应 98', '协调 95', '保密 96', '稳定 100'],
    skills: [
      { name: '任务分派', level: 5 },
      { name: '进度汇总', level: 5 },
      { name: '老板汇报', level: 5 },
    ],
    image: require('../assets/office/employee-secretary.png'),
  },
  {
    id: 'break',
    name: '沈言',
    role: '内容执行专员',
    status: '短暂休息',
    detail: '负责长文起草、资料整理和面向读者的内容表达。',
    personality: '细腻、有同理心、重视可读性；长任务后会短暂恢复精力。',
    collaborationStyle: '根据策略框架完成内容，再提交审核经理复核。',
    systemRole: 'content_delivery',
    traits: ['写作 93', '同理 90', '创意 87', '稳定 82'],
    skills: [
      { name: '内容写作', level: 5 },
      { name: '资料整理', level: 4 },
      { name: '读者表达', level: 5 },
    ],
    image: require('../assets/office/employee-break-sofa-rig-v2.png'),
  },
];

export const DEFAULT_TASK_TEAM: ReadonlyArray<EmployeeId> = [
  'secretary',
  'strategy',
  'reviewer',
  'secretary',
];

export function getOfficeEmployee(employeeId: EmployeeId) {
  const employee = officeEmployees.find(item => item.id === employeeId);

  if (!employee) {
    throw new Error(`Unknown office employee: ${employeeId}`);
  }

  return employee;
}
