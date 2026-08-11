export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model?: string;
  protocol: string;
  enabled: boolean;
  apiKeyHeader: string;
  apiKeyPrefix?: string;
  fallbackIds: string[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  stream?: boolean;
  maxTokens?: number;
}

export interface ChatCompletionResult {
  text: string;
  providerId: string;
  model: string;
}

const providerPrefix = 'AI_PROVIDER_';

function normalizeKey(key: string) {
  return key.trim().toUpperCase();
}

function parseBoolean(value: string | undefined) {
  return value !== undefined && ['1', 'true', 'yes', 'enabled', 'on'].includes(value.toLowerCase());
}

function parseFallbackIds(value: string | undefined) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getProviderConfigs(): ProviderConfig[] {
  const env = process.env;
  const providersByIndex: Record<string, Record<string, string>> = {};

  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith(providerPrefix)) continue;
    const match = key.match(/^AI_PROVIDER_(\d+)_(.+)$/);
    if (!match) continue;

    const index = match[1];
    const field = normalizeKey(match[2]);
    providersByIndex[index] = providersByIndex[index] || {};
    providersByIndex[index][field] = value ?? '';
  }

  const providers: ProviderConfig[] = Object.entries(providersByIndex)
    .map(([index, values]) => {
      const id = values.ID || `provider-${index}`;
      return {
        id,
        name: values.NAME || id,
        baseUrl: values.BASE_URL?.trim() || '',
        apiKey: values.API_KEY?.trim() || '',
        model: values.MODEL?.trim(),
        protocol: (values.PROTOCOL || 'openai-compatible').trim().toLowerCase(),
        enabled: parseBoolean(values.ENABLED) || values.ENABLED === undefined,
        apiKeyHeader: values.API_KEY_HEADER?.trim() || 'Authorization',
        apiKeyPrefix: values.API_KEY_PREFIX?.trim() || 'Bearer',
        fallbackIds: parseFallbackIds(values.FALLBACK_IDS),
      };
    })
    .filter((config) => config.enabled && config.baseUrl && config.apiKey)
    .sort((a, b) => (a.id > b.id ? 1 : -1));

  if (providers.length > 0) {
    return providers;
  }

  if (env.AIML_API_KEY) {
    return [
      {
        id: 'aimlapi',
        name: 'AIMLAPI',
        baseUrl: (env.AIML_API_BASE || 'https://api.aimlapi.com/v1').trim(),
        apiKey: env.AIML_API_KEY.trim(),
        model: env.AIML_API_MODEL?.trim() || 'gpt-4o-mini',
        protocol: 'openai-compatible',
        enabled: true,
        apiKeyHeader: 'Authorization',
        apiKeyPrefix: 'Bearer',
        fallbackIds: [],
      },
    ];
  }

  return [];
}

export function getProviderConfig(id: string): ProviderConfig | undefined {
  return getProviderConfigs().find((provider) => provider.id === id);
}

export function getDefaultProviderId(): string {
  const providers = getProviderConfigs();
  return providers[0]?.id || '';
}

function resolveUrl(baseUrl: string, path: string) {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    if (!path.startsWith('/')) path = `/${path}`;
    return `${baseUrl}${path}`;
  }
}

function buildAuthHeaders(provider: ProviderConfig): HeadersInit {
  const apiKey = provider.apiKey;
  const prefix = provider.apiKeyPrefix ? `${provider.apiKeyPrefix} ` : '';
  return {
    [provider.apiKeyHeader]: `${prefix}${apiKey}`.trim(),
    'Content-Type': 'application/json',
  };
}

function normalizeOpenAIResponse(data: any): string {
  if (typeof data !== 'object' || data === null) return '';
  const firstChoice = Array.isArray(data.choices) ? data.choices[0] : undefined;
  if (!firstChoice) return '';
  if (firstChoice.message && typeof firstChoice.message.content === 'string') {
    return firstChoice.message.content;
  }
  if (typeof firstChoice.text === 'string') {
    return firstChoice.text;
  }
  return '';
}

export async function createChatCompletion(
  providerId: string,
  messages: ChatMessage[],
  options: ChatCompletionOptions & { stream: true }
): Promise<{ status: number; headers: HeadersInit; stream: ReadableStream<Uint8Array> | null }>;

export async function createChatCompletion(
  providerId: string,
  messages: ChatMessage[],
  options?: ChatCompletionOptions
): Promise<ChatCompletionResult>;

export async function createChatCompletion(
  providerId: string,
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<ChatCompletionResult | { status: number; headers: HeadersInit; stream: ReadableStream<Uint8Array> | null }> {
  const provider = getProviderConfig(providerId);
  if (!provider) {
    throw new Error(`Provider not found: ${providerId}`);
  }

  const model = options.model?.trim() || provider.model;
  if (!model) {
    throw new Error(`No model configured for provider ${providerId}`);
  }

  const payload: any = {
    model,
    messages,
  };

  if (options.maxTokens) payload.max_tokens = options.maxTokens;
  if (options.stream) payload.stream = true;

  const url = resolveUrl(provider.baseUrl, '/v1/chat/completions');
  const response = await fetch(url, {
    method: 'POST',
    headers: buildAuthHeaders(provider),
    body: JSON.stringify(payload),
  });

  if (options.stream) {
    const headers: HeadersInit = {};
    const contentType = response.headers.get('content-type');
    if (contentType) headers['content-type'] = contentType;
    headers['x-ai-provider-id'] = providerId;
    return { status: response.status, headers, stream: response.body };
  }

  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data?.error?.message || data?.message || `AI provider ${provider.name} error: ${response.status}`;
    if (provider.fallbackIds.length > 0) {
      return attemptFallback(provider.fallbackIds, messages, options, errorMessage);
    }
    throw new Error(errorMessage);
  }

  const text = normalizeOpenAIResponse(data);
  if (!text && provider.fallbackIds.length > 0) {
    return attemptFallback(provider.fallbackIds, messages, options, 'Empty response, trying fallback providers.');
  }

  return { text, providerId, model };
}

async function attemptFallback(
  fallbackIds: string[],
  messages: ChatMessage[],
  options: ChatCompletionOptions,
  lastError: string
): Promise<ChatCompletionResult> {
  for (const fallbackId of fallbackIds) {
    const fallbackProvider = getProviderConfig(fallbackId);
    if (!fallbackProvider) continue;

    try {
      const result = await createChatCompletion(fallbackId, messages, options);
      if ('text' in result) return result;
    } catch {
      continue;
    }
  }

  throw new Error(lastError);
}

export async function listProviderModels(providerId: string): Promise<string[]> {
  const provider = getProviderConfig(providerId);
  if (!provider) {
    throw new Error(`Provider not found: ${providerId}`);
  }

  const endpoints = ['/v1/models', '/models'];
  for (const endpoint of endpoints) {
    try {
      const url = resolveUrl(provider.baseUrl, endpoint);
      const response = await fetch(url, {
        method: 'GET',
        headers: buildAuthHeaders(provider),
      });
      if (!response.ok) continue;
      const data = await response.json();
      const models = extractModelIds(data);
      if (models.length > 0) return models;
    } catch {
      continue;
    }
  }

  return [];
}

function extractModelIds(data: any): string[] {
  if (!data || typeof data !== 'object') return [];
  const items = Array.isArray(data.data) ? data.data : Array.isArray(data.models) ? data.models : [];
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) return (item.id || item.model || item.name) as string;
      return undefined;
    })
    .filter(Boolean) as string[];
}
