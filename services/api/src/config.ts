const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const SUPPORTED_MODELS = new Set(['deepseek-v4-flash', 'deepseek-v4-pro']);

export type ApiConfig = Readonly<{
  corsOrigin: string;
  deepSeekApiKey: string;
  deepSeekBaseUrl: string;
  flashModel: string;
  port: number;
  proModel: string;
}>;

function readModel(value: string | undefined, fallback: string) {
  const model = value?.trim() || fallback;

  if (!SUPPORTED_MODELS.has(model)) {
    throw new Error(`Unsupported DeepSeek model configured: ${model}`);
  }

  return model;
}

const PLACEHOLDER_KEYS = new Set([
  '<set locally>',
  '<replace-with-your-key>',
  'test',
  'your-api-key',
  'your_key_here',
]);

function readApiKey(value: string | undefined) {
  const key = value?.trim();

  if (!key) {
    throw new Error(
      'DEEPSEEK_API_KEY is not configured. Set it in the server environment.',
    );
  }

  if (PLACEHOLDER_KEYS.has(key.toLowerCase())) {
    throw new Error(
      'DEEPSEEK_API_KEY is still a placeholder. Set a real key in the server environment.',
    );
  }

  if (key.length < 20 || !/^[\x21-\x7E]+$/.test(key)) {
    throw new Error(
      'DEEPSEEK_API_KEY must be a valid printable ASCII secret without spaces.',
    );
  }

  return key;
}

export function getApiConfig(
  environment: NodeJS.ProcessEnv = process.env,
): ApiConfig {
  const deepSeekApiKey = readApiKey(environment.DEEPSEEK_API_KEY);
  const deepSeekBaseUrl =
    environment.DEEPSEEK_BASE_URL?.trim() || DEEPSEEK_BASE_URL;
  const port = Number(environment.API_PORT || 8787);

  if (deepSeekBaseUrl !== DEEPSEEK_BASE_URL) {
    throw new Error('DEEPSEEK_BASE_URL must use the approved official host.');
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('API_PORT must be a valid TCP port.');
  }

  return {
    corsOrigin: environment.API_CORS_ORIGIN?.trim() || '*',
    deepSeekApiKey,
    deepSeekBaseUrl,
    flashModel: readModel(
      environment.DEEPSEEK_FLASH_MODEL,
      'deepseek-v4-flash',
    ),
    port,
    proModel: readModel(environment.DEEPSEEK_PRO_MODEL, 'deepseek-v4-pro'),
  };
}
