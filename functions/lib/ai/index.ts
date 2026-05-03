// AI Service - Extensible AI provider management with automatic fallback
//
// Fallback order:
//   1. AI_PROVIDER env var (e.g. "openai", "anthropic", "deepseek")
//   2. If that provider has no key or API returns 401/402/403/429 → fall to next
//   3. Fallback chain: openai → anthropic → deepseek → mock
//   4. "mock" is always the last resort (no keys needed)

import { AIProvider, AIServiceConfig, ResumeProcessingInput, ResumeProcessingOutput } from './types';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { DeepSeekProvider } from './deepseek-provider';
import { MockProvider } from './mock-provider';

export * from './types';

/** Ordered fallback priority — higher index = lower priority */
const FALLBACK_CHAIN: Array<{ name: string; apiKeyEnv: string; model: string }> = [
  { name: 'openai',    apiKeyEnv: 'OPENAI_API_KEY',    model: 'gpt-4o-mini' },
  { name: 'anthropic', apiKeyEnv: 'ANTHROPIC_API_KEY',  model: 'claude-3-5-sonnet-20241022' },
  { name: 'deepseek',  apiKeyEnv: 'DEEPSEEK_API_KEY',   model: 'deepseek-chat' },
];

function createSingleProvider(name: string, apiKey: string, model?: string): AIProvider {
  switch (name) {
    case 'openai':
      return new OpenAIProvider(apiKey, model || 'gpt-4o-mini');
    case 'anthropic':
      return new AnthropicProvider(apiKey, model || 'claude-3-5-sonnet-20241022');
    case 'deepseek':
      return new DeepSeekProvider(apiKey, model || 'deepseek-chat');
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}

/**
 * Extract error category from fetch error or thrown Error.
 * Returns: 'no-key' | 'billing' | 'retryable' | 'other'
 */
function classifyProviderError(err: unknown): 'no-key' | 'billing' | 'retryable' | 'other' {
  const msg = String(err);
  const lower = msg.toLowerCase();

  if (lower.includes('api key') || lower.includes('401') || lower.includes('403')) {
    return 'no-key';
  }
  if (lower.includes('billing') || lower.includes('insufficient') || lower.includes('quota')
      || lower.includes('402') || lower.includes('429') || lower.includes('rate limit')) {
    return 'billing';
  }
  return 'other';
}

export class AIService {
  private primaryProvider: AIProvider | null = null;
  private fallbackProviders: AIProvider[] = [];
  private providerName = 'mock';  // tracked for getProviderName()

  constructor(config: AIServiceConfig) {
    // Always build a mock at the end of the chain
    const mock = new MockProvider();

    // Build providers in fallback order
    const providers: AIProvider[] = [];

    for (const entry of FALLBACK_CHAIN) {
      const key = config[entry.apiKeyEnv as keyof AIServiceConfig] as string | undefined;
      if (key) {
        providers.push(createSingleProvider(entry.name, key, config.model));
      }
    }

    // Prepend the explicitly preferred provider if it has a key
    if (config.apiKey && config.provider !== 'mock') {
      providers.unshift(createSingleProvider(config.provider, config.apiKey, config.model));
    }

    if (providers.length > 0) {
      this.primaryProvider = providers[0];
      this.fallbackProviders = providers.slice(1);
      this.providerName = providers[0].name;
      this.fallbackProviders.push(mock); // mock is always last resort
    } else {
      this.primaryProvider = mock;
      this.providerName = 'mock';
    }
  }

  getProviderName(): string {
    return this.providerName;
  }

  async processResume(input: ResumeProcessingInput): Promise<ResumeProcessingOutput> {
    const chain = [this.primaryProvider!, ...this.fallbackProviders];
    let lastError: Error | null = null;

    for (let i = 0; i < chain.length; i++) {
      const provider = chain[i];
      if (!provider) continue;

      try {
        const result = await provider.processResume(input);
        this.providerName = provider.name;

        // Attach metadata about which provider served the request
        return result;
      } catch (err: any) {
        lastError = err;
        const category = classifyProviderError(err);

        // For billing/no-key errors, try the next provider
        if (category === 'billing' || category === 'no-key') {
          console.log(`Provider ${provider.name} failed (${category}), falling to next...`);
          continue;
        }

        // For other errors (timeout, unexpected), throw immediately
        throw new Error(`Provider ${provider.name} error: ${err.message}`);
      }
    }

    // All providers exhausted
    throw new Error(`All providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }
}

// Factory function to create AI service from environment
export function createAIService(env: {
  AI_PROVIDER?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  AI_MODEL?: string;
}): AIService {
  const preferred = (env.AI_PROVIDER || 'mock') as 'openai' | 'anthropic' | 'deepseek' | 'mock';

  let preferredApiKey: string | undefined;
  switch (preferred) {
    case 'openai':
      preferredApiKey = env.OPENAI_API_KEY;
      break;
    case 'anthropic':
      preferredApiKey = env.ANTHROPIC_API_KEY;
      break;
    case 'deepseek':
      preferredApiKey = env.DEEPSEEK_API_KEY;
      break;
  }

  return new AIService({
    provider: preferred,
    apiKey: preferredApiKey,
    model: env.AI_MODEL,
    // Pass all keys for fallback
    OPENAI_API_KEY: env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
    DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY,
  });
}
