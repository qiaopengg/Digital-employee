import type { ApiConfig } from './config.ts';

export type DeepSeekMessage = Readonly<{
  content: string;
  role: 'assistant' | 'system' | 'user';
}>;

export type DeepSeekCompletion = Readonly<{
  content: string;
  model: string;
  requestId?: string;
  usage: Readonly<{
    completionTokens: number;
    promptTokens: number;
    totalTokens: number;
  }>;
}>;

type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

type CompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  id?: string;
  model?: string;
  usage?: {
    completion_tokens?: number;
    prompt_tokens?: number;
    total_tokens?: number;
  };
};

type ModelsResponse = {
  data?: Array<{ id?: string }>;
};

const ERROR_CODES: Record<number, string> = {
  400: 'provider_invalid_request',
  401: 'provider_authentication_failed',
  402: 'provider_balance_insufficient',
  422: 'provider_invalid_parameters',
  429: 'provider_rate_limited',
  500: 'provider_server_error',
  503: 'provider_overloaded',
};

export class DeepSeekError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'DeepSeekError';
    this.status = status;
    this.code = ERROR_CODES[status] ?? 'provider_unexpected_error';
    this.retryable = status === 429 || status === 500 || status === 503;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();

  if (!response.ok) {
    throw new DeepSeekError(
      response.status,
      `DeepSeek request failed with status ${response.status}.`,
    );
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new DeepSeekError(
      502,
      'DeepSeek returned an unreadable response body.',
    );
  }
}

export class DeepSeekClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImplementation: FetchLike;

  constructor(
    config: Pick<ApiConfig, 'deepSeekApiKey' | 'deepSeekBaseUrl'>,
    fetchImplementation: FetchLike = fetch,
  ) {
    this.apiKey = config.deepSeekApiKey;
    this.baseUrl = config.deepSeekBaseUrl;
    this.fetchImplementation = fetchImplementation;
  }

  async listModels(signal?: AbortSignal) {
    const response = await this.fetchImplementation(`${this.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
      method: 'GET',
      redirect: 'error',
      signal,
    });
    const body = await parseResponse<ModelsResponse>(response);

    return (body.data ?? [])
      .map(model => model.id)
      .filter((model): model is string => Boolean(model));
  }

  async createCompletion({
    messages,
    mode,
    model,
    signal,
  }: {
    messages: ReadonlyArray<DeepSeekMessage>;
    mode: 'deep' | 'quick' | 'standard';
    model: string;
    signal?: AbortSignal;
  }): Promise<DeepSeekCompletion> {
    const response = await this.fetchImplementation(
      `${this.baseUrl}/chat/completions`,
      {
        body: JSON.stringify({
          max_tokens: mode === 'quick' ? 1400 : mode === 'deep' ? 5000 : 2800,
          messages,
          model,
          reasoning_effort:
            mode === 'deep' ? 'high' : mode === 'quick' ? 'low' : 'medium',
          stream: false,
          thinking: {
            type: mode === 'quick' ? 'disabled' : 'enabled',
          },
        }),
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        redirect: 'error',
        signal,
      },
    );
    const body = await parseResponse<CompletionResponse>(response);
    const content = body.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new DeepSeekError(502, 'DeepSeek returned an empty answer.');
    }

    return {
      content,
      model: body.model || model,
      requestId: body.id,
      usage: {
        completionTokens: body.usage?.completion_tokens ?? 0,
        promptTokens: body.usage?.prompt_tokens ?? 0,
        totalTokens: body.usage?.total_tokens ?? 0,
      },
    };
  }
}
