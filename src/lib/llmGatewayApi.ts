/**
 * LLM Gateway API Client
 * 
 * Provides frontend interface for managing multi-model LLM proxy settings
 */

import { apiCall } from './apiAdapter';

// ============================================================================
// Types
// ============================================================================

/** Supported LLM providers */
export type LLMProvider = 
  | 'anthropic'
  | 'openai'
  | 'gemini'
  | 'deepseek'
  | 'moonshot'
  | 'qwen'
  | 'zhipu'
  | 'groq'
  | 'ollama'
  | 'openrouter'
  | 'custom';

/** Model configuration */
export interface ModelConfig {
  /** Model ID as used by the provider */
  id: string;
  /** Display name */
  name: string;
  /** Model capabilities (coding, reasoning, creative, fast) */
  capabilities: string[];
  /** Input price per 1M tokens (USD) */
  input_price: number;
  /** Output price per 1M tokens (USD) */
  output_price: number;
  /** Maximum context length */
  max_tokens: number;
  /** Whether this is the default model for this provider */
  is_default: boolean;
}

/** Provider configuration */
export interface ProviderConfig {
  /** Provider identifier */
  provider: LLMProvider;
  /** Display name */
  name: string;
  /** API base URL */
  base_url: string;
  /** API key (stored securely) */
  api_key?: string;
  /** Whether this provider is enabled */
  enabled: boolean;
  /** Priority for model routing (lower = higher priority) */
  priority: number;
  /** Supported models */
  models: ModelConfig[];
  /** Custom headers */
  headers: Record<string, string>;
}

/** LLM Gateway settings */
export interface GatewaySettings {
  /** Whether the gateway is enabled */
  enabled: boolean;
  /** Local server port */
  port: number;
  /** Auto-start gateway on app launch */
  auto_start: boolean;
  /** Default provider */
  default_provider: LLMProvider;
  /** Enable intelligent routing */
  smart_routing: boolean;
  /** Enable cost optimization */
  cost_optimization: boolean;
  /** Failover enabled */
  failover_enabled: boolean;
  /** Request timeout in seconds */
  timeout_seconds: number;
  /** Provider configurations */
  providers: ProviderConfig[];
}

/** Provider status */
export interface ProviderStatus {
  /** Whether the provider is available */
  available: boolean;
  /** Last response time in ms */
  latency_ms?: number;
  /** Last error message */
  last_error?: string;
  /** Requests count */
  request_count: number;
  /** Error count */
  error_count: number;
}

/** Gateway status information */
export interface GatewayStatus {
  /** Whether the gateway server is running */
  running: boolean;
  /** Current port */
  port: number;
  /** Number of requests processed */
  requests_processed: number;
  /** Provider health status */
  provider_status: Record<string, ProviderStatus>;
  /** Last error if any */
  last_error?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get LLM Gateway settings
 */
export async function getGatewaySettings(): Promise<GatewaySettings> {
  try {
    return await apiCall<GatewaySettings>('get_llm_gateway_settings');
  } catch (error) {
    console.error('Failed to get gateway settings:', error);
    throw error;
  }
}

/**
 * Save LLM Gateway settings
 */
export async function saveGatewaySettings(settings: GatewaySettings): Promise<void> {
  try {
    await apiCall<void>('save_llm_gateway_settings', { settings });
  } catch (error) {
    console.error('Failed to save gateway settings:', error);
    throw error;
  }
}

/**
 * Get LLM Gateway status
 */
export async function getGatewayStatus(): Promise<GatewayStatus> {
  try {
    return await apiCall<GatewayStatus>('get_llm_gateway_status');
  } catch (error) {
    console.error('Failed to get gateway status:', error);
    throw error;
  }
}

/**
 * Start the LLM Gateway server
 */
export async function startGateway(): Promise<void> {
  try {
    await apiCall<void>('start_llm_gateway');
  } catch (error) {
    console.error('Failed to start gateway:', error);
    throw error;
  }
}

/**
 * Stop the LLM Gateway server
 */
export async function stopGateway(): Promise<void> {
  try {
    await apiCall<void>('stop_llm_gateway');
  } catch (error) {
    console.error('Failed to stop gateway:', error);
    throw error;
  }
}

/**
 * Test a provider connection
 */
export async function testProvider(
  provider: LLMProvider,
  baseUrl: string,
  apiKey: string
): Promise<ProviderStatus> {
  try {
    return await apiCall<ProviderStatus>('test_llm_provider', {
      provider,
      baseUrl,
      apiKey,
    });
  } catch (error) {
    console.error('Failed to test provider:', error);
    throw error;
  }
}

/**
 * Get default providers configuration
 */
export async function getDefaultProviders(): Promise<ProviderConfig[]> {
  try {
    return await apiCall<ProviderConfig[]>('get_default_llm_providers');
  } catch (error) {
    console.error('Failed to get default providers:', error);
    throw error;
  }
}

/**
 * Get environment variables for Claude Code to use the gateway
 */
export async function getGatewayEnvVars(): Promise<Record<string, string>> {
  try {
    return await apiCall<Record<string, string>>('get_gateway_env_vars');
  } catch (error) {
    console.error('Failed to get gateway env vars:', error);
    throw error;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Provider display information */
export const PROVIDER_INFO: Record<LLMProvider, { name: string; icon: string; color: string }> = {
  anthropic: { name: 'Anthropic', icon: '🅰️', color: '#D97706' },
  openai: { name: 'OpenAI', icon: '🤖', color: '#10A37F' },
  gemini: { name: 'Google Gemini', icon: '💎', color: '#4285F4' },
  deepseek: { name: 'DeepSeek', icon: '🔵', color: '#1E40AF' },
  moonshot: { name: 'Moonshot', icon: '🌙', color: '#7C3AED' },
  qwen: { name: 'Qwen', icon: '☁️', color: '#F97316' },
  zhipu: { name: 'Zhipu AI', icon: '🧠', color: '#0EA5E9' },
  groq: { name: 'Groq', icon: '⚡', color: '#EF4444' },
  ollama: { name: 'Ollama', icon: '🦙', color: '#22C55E' },
  openrouter: { name: 'OpenRouter', icon: '🔀', color: '#8B5CF6' },
  custom: { name: 'Custom', icon: '⚙️', color: '#6B7280' },
};

/** Get provider display name */
export function getProviderName(provider: LLMProvider): string {
  return PROVIDER_INFO[provider]?.name || provider;
}

/** Get provider icon */
export function getProviderIcon(provider: LLMProvider): string {
  return PROVIDER_INFO[provider]?.icon || '⚙️';
}

/** Format price per 1M tokens */
export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  if (price < 0.01) return `$${(price * 100).toFixed(3)}¢`;
  return `$${price.toFixed(2)}`;
}

/** Calculate estimated cost */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  inputPrice: number,
  outputPrice: number
): number {
  return (inputTokens / 1_000_000) * inputPrice + (outputTokens / 1_000_000) * outputPrice;
}
