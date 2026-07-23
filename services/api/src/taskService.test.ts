import assert from 'node:assert/strict';
import test from 'node:test';

import type { ApiConfig } from './config.ts';
import { DeepSeekClient } from './deepseekClient.ts';
import { TaskService } from './taskService.ts';

const config: ApiConfig = {
  corsOrigin: '*',
  deepSeekApiKey: 'test-only-key',
  deepSeekBaseUrl: 'https://api.deepseek.com',
  flashModel: 'deepseek-v4-flash',
  port: 8787,
  proModel: 'deepseek-v4-pro',
};

test('deduplicates a completed task by idempotency key', async () => {
  let calls = 0;
  const client = new DeepSeekClient(config, async () => {
    calls += 1;
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: '统一正式成果' } }],
        model: 'deepseek-v4-flash',
        usage: { total_tokens: 20 },
      }),
      { status: 200 },
    );
  });
  const service = new TaskService(config, client);
  const input = {
    idempotencyKey: 'same-task',
    mode: 'standard' as const,
    prompt: '整理一份周会提纲',
  };

  const first = await service.execute(input);
  const second = await service.execute(input);

  assert.equal(first.id, second.id);
  assert.equal(first.answer, '统一正式成果');
  assert.equal(calls, 1);
});
