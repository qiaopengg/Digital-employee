import { NativeModules, Platform } from 'react-native';

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

const API_PORT = 8787;

/**
 * On a physical device there is no loopback path to the developer's
 * machine, so 127.0.0.1 / 10.0.2.2 (simulator/emulator-only addresses)
 * cannot reach the local API PoC. In Debug builds Metro's scriptURL
 * already carries the developer machine's real LAN IP (that is how the
 * device fetched the JS bundle), so we reuse that host for the API too.
 * This keeps zero-config parity between simulator and real-device runs
 * without hardcoding a machine-specific IP into source control.
 */
function getDevServerHost(): string | undefined {
  const scriptURL: string | undefined =
    NativeModules.SourceCode?.scriptURL;
  if (!scriptURL) return undefined;

  const match = scriptURL.match(/^https?:\/\/([^/:]+)(?::\d+)?\//);
  return match?.[1];
}

function resolveApiBaseUrl(): string {
  const devHost = __DEV__ ? getDevServerHost() : undefined;

  if (devHost && devHost !== 'localhost' && devHost !== '127.0.0.1') {
    return `http://${devHost}:${API_PORT}`;
  }

  return Platform.OS === 'android'
    ? `http://10.0.2.2:${API_PORT}`
    : `http://127.0.0.1:${API_PORT}`;
}

export const AI_API_BASE_URL = resolveApiBaseUrl();

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
