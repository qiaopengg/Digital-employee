export type TaskMode = '快速' | '标准' | '深度';
export type ApiTaskMode = 'quick' | 'standard' | 'deep';
export type AiTaskStatus = 'working' | 'completed' | 'failed';

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
