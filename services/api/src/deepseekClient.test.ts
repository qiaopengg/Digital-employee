import assert from 'node:assert/strict';
import test from 'node:test';

import { DeepSeekClient, DeepSeekError } from './deepseekClient.ts';

const config = {
  deepSeekApiKey: 'test-only-key',
  deepSeekBaseUrl: 'https://api.deepseek.com',
};

test('calls the official chat completion contract without exposing a client key', async () => {
  let requestInit: RequestInit | undefined;
  const client = new DeepSeekClient(config, async (_input, init) => {
    requestInit = init;
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: '可交付结果' } }],
        id: 'provider-request',
        model: 'deepseek-v4-flash',
        usage: {
          completion_tokens: 5,
          prompt_tokens: 8,
          total_tokens: 13,
        },
      }),
      { status: 200 },
    );
  });

  const result = await client.createCompletion({
    messages: [{ content: '测试任务', role: 'user' }],
    mode: 'standard',
    model: 'deepseek-v4-flash',
  });

  assert.equal(result.content, '可交付结果');
  assert.equal(result.usage.totalTokens, 13);
  assert.equal(
    (requestInit?.headers as Record<string, string>).Authorization,
    'Bearer test-only-key',
  );
  assert.match(String(requestInit?.body), /deepseek-v4-flash/);
});

test('maps provider authentication failures to a stable safe error', async () => {
  const client = new DeepSeekClient(
    config,
    async () => new Response('{}', { status: 401 }),
  );

  await assert.rejects(
    () =>
      client.createCompletion({
        messages: [{ content: '测试任务', role: 'user' }],
        mode: 'quick',
        model: 'deepseek-v4-flash',
      }),
    (error: unknown) =>
      error instanceof DeepSeekError &&
      error.code === 'provider_authentication_failed' &&
      error.retryable === false,
  );
});
