import type { ImageSourcePropType } from 'react-native';

export type EmployeeId = 'strategy' | 'reviewer' | 'secretary' | 'break';
export type AssetMode =
  | 'active'
  | 'maintenance'
  | 'moved'
  | 'saleConfirm'
  | 'sold';

export type OfficeEmployee = {
  id: EmployeeId;
  name: string;
  role: string;
  status: string;
  detail: string;
  image: ImageSourcePropType;
};

export const officeEmployees: ReadonlyArray<OfficeEmployee> = [
  {
    id: 'strategy',
    name: '林策',
    role: '策略负责人',
    status: '正在交接',
    detail: '把“新品发布方案”的结构稿交给审核经理。',
    image: require('../assets/office/employee-strategy.png'),
  },
  {
    id: 'reviewer',
    name: '顾宁',
    role: '审核经理',
    status: '等待接收',
    detail: '接收资料后进入合规与表达复核。',
    image: require('../assets/office/employee-reviewer.png'),
  },
  {
    id: 'secretary',
    name: '小岚',
    role: '老板秘书',
    status: '可接任务',
    detail: '负责汇总进度、代管岗位和向老板提交事项。',
    image: require('../assets/office/employee-secretary.png'),
  },
  {
    id: 'break',
    name: '沈言',
    role: '内容员工',
    status: '休息中',
    detail: '短暂休息，不代表离线；仍可正常派发新任务。',
    image: require('../assets/office/employee-break.png'),
  },
];

export function getOfficeEmployee(employeeId: EmployeeId) {
  const employee = officeEmployees.find(item => item.id === employeeId);

  if (!employee) {
    throw new Error(`Unknown office employee: ${employeeId}`);
  }

  return employee;
}
