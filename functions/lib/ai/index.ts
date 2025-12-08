// AI Service - Extensible AI provider management

import { AIProvider, AIServiceConfig, ResumeProcessingInput, ResumeProcessingOutput } from './types';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { MockProvider } from './mock-provider';

export * from './types';

export class AIService {
  private provider: AIProvider;

  constructor(config: AIServiceConfig) {
    this.provider = this.createProvider(config);
  }

  private createProvider(config: AIServiceConfig): AIProvider {
    switch (config.provider) {
      case 'openai':
        if (!config.apiKey) {
          throw new Error('OpenAI API key is required');
        }
        return new OpenAIProvider(config.apiKey, config.model || 'gpt-4o-mini');

      case 'anthropic':
        if (!config.apiKey) {
          throw new Error('Anthropic API key is required');
        }
        return new AnthropicProvider(config.apiKey, config.model || 'claude-3-5-sonnet-20241022');

      case 'mock':
        return new MockProvider();

      default:
        throw new Error(`Unknown AI provider: ${config.provider}`);
    }
  }

  getProviderName(): string {
    return this.provider.name;
  }

  async processResume(input: ResumeProcessingInput): Promise<ResumeProcessingOutput> {
    return this.provider.processResume(input);
  }
}

// Factory function to create AI service from environment
export function createAIService(env: {
  AI_PROVIDER?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  AI_MODEL?: string;
}): AIService {
  const provider = (env.AI_PROVIDER || 'mock') as 'openai' | 'anthropic' | 'mock';

  let apiKey: string | undefined;
  
  switch (provider) {
    case 'openai':
      apiKey = env.OPENAI_API_KEY;
      break;
    case 'anthropic':
      apiKey = env.ANTHROPIC_API_KEY;
      break;
  }

  return new AIService({
    provider,
    apiKey,
    model: env.AI_MODEL,
  });
}

