export {
  DEFAULT_TASK_TEAM,
  getOfficeEmployee,
  officeEmployees,
} from './employeeProfiles';
export type {
  EmployeeId,
  EmployeeProfile as OfficeEmployee,
  EmployeeSkill,
} from './employeeProfiles';

export type AssetMode =
  | 'active'
  | 'maintenance'
  | 'moved'
  | 'saleConfirm'
  | 'sold';
