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

export function getApiConfig(
  environment: NodeJS.ProcessEnv = process.env,
): ApiConfig {
  const deepSeekApiKey = environment.DEEPSEEK_API_KEY?.trim();
  const deepSeekBaseUrl =
    environment.DEEPSEEK_BASE_URL?.trim() || DEEPSEEK_BASE_URL;
  const port = Number(environment.API_PORT || 8787);

  if (!deepSeekApiKey) {
    throw new Error(
      'DEEPSEEK_API_KEY is not configured. Set it in the server environment.',
    );
  }

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
