import { createServer as createNodeServer } from 'node:http';
import { pathToFileURL } from 'node:url';

import { getApiConfig, type ApiConfig } from './config.ts';
import { DeepSeekError } from './deepseekClient.ts';
import { TaskService, type TaskMode } from './taskService.ts';

const BODY_LIMIT = 32 * 1024;
const TASK_MODES = new Set<TaskMode>(['deep', 'quick', 'standard']);

async function readJsonBody(request: import('node:http').IncomingMessage) {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > BODY_LIMIT) throw new Error('Request body is too large.');
    chunks.push(buffer);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } catch {
    throw new Error('Request body must be valid JSON.');
  }
}

function sendJson(
  response: import('node:http').ServerResponse,
  status: number,
  body: unknown,
  config: ApiConfig,
) {
  response.writeHead(status, {
    'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Origin': config.corsOrigin,
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(body));
}

function mapError(error: unknown) {
  if (error instanceof DeepSeekError) {
    return {
      body: {
        error: {
          code: error.code,
          message: error.message,
          retryable: error.retryable,
        },
      },
      status: error.status === 401 || error.status === 402 ? 502 : error.status,
    };
  }

  return {
    body: {
      error: {
        code: 'invalid_request',
        message: error instanceof Error ? error.message : 'Unknown error.',
        retryable: false,
      },
    },
    status: 400,
  };
}

export function createApiServer(
  config: ApiConfig,
  taskService = new TaskService(config),
) {
  return createNodeServer(async (request, response) => {
    const url = new URL(request.url || '/', 'http://localhost');

    if (request.method === 'OPTIONS') {
      sendJson(response, 204, undefined, config);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      sendJson(
        response,
        200,
        { service: 'digital-employee-api', status: 'ok' },
        config,
      );
      return;
    }

    try {
      if (
        request.method === 'GET' &&
        url.pathname === '/v1/providers/deepseek/models'
      ) {
        const validation = await taskService.validateModels(
          AbortSignal.timeout(15000),
        );
        sendJson(response, 200, validation, config);
        return;
      }

      if (request.method === 'POST' && url.pathname === '/v1/tasks') {
        const idempotencyKey = request.headers['idempotency-key'];
        if (typeof idempotencyKey !== 'string' || !idempotencyKey.trim()) {
          throw new Error('Idempotency-Key header is required.');
        }

        const body = await readJsonBody(request);
        if (!body || typeof body !== 'object') {
          throw new Error('Task body is required.');
        }

        const { mode, prompt } = body as { mode?: unknown; prompt?: unknown };
        if (typeof prompt !== 'string') {
          throw new Error('Task prompt must be a string.');
        }
        if (typeof mode !== 'string' || !TASK_MODES.has(mode as TaskMode)) {
          throw new Error('Task mode must be quick, standard, or deep.');
        }

        const result = await taskService.execute({
          idempotencyKey,
          mode: mode as TaskMode,
          prompt,
          signal: AbortSignal.timeout(90000),
        });
        sendJson(response, 200, result, config);
        return;
      }

      sendJson(
        response,
        404,
        {
          error: {
            code: 'not_found',
            message: 'Route not found.',
            retryable: false,
          },
        },
        config,
      );
    } catch (error) {
      const mapped = mapError(error);
      sendJson(response, mapped.status, mapped.body, config);
    }
  });
}

const isMainModule =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const config = getApiConfig();
  const server = createApiServer(config);
  /**
   * Binds every interface (not just loopback) so a physical iOS/Android
   * device on the same LAN can reach this PoC through the developer
   * machine's local IP. This is a local development boundary only: it has
   * no authentication, so only run it on trusted networks and stop it when
   * device testing is done.
   */
  server.listen(config.port, '0.0.0.0', () => {
    console.log(`Digital Employee API listening on 0.0.0.0:${config.port}`);
  });
}
