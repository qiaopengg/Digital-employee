import type {
  NormalizedPoint,
  NormalizedRect,
} from './officePhysicsModel';
import type { EmployeeId } from './officeSceneModel';

export type OfficeWorkstationSlot = Readonly<{
  deskRect: NormalizedRect;
  gridColumn: 0 | 1;
  gridRow: 0 | 1 | 2;
  id: string;
  label: string;
  occupiedBy?: EmployeeId;
  seat: NormalizedPoint;
  stand: NormalizedPoint;
}>;

export const OFFICE_WORKSTATIONS: ReadonlyArray<OfficeWorkstationSlot> = [
  {
    deskRect: { height: 0.075, width: 0.19, x: 0.09, y: 0.14 },
    gridColumn: 0,
    gridRow: 0,
    id: 'strategy',
    label: '策略工位',
    occupiedBy: 'strategy',
    seat: { x: 0.185, y: 0.24 },
    stand: { x: 0.185, y: 0.262 },
  },
  {
    deskRect: { height: 0.075, width: 0.19, x: 0.285, y: 0.14 },
    gridColumn: 1,
    gridRow: 0,
    id: 'reviewer',
    label: '审核工位',
    occupiedBy: 'reviewer',
    seat: { x: 0.375, y: 0.24 },
    stand: { x: 0.375, y: 0.262 },
  },
  {
    deskRect: { height: 0.075, width: 0.2, x: 0.07, y: 0.29 },
    gridColumn: 0,
    gridRow: 1,
    id: 'reserved-a',
    label: '预留工位 A',
    seat: { x: 0.17, y: 0.39 },
    stand: { x: 0.17, y: 0.412 },
  },
  {
    deskRect: { height: 0.075, width: 0.2, x: 0.278, y: 0.29 },
    gridColumn: 1,
    gridRow: 1,
    id: 'reserved-b',
    label: '预留工位 B',
    seat: { x: 0.38, y: 0.39 },
    stand: { x: 0.38, y: 0.412 },
  },
  {
    deskRect: { height: 0.075, width: 0.215, x: 0.04, y: 0.44 },
    gridColumn: 0,
    gridRow: 2,
    id: 'reserved-c',
    label: '预留工位 C',
    seat: { x: 0.145, y: 0.54 },
    stand: { x: 0.145, y: 0.562 },
  },
  {
    deskRect: { height: 0.075, width: 0.215, x: 0.263, y: 0.44 },
    gridColumn: 1,
    gridRow: 2,
    id: 'reserved-d',
    label: '预留工位 D',
    seat: { x: 0.355, y: 0.54 },
    stand: { x: 0.355, y: 0.562 },
  },
];

export const OFFICE_FUNCTIONAL_ZONES = {
  bossOffice: { height: 0.29, width: 0.4, x: 0.59, y: 0.015 },
  entrance: { height: 0.1, width: 0.32, x: 0.36, y: 0.89 },
  loungeAndPantry: { height: 0.28, width: 0.39, x: 0.6, y: 0.58 },
  mainCorridor: { height: 0.87, width: 0.11, x: 0.48, y: 0.02 },
  meetingRoom: { height: 0.26, width: 0.39, x: 0.6, y: 0.31 },
  openOffice: { height: 0.48, width: 0.48, x: 0.02, y: 0.11 },
  reception: { height: 0.2, width: 0.35, x: 0.01, y: 0.62 },
} as const satisfies Record<string, NormalizedRect>;

export const OFFICE_FLOW_ORDER = {
  reportToBoss: ['openOffice', 'mainCorridor', 'bossOffice'],
  taskIntake: ['entrance', 'reception', 'mainCorridor', 'openOffice'],
  workHandoff: ['openOffice', 'mainCorridor', 'openOffice'],
} as const;
