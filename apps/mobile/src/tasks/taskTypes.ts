export type TaskMode = '快速' | '标准' | '深度';
export type ApiTaskMode = 'quick' | 'standard' | 'deep';
export type AiTaskStatus = 'working' | 'completed' | 'failed';

export type TaskReportBlock =
  | Readonly<{ type: 'paragraph'; text: string }>
  | Readonly<{ type: 'bullets'; items: ReadonlyArray<string> }>
  | Readonly<{
      type: 'metrics';
      items: ReadonlyArray<
        Readonly<{ label: string; value: string; note?: string }>
      >;
    }>
  | Readonly<{
      type: 'table';
      caption?: string;
      columns: ReadonlyArray<string>;
      rows: ReadonlyArray<ReadonlyArray<string>>;
    }>;

export type TaskReportV1 = Readonly<{
  schema: 'task-report.v1';
  title: string;
  summary: string;
  sections: ReadonlyArray<
    Readonly<{ title?: string; blocks: ReadonlyArray<TaskReportBlock> }>
  >;
  nextSteps?: ReadonlyArray<
    Readonly<{ text: string; owner?: string; due?: string }>
  >;
}>;

export type AiTaskExecution = Readonly<{
  answer?: string;
  completedAt?: string;
  error?: string;
  localId: string;
  mode: TaskMode;
  model?: string;
  personaReport?: string;
  prompt: string;
  remoteId?: string;
  report?: TaskReportV1;
  status: AiTaskStatus;
  usage?: Readonly<{
    completionTokens: number;
    promptTokens: number;
    totalTokens: number;
  }>;
}>;

export const apiTaskModes: Record<TaskMode, ApiTaskMode> = {
  快速: 'quick',
  标准: 'standard',
  深度: 'deep',
};
