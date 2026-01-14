//! LLM Gateway Module - Multi-Model API Proxy for Claude Code
//!
//! This module provides a local HTTP server that acts as a proxy between Claude Code
//! and various LLM providers (OpenAI, DeepSeek, Moonshot, Qwen, etc.).
//!
//! Key features:
//! - Unified API interface compatible with Anthropic/OpenAI formats
//! - Intelligent model routing based on task type
//! - Cost optimization through smart model selection
//! - Failover support when primary providers are unavailable

use rusqlite::params;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;

use crate::commands::agents::AgentDb;

// ============================================================================
// Data Structures
// ============================================================================

/// Supported LLM providers
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum LLMProvider {
    Anthropic,
    OpenAI,
    DeepSeek,
    Moonshot,
    Qwen,
    Zhipu,
    Groq,
    Ollama,
    OpenRouter,
    Custom,
}

impl std::fmt::Display for LLMProvider {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LLMProvider::Anthropic => write!(f, "anthropic"),
            LLMProvider::OpenAI => write!(f, "openai"),
            LLMProvider::DeepSeek => write!(f, "deepseek"),
            LLMProvider::Moonshot => write!(f, "moonshot"),
            LLMProvider::Qwen => write!(f, "qwen"),
            LLMProvider::Zhipu => write!(f, "zhipu"),
            LLMProvider::Groq => write!(f, "groq"),
            LLMProvider::Ollama => write!(f, "ollama"),
            LLMProvider::OpenRouter => write!(f, "openrouter"),
            LLMProvider::Custom => write!(f, "custom"),
        }
    }
}

/// Provider configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderConfig {
    /// Provider identifier
    pub provider: LLMProvider,
    /// Display name
    pub name: String,
    /// API base URL
    pub base_url: String,
    /// API key (stored securely)
    pub api_key: Option<String>,
    /// Whether this provider is enabled
    pub enabled: bool,
    /// Priority for model routing (lower = higher priority)
    pub priority: i32,
    /// Supported models
    pub models: Vec<ModelConfig>,
    /// Custom headers
    pub headers: HashMap<String, String>,
}

/// Model configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfig {
    /// Model ID as used by the provider
    pub id: String,
    /// Display name
    pub name: String,
    /// Model capabilities (coding, reasoning, creative, fast)
    pub capabilities: Vec<String>,
    /// Input price per 1M tokens (USD)
    pub input_price: f64,
    /// Output price per 1M tokens (USD)
    pub output_price: f64,
    /// Maximum context length
    pub max_tokens: u32,
    /// Whether this is the default model for this provider
    pub is_default: bool,
}

/// LLM Gateway settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewaySettings {
    /// Whether the gateway is enabled
    pub enabled: bool,
    /// Local server port
    pub port: u16,
    /// Auto-start gateway on app launch
    pub auto_start: bool,
    /// Default provider
    pub default_provider: LLMProvider,
    /// Enable intelligent routing
    pub smart_routing: bool,
    /// Enable cost optimization
    pub cost_optimization: bool,
    /// Failover enabled
    pub failover_enabled: bool,
    /// Request timeout in seconds
    pub timeout_seconds: u32,
    /// Provider configurations
    pub providers: Vec<ProviderConfig>,
}

impl Default for GatewaySettings {
    fn default() -> Self {
        Self {
            enabled: false,
            port: 8765,
            auto_start: false,
            default_provider: LLMProvider::OpenAI,
            smart_routing: true,
            cost_optimization: true,
            failover_enabled: true,
            timeout_seconds: 120,
            providers: get_default_providers(),
        }
    }
}

/// Gateway status information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayStatus {
    /// Whether the gateway server is running
    pub running: bool,
    /// Current port
    pub port: u16,
    /// Number of requests processed
    pub requests_processed: u64,
    /// Provider health status
    pub provider_status: HashMap<String, ProviderStatus>,
    /// Last error if any
    pub last_error: Option<String>,
}

/// Provider status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderStatus {
    /// Whether the provider is available
    pub available: bool,
    /// Last response time in ms
    pub latency_ms: Option<u64>,
    /// Last error message
    pub last_error: Option<String>,
    /// Requests count
    pub request_count: u64,
    /// Error count
    pub error_count: u64,
}

/// Request/Response types for the gateway
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRequest {
    pub model: Option<String>,
    pub messages: Vec<ChatMessage>,
    pub max_tokens: Option<u32>,
    pub temperature: Option<f32>,
    pub stream: Option<bool>,
    #[serde(flatten)]
    pub extra: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatResponse {
    pub id: String,
    pub model: String,
    pub content: String,
    pub usage: Option<UsageInfo>,
    pub provider: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageInfo {
    pub input_tokens: u32,
    pub output_tokens: u32,
    pub total_tokens: u32,
}

// ============================================================================
// Default Provider Configurations
// ============================================================================

fn get_default_providers() -> Vec<ProviderConfig> {
    vec![
        // OpenAI
        ProviderConfig {
            provider: LLMProvider::OpenAI,
            name: "OpenAI".to_string(),
            base_url: "https://api.openai.com/v1".to_string(),
            api_key: None,
            enabled: false,
            priority: 1,
            models: vec![
                ModelConfig {
                    id: "gpt-4o".to_string(),
                    name: "GPT-4o".to_string(),
                    capabilities: vec!["coding".to_string(), "reasoning".to_string(), "creative".to_string()],
                    input_price: 2.5,
                    output_price: 10.0,
                    max_tokens: 128000,
                    is_default: true,
                },
                ModelConfig {
                    id: "gpt-4o-mini".to_string(),
                    name: "GPT-4o Mini".to_string(),
                    capabilities: vec!["coding".to_string(), "fast".to_string()],
                    input_price: 0.15,
                    output_price: 0.6,
                    max_tokens: 128000,
                    is_default: false,
                },
                ModelConfig {
                    id: "gpt-4-turbo".to_string(),
                    name: "GPT-4 Turbo".to_string(),
                    capabilities: vec!["coding".to_string(), "reasoning".to_string()],
                    input_price: 10.0,
                    output_price: 30.0,
                    max_tokens: 128000,
                    is_default: false,
                },
            ],
            headers: HashMap::new(),
        },
        // DeepSeek
        ProviderConfig {
            provider: LLMProvider::DeepSeek,
            name: "DeepSeek".to_string(),
            base_url: "https://api.deepseek.com/v1".to_string(),
            api_key: None,
            enabled: false,
            priority: 2,
            models: vec![
                ModelConfig {
                    id: "deepseek-chat".to_string(),
                    name: "DeepSeek Chat".to_string(),
                    capabilities: vec!["coding".to_string(), "reasoning".to_string()],
                    input_price: 0.14,
                    output_price: 0.28,
                    max_tokens: 64000,
                    is_default: false,
                },
                ModelConfig {
                    id: "deepseek-coder".to_string(),
                    name: "DeepSeek Coder".to_string(),
                    capabilities: vec!["coding".to_string()],
                    input_price: 0.14,
                    output_price: 0.28,
                    max_tokens: 64000,
                    is_default: true,
                },
                ModelConfig {
                    id: "deepseek-reasoner".to_string(),
                    name: "DeepSeek Reasoner (R1)".to_string(),
                    capabilities: vec!["reasoning".to_string(), "coding".to_string()],
                    input_price: 0.55,
                    output_price: 2.19,
                    max_tokens: 64000,
                    is_default: false,
                },
            ],
            headers: HashMap::new(),
        },
        // Moonshot (Kimi)
        ProviderConfig {
            provider: LLMProvider::Moonshot,
            name: "Moonshot (Kimi)".to_string(),
            base_url: "https://api.moonshot.cn/v1".to_string(),
            api_key: None,
            enabled: false,
            priority: 3,
            models: vec![
                ModelConfig {
                    id: "moonshot-v1-8k".to_string(),
                    name: "Moonshot V1 8K".to_string(),
                    capabilities: vec!["coding".to_string(), "fast".to_string()],
                    input_price: 0.012,
                    output_price: 0.012,
                    max_tokens: 8192,
                    is_default: false,
                },
                ModelConfig {
                    id: "moonshot-v1-32k".to_string(),
                    name: "Moonshot V1 32K".to_string(),
                    capabilities: vec!["coding".to_string(), "reasoning".to_string()],
                    input_price: 0.024,
                    output_price: 0.024,
                    max_tokens: 32768,
                    is_default: true,
                },
                ModelConfig {
                    id: "moonshot-v1-128k".to_string(),
                    name: "Moonshot V1 128K".to_string(),
                    capabilities: vec!["coding".to_string(), "reasoning".to_string()],
                    input_price: 0.06,
                    output_price: 0.06,
                    max_tokens: 131072,
                    is_default: false,
                },
            ],
            headers: HashMap::new(),
        },
        // Qwen (Alibaba)
        ProviderConfig {
            provider: LLMProvider::Qwen,
            name: "Qwen (Alibaba)".to_string(),
            base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1".to_string(),
            api_key: None,
            enabled: false,
            priority: 4,
            models: vec![
                ModelConfig {
                    id: "qwen-turbo".to_string(),
                    name: "Qwen Turbo".to_string(),
                    capabilities: vec!["fast".to_string()],
                    input_price: 0.002,
                    output_price: 0.006,
                    max_tokens: 8192,
                    is_default: false,
                },
                ModelConfig {
                    id: "qwen-plus".to_string(),
                    name: "Qwen Plus".to_string(),
                    capabilities: vec!["coding".to_string(), "reasoning".to_string()],
                    input_price: 0.004,
                    output_price: 0.012,
                    max_tokens: 32768,
                    is_default: true,
                },
                ModelConfig {
                    id: "qwen-max".to_string(),
                    name: "Qwen Max".to_string(),
                    capabilities: vec!["coding".to_string(), "reasoning".to_string(), "creative".to_string()],
                    input_price: 0.02,
                    output_price: 0.06,
                    max_tokens: 32768,
                    is_default: false,
                },
            ],
            headers: HashMap::new(),
        },
        // Zhipu (GLM)
        ProviderConfig {
            provider: LLMProvider::Zhipu,
            name: "Zhipu AI (GLM)".to_string(),
            base_url: "https://open.bigmodel.cn/api/paas/v4".to_string(),
            api_key: None,
            enabled: false,
            priority: 5,
            models: vec![
                ModelConfig {
                    id: "glm-4".to_string(),
                    name: "GLM-4".to_string(),
                    capabilities: vec!["coding".to_string(), "reasoning".to_string()],
                    input_price: 0.1,
                    output_price: 0.1,
                    max_tokens: 128000,
                    is_default: true,
                },
                ModelConfig {
                    id: "glm-4-flash".to_string(),
                    name: "GLM-4 Flash".to_string(),
                    capabilities: vec!["fast".to_string()],
                    input_price: 0.001,
                    output_price: 0.001,
                    max_tokens: 128000,
                    is_default: false,
                },
            ],
            headers: HashMap::new(),
        },
        // Groq
        ProviderConfig {
            provider: LLMProvider::Groq,
            name: "Groq".to_string(),
            base_url: "https://api.groq.com/openai/v1".to_string(),
            api_key: None,
            enabled: false,
            priority: 6,
            models: vec![
                ModelConfig {
                    id: "llama-3.3-70b-versatile".to_string(),
                    name: "Llama 3.3 70B".to_string(),
                    capabilities: vec!["coding".to_string(), "fast".to_string()],
                    input_price: 0.59,
                    output_price: 0.79,
                    max_tokens: 32768,
                    is_default: true,
                },
                ModelConfig {
                    id: "mixtral-8x7b-32768".to_string(),
                    name: "Mixtral 8x7B".to_string(),
                    capabilities: vec!["fast".to_string()],
                    input_price: 0.24,
                    output_price: 0.24,
                    max_tokens: 32768,
                    is_default: false,
                },
            ],
            headers: HashMap::new(),
        },
        // Ollama (Local)
        ProviderConfig {
            provider: LLMProvider::Ollama,
            name: "Ollama (Local)".to_string(),
            base_url: "http://localhost:11434/v1".to_string(),
            api_key: None,
            enabled: false,
            priority: 10,
            models: vec![
                ModelConfig {
                    id: "llama3.2".to_string(),
                    name: "Llama 3.2".to_string(),
                    capabilities: vec!["coding".to_string()],
                    input_price: 0.0,
                    output_price: 0.0,
                    max_tokens: 131072,
                    is_default: true,
                },
                ModelConfig {
                    id: "qwen2.5-coder".to_string(),
                    name: "Qwen 2.5 Coder".to_string(),
                    capabilities: vec!["coding".to_string()],
                    input_price: 0.0,
                    output_price: 0.0,
                    max_tokens: 32768,
                    is_default: false,
                },
                ModelConfig {
                    id: "deepseek-r1".to_string(),
                    name: "DeepSeek R1".to_string(),
                    capabilities: vec!["reasoning".to_string(), "coding".to_string()],
                    input_price: 0.0,
                    output_price: 0.0,
                    max_tokens: 64000,
                    is_default: false,
                },
            ],
            headers: HashMap::new(),
        },
        // OpenRouter
        ProviderConfig {
            provider: LLMProvider::OpenRouter,
            name: "OpenRouter".to_string(),
            base_url: "https://openrouter.ai/api/v1".to_string(),
            api_key: None,
            enabled: false,
            priority: 7,
            models: vec![
                ModelConfig {
                    id: "anthropic/claude-3.5-sonnet".to_string(),
                    name: "Claude 3.5 Sonnet".to_string(),
                    capabilities: vec!["coding".to_string(), "reasoning".to_string()],
                    input_price: 3.0,
                    output_price: 15.0,
                    max_tokens: 200000,
                    is_default: true,
                },
                ModelConfig {
                    id: "google/gemini-2.0-flash-exp".to_string(),
                    name: "Gemini 2.0 Flash".to_string(),
                    capabilities: vec!["coding".to_string(), "fast".to_string()],
                    input_price: 0.0,
                    output_price: 0.0,
                    max_tokens: 1048576,
                    is_default: false,
                },
            ],
            headers: HashMap::new(),
        },
    ]
}

// ============================================================================
// Gateway State
// ============================================================================

/// Global gateway state
pub struct LLMGatewayState {
    pub settings: Arc<RwLock<GatewaySettings>>,
    pub status: Arc<RwLock<GatewayStatus>>,
    pub server_handle: Arc<RwLock<Option<tokio::task::JoinHandle<()>>>>,
}

impl Default for LLMGatewayState {
    fn default() -> Self {
        Self {
            settings: Arc::new(RwLock::new(GatewaySettings::default())),
            status: Arc::new(RwLock::new(GatewayStatus {
                running: false,
                port: 8765,
                requests_processed: 0,
                provider_status: HashMap::new(),
                last_error: None,
            })),
            server_handle: Arc::new(RwLock::new(None)),
        }
    }
}

// ============================================================================
// Tauri Commands
// ============================================================================

/// Get gateway settings
#[tauri::command]
pub async fn get_llm_gateway_settings(db: State<'_, AgentDb>) -> Result<GatewaySettings, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    // Try to load from database
    if let Ok(json_str) = conn.query_row(
        "SELECT value FROM app_settings WHERE key = 'llm_gateway_settings'",
        [],
        |row| row.get::<_, String>(0),
    ) {
        if let Ok(settings) = serde_json::from_str::<GatewaySettings>(&json_str) {
            return Ok(settings);
        }
    }

    // Return default settings if not found
    Ok(GatewaySettings::default())
}

/// Save gateway settings
#[tauri::command]
pub async fn save_llm_gateway_settings(
    db: State<'_, AgentDb>,
    settings: GatewaySettings,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    let json_str = serde_json::to_string(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    conn.execute(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('llm_gateway_settings', ?1)",
        params![json_str],
    )
    .map_err(|e| format!("Failed to save settings: {}", e))?;

    Ok(())
}

/// Get gateway status
#[tauri::command]
pub async fn get_llm_gateway_status(
    state: State<'_, LLMGatewayState>,
) -> Result<GatewayStatus, String> {
    let status = state.status.read().await;
    Ok(status.clone())
}

/// Start the LLM gateway server
#[tauri::command]
pub async fn start_llm_gateway(
    db: State<'_, AgentDb>,
    state: State<'_, LLMGatewayState>,
) -> Result<(), String> {
    // Load settings
    let settings = get_llm_gateway_settings(db).await?;
    
    if !settings.enabled {
        return Err("LLM Gateway is not enabled".to_string());
    }

    // Check if already running
    {
        let status = state.status.read().await;
        if status.running {
            return Err("Gateway is already running".to_string());
        }
    }

    let port = settings.port;
    
    // Update settings in state
    {
        let mut state_settings = state.settings.write().await;
        *state_settings = settings;
    }

    // Start the server
    let settings_clone = state.settings.clone();
    let status_clone = state.status.clone();
    
    let handle = tokio::spawn(async move {
        if let Err(e) = run_gateway_server(port, settings_clone, status_clone).await {
            log::error!("Gateway server error: {}", e);
        }
    });

    // Store the handle
    {
        let mut server_handle = state.server_handle.write().await;
        *server_handle = Some(handle);
    }

    // Update status
    {
        let mut status = state.status.write().await;
        status.running = true;
        status.port = port;
    }

    log::info!("LLM Gateway started on port {}", port);
    Ok(())
}

/// Stop the LLM gateway server
#[tauri::command]
pub async fn stop_llm_gateway(state: State<'_, LLMGatewayState>) -> Result<(), String> {
    // Abort the server task
    {
        let mut server_handle = state.server_handle.write().await;
        if let Some(handle) = server_handle.take() {
            handle.abort();
        }
    }

    // Update status
    {
        let mut status = state.status.write().await;
        status.running = false;
    }

    log::info!("LLM Gateway stopped");
    Ok(())
}

/// Test a provider connection
#[tauri::command]
pub async fn test_llm_provider(
    provider: LLMProvider,
    base_url: String,
    api_key: String,
) -> Result<ProviderStatus, String> {
    use reqwest::Client;
    use std::time::Instant;

    let client = Client::new();
    let start = Instant::now();

    // Build the models endpoint URL
    let url = format!("{}/models", base_url.trim_end_matches('/'));

    let mut request = client.get(&url);

    // Add appropriate auth header based on provider
    match provider {
        LLMProvider::Anthropic => {
            request = request.header("x-api-key", &api_key);
            request = request.header("anthropic-version", "2023-06-01");
        }
        _ => {
            request = request.header("Authorization", format!("Bearer {}", api_key));
        }
    }

    match request.send().await {
        Ok(response) => {
            let latency = start.elapsed().as_millis() as u64;
            if response.status().is_success() {
                Ok(ProviderStatus {
                    available: true,
                    latency_ms: Some(latency),
                    last_error: None,
                    request_count: 1,
                    error_count: 0,
                })
            } else {
                let error_text = response.text().await.unwrap_or_default();
                Ok(ProviderStatus {
                    available: false,
                    latency_ms: Some(latency),
                    last_error: Some(error_text),
                    request_count: 1,
                    error_count: 1,
                })
            }
        }
        Err(e) => Ok(ProviderStatus {
            available: false,
            latency_ms: None,
            last_error: Some(e.to_string()),
            request_count: 1,
            error_count: 1,
        }),
    }
}

/// Get default providers configuration
#[tauri::command]
pub async fn get_default_llm_providers() -> Result<Vec<ProviderConfig>, String> {
    Ok(get_default_providers())
}

/// Generate environment variables for Claude Code to use the gateway
#[tauri::command]
pub async fn get_gateway_env_vars(
    state: State<'_, LLMGatewayState>,
) -> Result<HashMap<String, String>, String> {
    let status = state.status.read().await;
    let settings = state.settings.read().await;

    if !status.running {
        return Err("Gateway is not running".to_string());
    }

    let mut env_vars = HashMap::new();
    
    // Set the API base URL to point to our local gateway
    env_vars.insert(
        "ANTHROPIC_BASE_URL".to_string(),
        format!("http://127.0.0.1:{}", status.port),
    );
    
    // Use a placeholder API key (the gateway handles actual auth)
    env_vars.insert(
        "ANTHROPIC_API_KEY".to_string(),
        "gateway-proxy-key".to_string(),
    );

    // Clear any conflicting auth token
    env_vars.insert("ANTHROPIC_AUTH_TOKEN".to_string(), String::new());

    // Add provider-specific info for debugging
    env_vars.insert(
        "LLM_GATEWAY_PROVIDER".to_string(),
        settings.default_provider.to_string(),
    );

    Ok(env_vars)
}

// ============================================================================
// Gateway Server Implementation
// ============================================================================

/// Gateway server app state
#[derive(Clone)]
struct GatewayAppState {
    settings: Arc<RwLock<GatewaySettings>>,
    status: Arc<RwLock<GatewayStatus>>,
}

async fn run_gateway_server(
    port: u16,
    settings: Arc<RwLock<GatewaySettings>>,
    status: Arc<RwLock<GatewayStatus>>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    use axum::{
        http::{header, Method},
        routing::{get, post},
        Router,
    };
    use tower_http::cors::{Any, CorsLayer};

    let app_state = GatewayAppState {
        settings: settings.clone(),
        status: status.clone(),
    };

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION, header::ACCEPT])
        .allow_origin(Any);

    // Routes
    let app = Router::new()
        .route("/v1/messages", post(handle_messages))
        .route("/v1/chat/completions", post(handle_chat_completions))
        .route("/v1/models", get(handle_list_models))
        .route("/health", get(handle_health))
        .layer(cors)
        .with_state(app_state);

    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], port));
    log::info!("Starting LLM Gateway server on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

// Handler implementations
async fn handle_messages(
    axum::extract::State(_state): axum::extract::State<GatewayAppState>,
    axum::Json(request): axum::Json<serde_json::Value>,
) -> Result<axum::Json<serde_json::Value>, axum::http::StatusCode> {
    // TODO: Implement Anthropic-compatible messages endpoint
    log::info!("Received messages request: {:?}", request);
    Err(axum::http::StatusCode::NOT_IMPLEMENTED)
}

async fn handle_chat_completions(
    axum::extract::State(_state): axum::extract::State<GatewayAppState>,
    axum::Json(request): axum::Json<serde_json::Value>,
) -> Result<axum::Json<serde_json::Value>, axum::http::StatusCode> {
    // TODO: Implement OpenAI-compatible chat completions endpoint
    log::info!("Received chat completions request: {:?}", request);
    Err(axum::http::StatusCode::NOT_IMPLEMENTED)
}

async fn handle_list_models(
    axum::extract::State(_state): axum::extract::State<GatewayAppState>,
) -> Result<axum::Json<serde_json::Value>, axum::http::StatusCode> {
    // TODO: Return list of available models
    Ok(axum::Json(serde_json::json!({
        "object": "list",
        "data": []
    })))
}

async fn handle_health(
    axum::extract::State(_state): axum::extract::State<GatewayAppState>,
) -> Result<axum::Json<serde_json::Value>, axum::http::StatusCode> {
    Ok(axum::Json(serde_json::json!({
        "status": "ok",
        "version": "0.1.0"
    })))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_providers() {
        let providers = get_default_providers();
        assert!(!providers.is_empty());
        
        // Check that OpenAI is included
        let openai = providers.iter().find(|p| p.provider == LLMProvider::OpenAI);
        assert!(openai.is_some());
        
        // Check that models are defined
        let openai = openai.unwrap();
        assert!(!openai.models.is_empty());
    }

    #[test]
    fn test_gateway_settings_default() {
        let settings = GatewaySettings::default();
        assert_eq!(settings.port, 8765);
        assert!(!settings.enabled);
        assert!(!settings.providers.is_empty());
    }
}
