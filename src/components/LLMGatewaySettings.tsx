/**
 * LLM Gateway Settings Component
 * 
 * Provides a comprehensive UI for configuring multi-model LLM proxy
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Play, Square, RefreshCw, Plus, Trash2, TestTube,
  Check, AlertCircle, Settings2, Zap, DollarSign, Shield,
  ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react';
import {
  GatewaySettings, GatewayStatus, ProviderConfig, ProviderStatus,
  LLMProvider, PROVIDER_INFO, getProviderIcon,
  formatPrice, getGatewaySettings, saveGatewaySettings, getGatewayStatus,
  startGateway, stopGateway, testProvider, getDefaultProviders
} from '@/lib/llmGatewayApi';

// ============================================================================
// Sub-components
// ============================================================================

interface ProviderCardProps {
  provider: ProviderConfig;
  status?: ProviderStatus;
  onUpdate: (provider: ProviderConfig) => void;
  onTest: () => void;
  onRemove: () => void;
  testing: boolean;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  status,
  onUpdate,
  onTest,
  onRemove,
  testing
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const info = PROVIDER_INFO[provider.provider];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        border rounded-lg overflow-hidden transition-colors
        ${provider.enabled 
          ? 'border-green-500/30 bg-green-500/5' 
          : 'border-white/10 bg-white/5'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info?.icon || '⚙️'}</span>
          <div>
            <h4 className="font-medium text-white">{provider.name}</h4>
            <p className="text-xs text-white/50">{provider.base_url}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Status indicator */}
          {status && (
            <div className={`
              w-2 h-2 rounded-full
              ${status.available ? 'bg-green-500' : 'bg-red-500'}
            `} />
          )}
          
          {/* Enable toggle */}
          <button
            onClick={() => onUpdate({ ...provider, enabled: !provider.enabled })}
            className={`
              px-3 py-1 rounded text-xs font-medium transition-colors
              ${provider.enabled 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                : 'bg-white/10 text-white/50 hover:bg-white/20'}
            `}
          >
            {provider.enabled ? 'Enabled' : 'Disabled'}
          </button>
          
          {/* Test button */}
          <button
            onClick={onTest}
            disabled={testing || !provider.api_key}
            className="p-2 rounded hover:bg-white/10 text-white/70 disabled:opacity-50"
            title="Test connection"
          >
            {testing ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <TestTube size={16} />
            )}
          </button>
          
          {/* Expand button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded hover:bg-white/10 text-white/70"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      
      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* API Key */}
              <div>
                <label className="block text-sm text-white/70 mb-1">API Key</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={provider.api_key || ''}
                      onChange={(e) => onUpdate({ ...provider, api_key: e.target.value })}
                      placeholder="Enter API key..."
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Base URL */}
              <div>
                <label className="block text-sm text-white/70 mb-1">Base URL</label>
                <input
                  type="text"
                  value={provider.base_url}
                  onChange={(e) => onUpdate({ ...provider, base_url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              {/* Priority */}
              <div>
                <label className="block text-sm text-white/70 mb-1">
                  Priority (lower = higher priority)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={provider.priority}
                  onChange={(e) => onUpdate({ ...provider, priority: parseInt(e.target.value) || 1 })}
                  className="w-24 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              {/* Models */}
              <div>
                <label className="block text-sm text-white/70 mb-2">Available Models</label>
                <div className="space-y-2">
                  {provider.models.map((model) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between bg-white/5 rounded px-3 py-2"
                    >
                      <div>
                        <span className="text-sm text-white">{model.name}</span>
                        <span className="text-xs text-white/50 ml-2">({model.id})</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/50">
                        <span>In: {formatPrice(model.input_price)}/1M</span>
                        <span>Out: {formatPrice(model.output_price)}/1M</span>
                        {model.is_default && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Status info */}
              {status && (
                <div className="text-xs text-white/50 space-y-1">
                  <p>Requests: {status.request_count} | Errors: {status.error_count}</p>
                  {status.latency_ms && <p>Latency: {status.latency_ms}ms</p>}
                  {status.last_error && (
                    <p className="text-red-400">Error: {status.last_error}</p>
                  )}
                </div>
              )}
              
              {/* Remove button */}
              <button
                onClick={onRemove}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm"
              >
                <Trash2 size={14} />
                Remove Provider
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const LLMGatewaySettings: React.FC = () => {
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [status, setStatus] = useState<GatewayStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Load settings and status
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsData, statusData] = await Promise.all([
        getGatewaySettings(),
        getGatewayStatus()
      ]);
      setSettings(settingsData);
      setStatus(statusData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Auto-refresh status when gateway is running
  useEffect(() => {
    if (!status?.running) return;
    
    const interval = setInterval(async () => {
      try {
        const statusData = await getGatewayStatus();
        setStatus(statusData);
      } catch (err) {
        console.error('Failed to refresh status:', err);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [status?.running]);
  
  // Save settings
  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await saveGatewaySettings(settings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  
  // Toggle gateway
  const handleToggleGateway = async () => {
    try {
      if (status?.running) {
        await stopGateway();
      } else {
        await startGateway();
      }
      // Refresh status
      const statusData = await getGatewayStatus();
      setStatus(statusData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle gateway');
    }
  };
  
  // Test provider
  const handleTestProvider = async (provider: ProviderConfig) => {
    if (!provider.api_key) return;
    
    try {
      setTestingProvider(provider.provider);
      const result = await testProvider(provider.provider, provider.base_url, provider.api_key);
      
      // Update status
      setStatus(prev => prev ? {
        ...prev,
        provider_status: {
          ...prev.provider_status,
          [provider.provider]: result
        }
      } : null);
    } catch (err) {
      console.error('Test failed:', err);
    } finally {
      setTestingProvider(null);
    }
  };
  
  // Update provider
  const handleUpdateProvider = (index: number, provider: ProviderConfig) => {
    if (!settings) return;
    
    const newProviders = [...settings.providers];
    newProviders[index] = provider;
    setSettings({ ...settings, providers: newProviders });
  };
  
  // Remove provider
  const handleRemoveProvider = (index: number) => {
    if (!settings) return;
    
    const newProviders = settings.providers.filter((_, i) => i !== index);
    setSettings({ ...settings, providers: newProviders });
  };
  
  // Add provider
  const handleAddProvider = async () => {
    if (!settings) return;
    
    try {
      const defaults = await getDefaultProviders();
      // Find first provider not already added
      const existingProviders = new Set(settings.providers.map(p => p.provider));
      const newProvider = defaults.find(p => !existingProviders.has(p.provider));
      
      if (newProvider) {
        setSettings({
          ...settings,
          providers: [...settings.providers, newProvider]
        });
      }
    } catch (err) {
      console.error('Failed to add provider:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin text-white/50" size={24} />
      </div>
    );
  }
  
  if (!settings) {
    return (
      <div className="p-8 text-center text-red-400">
        <AlertCircle size={24} className="mx-auto mb-2" />
        <p>Failed to load settings</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="text-blue-400" size={24} />
          <div>
            <h2 className="text-xl font-semibold text-white">LLM Gateway</h2>
            <p className="text-sm text-white/50">
              Multi-model proxy for Claude Code
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
            ${status?.running 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-white/10 text-white/50'}
          `}>
            <div className={`w-2 h-2 rounded-full ${status?.running ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
            {status?.running ? `Running on :${status.port}` : 'Stopped'}
          </div>
          
          {/* Toggle button */}
          <button
            onClick={handleToggleGateway}
            disabled={!settings.enabled}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${status?.running
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {status?.running ? (
              <>
                <Square size={16} />
                Stop
              </>
            ) : (
              <>
                <Play size={16} />
                Start
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      
      {/* Main settings */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left column - General settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
            <Settings2 size={16} />
            General Settings
          </h3>
          
          <div className="space-y-3">
            {/* Enable gateway */}
            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
              <span className="text-sm text-white">Enable Gateway</span>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-4 h-4 rounded"
              />
            </label>
            
            {/* Auto-start */}
            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
              <span className="text-sm text-white">Auto-start on launch</span>
              <input
                type="checkbox"
                checked={settings.auto_start}
                onChange={(e) => setSettings({ ...settings, auto_start: e.target.checked })}
                className="w-4 h-4 rounded"
              />
            </label>
            
            {/* Port */}
            <div className="p-3 bg-white/5 rounded-lg">
              <label className="block text-sm text-white mb-2">Server Port</label>
              <input
                type="number"
                min="1024"
                max="65535"
                value={settings.port}
                onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value) || 8765 })}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            
            {/* Timeout */}
            <div className="p-3 bg-white/5 rounded-lg">
              <label className="block text-sm text-white mb-2">Request Timeout (seconds)</label>
              <input
                type="number"
                min="10"
                max="600"
                value={settings.timeout_seconds}
                onChange={(e) => setSettings({ ...settings, timeout_seconds: parseInt(e.target.value) || 120 })}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Right column - Features */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
            <Zap size={16} />
            Features
          </h3>
          
          <div className="space-y-3">
            {/* Smart routing */}
            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
              <div>
                <span className="text-sm text-white flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" />
                  Smart Routing
                </span>
                <span className="text-xs text-white/50">Auto-select best model for task</span>
              </div>
              <input
                type="checkbox"
                checked={settings.smart_routing}
                onChange={(e) => setSettings({ ...settings, smart_routing: e.target.checked })}
                className="w-4 h-4 rounded"
              />
            </label>
            
            {/* Cost optimization */}
            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
              <div>
                <span className="text-sm text-white flex items-center gap-2">
                  <DollarSign size={14} className="text-green-400" />
                  Cost Optimization
                </span>
                <span className="text-xs text-white/50">Use cheaper models when possible</span>
              </div>
              <input
                type="checkbox"
                checked={settings.cost_optimization}
                onChange={(e) => setSettings({ ...settings, cost_optimization: e.target.checked })}
                className="w-4 h-4 rounded"
              />
            </label>
            
            {/* Failover */}
            <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
              <div>
                <span className="text-sm text-white flex items-center gap-2">
                  <Shield size={14} className="text-blue-400" />
                  Failover Protection
                </span>
                <span className="text-xs text-white/50">Switch to backup on errors</span>
              </div>
              <input
                type="checkbox"
                checked={settings.failover_enabled}
                onChange={(e) => setSettings({ ...settings, failover_enabled: e.target.checked })}
                className="w-4 h-4 rounded"
              />
            </label>
            
            {/* Default provider */}
            <div className="p-3 bg-white/5 rounded-lg">
              <label className="block text-sm text-white mb-2">Default Provider</label>
              <select
                value={settings.default_provider}
                onChange={(e) => setSettings({ ...settings, default_provider: e.target.value as LLMProvider })}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {settings.providers.filter(p => p.enabled).map(p => (
                  <option key={p.provider} value={p.provider}>
                    {getProviderIcon(p.provider)} {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Providers section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white/70">Configured Providers</h3>
          <button
            onClick={handleAddProvider}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30"
          >
            <Plus size={14} />
            Add Provider
          </button>
        </div>
        
        <div className="space-y-3">
          {settings.providers.map((provider, index) => (
            <ProviderCard
              key={provider.provider}
              provider={provider}
              status={status?.provider_status[provider.provider]}
              onUpdate={(p) => handleUpdateProvider(index, p)}
              onTest={() => handleTestProvider(provider)}
              onRemove={() => handleRemoveProvider(index)}
              testing={testingProvider === provider.provider}
            />
          ))}
        </div>
      </div>
      
      {/* Save button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button
          onClick={loadData}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default LLMGatewaySettings;
