import { Platform } from 'react-native';

import {
  apiTaskModes,
  type AiTaskExecution,
  type TaskMode,
} from './taskTypes';

type TaskResponse = {
  answer: string;
  completedAt: string;
  id: string;
  model: string;
  personaReport: string;
  status: 'completed';
  usage: {
    completionTokens: number;
    promptTokens: number;
    totalTokens: number;
  };
};

type ErrorResponse = {
  error?: {
    code?: string;
    message?: string;
    retryable?: boolean;
  };
};

export const AI_API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8787'
    : 'http://127.0.0.1:8787';

export async function submitAiTask({
  localId,
  mode,
  prompt,
}: {
  localId: string;
  mode: TaskMode;
  prompt: string;
}): Promise<AiTaskExecution> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 95000);
  let response: Response;

  try {
    response = await fetch(`${AI_API_BASE_URL}/v1/tasks`, {
      body: JSON.stringify({ mode: apiTaskModes[mode], prompt }),
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': localId,
      },
      method: 'POST',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const body = (await response.json()) as TaskResponse & ErrorResponse;

  if (!response.ok) {
    throw new Error(body.error?.message || `任务服务返回 ${response.status}`);
  }

  return {
    answer: body.answer,
    completedAt: body.completedAt,
    localId,
    mode,
    model: body.model,
    personaReport: body.personaReport,
    prompt,
    remoteId: body.id,
    status: 'completed',
    usage: body.usage,
  };
}
