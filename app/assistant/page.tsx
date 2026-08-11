'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Sparkles, Loader2, ChevronDown, AlertCircle } from 'lucide-react';

interface ProviderInfo {
  id: string;
  name: string;
  model?: string;
  protocol: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantPage() {
  const [prompt, setPrompt] = useState('');
  const [responseHistory, setResponseHistory] = useState<ChatMessage[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [providerError, setProviderError] = useState('');

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === selectedProviderId),
    [providers, selectedProviderId]
  );

  useEffect(() => {
    async function loadProviders() {
      try {
        const res = await fetch('/api/assistant/providers');
        const data = await res.json();
        if (!res.ok) {
          setProviderError(data?.error || 'Unable to load AI providers.');
          return;
        }

        setProviders(data.providers || []);
        const savedProvider = window.localStorage.getItem('spendly_ai_provider');
        const providerId = savedProvider || data.defaultProviderId || data.providers?.[0]?.id || '';
        setSelectedProviderId(providerId);
      } catch (err) {
        setProviderError(err instanceof Error ? err.message : 'Unable to load AI providers.');
      }
    }

    loadProviders();
  }, []);

  useEffect(() => {
    if (!selectedProviderId) {
      setSelectedModel('');
      setAvailableModels([]);
      return;
    }

    window.localStorage.setItem('spendly_ai_provider', selectedProviderId);
    const provider = providers.find((provider) => provider.id === selectedProviderId);
    if (!provider) return;

    const defaultModel = provider.model || '';
    setSelectedModel(defaultModel);

    async function loadModels() {
      try {
        const res = await fetch(`/api/assistant/models?providerId=${encodeURIComponent(selectedProviderId)}`);
        if (!res.ok) {
          setAvailableModels([]);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data.models) && data.models.length > 0) {
          setAvailableModels(data.models);
          if (!defaultModel) {
            setSelectedModel(data.models[0]);
          }
        } else {
          setAvailableModels([]);
        }
      } catch {
        setAvailableModels([]);
      }
    }

    loadModels();
  }, [selectedProviderId, providers]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError('Please enter a question or request for Spendly AI.');
      return;
    }

    if (!selectedProviderId) {
      setError('No AI provider is configured. Please update your AI provider settings.');
      return;
    }

    if (!selectedModel) {
      setError('Please select or enter a model.');
      return;
    }

    setLoading(true);
    setResponseHistory((history) => [...history, { role: 'user', content: trimmedPrompt }]);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProviderId,
          model: selectedModel,
          prompt: trimmedPrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Unable to contact the AI service.');
      } else {
        setResponseHistory((history) => [...history, { role: 'assistant', content: data.message || 'No answer was returned.' }]);
        setPrompt('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 860 }}>
      <div>
        <h1 className="page-title">Spendly AI Assistant</h1>
        <p className="page-subtitle">
          Ask for budgeting guidance, spending recommendations, savings tips, or help understanding your finances.
        </p>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>AI-powered finance help</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              Switch providers and models directly from the assistant UI.
            </div>
          </div>
        </div>

        {providerError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--red-muted)', color: 'var(--red)' }}>
            <AlertCircle size={16} />
            <span>{providerError}</span>
          </div>
        )}

        {!selectedProviderId && !providerError && (
          <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            No AI providers are configured. Update your `.env` with `AI_PROVIDER_1_*` variables and refresh the page.
          </div>
        )}

        {selectedProviderId && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label className="form-group">
                <span className="form-label">Provider</span>
                <select
                  className="form-control"
                  value={selectedProviderId}
                  onChange={(event) => setSelectedProviderId(event.target.value)}
                >
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-group">
                <span className="form-label">Model</span>
                {availableModels.length > 0 ? (
                  <select
                    className="form-control"
                    value={selectedModel}
                    onChange={(event) => setSelectedModel(event.target.value)}
                  >
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="form-control"
                    value={selectedModel}
                    onChange={(event) => setSelectedModel(event.target.value)}
                    placeholder="Enter model name"
                  />
                )}
              </label>
            </div>

            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Your question
            </label>
            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Spendly AI about budgets, expenses, savings, or financial planning..."
              className="form-control"
              style={{ minHeight: 140, resize: 'vertical' }}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin" /> Generating answer...
                  </>
                ) : (
                  'Ask Spendly AI'
                )}
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                Use the selected provider and model from your configured environments.
              </span>
            </div>

            {error && (
              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--red-muted)', color: 'var(--red)', fontSize: 13 }}>
                {error}
              </div>
            )}
          </form>
        )}
      </div>

      {responseHistory.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Conversation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {responseHistory.map((message, index) => (
              <div key={`${message.role}-${index}`} style={{ padding: '14px 16px', borderRadius: 'var(--radius-lg)', background: message.role === 'user' ? 'var(--bg-secondary)' : 'var(--bg-card)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: message.role === 'user' ? 'var(--text-secondary)' : 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase' }}>
                  {message.role === 'user' ? 'You' : 'AI'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.75, color: 'var(--text-primary)' }}>{message.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
