'use client';

import { useState } from 'react';
import { App } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

type AlertForm = {
  app_id: string;
  channel: 'slack' | 'email';
  webhook_url: string;
  email: string;
  min_rating: number;
};

export default function AlertsClient({ apps }: { apps: App[] }) {
  const [form, setForm] = useState<AlertForm>({
    app_id: apps[0]?.id ?? '',
    channel: 'email',
    webhook_url: '',
    email: '',
    min_rating: 3,
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg('');
    try {
      const body = {
        app_id: form.app_id,
        user_id: DEMO_USER_ID,
        channel: form.channel,
        webhook_url: form.channel === 'slack' ? form.webhook_url : undefined,
        email: form.channel === 'email' ? form.email : undefined,
        min_rating: form.min_rating,
        active: true,
      };
      const res = await fetch(`${API}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setStatus('ok');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save alert');
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">App</label>
        <select
          value={form.app_id}
          onChange={(e) => setForm((f) => ({ ...f, app_id: e.target.value }))}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {apps.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notify via</label>
        <div className="flex gap-3">
          {(['email', 'slack'] as const).map((ch) => (
            <label key={ch} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={ch}
                checked={form.channel === ch}
                onChange={() => setForm((f) => ({ ...f, channel: ch }))}
                className="accent-brand-600"
              />
              <span className="text-sm capitalize">{ch}</span>
            </label>
          ))}
        </div>
      </div>

      {form.channel === 'email' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      )}

      {form.channel === 'slack' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slack webhook URL</label>
          <input
            type="url"
            required
            value={form.webhook_url}
            onChange={(e) => setForm((f) => ({ ...f, webhook_url: e.target.value }))}
            placeholder="https://hooks.slack.com/services/…"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alert when rating ≤ {form.min_rating} ★
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={form.min_rating}
          onChange={(e) => setForm((f) => ({ ...f, min_rating: parseInt(e.target.value, 10) }))}
          className="w-full accent-brand-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>1★</span><span>2★</span><span>3★</span><span>4★</span><span>5★</span>
        </div>
      </div>

      {status === 'error' && <p className="text-red-500 text-sm">{errorMsg}</p>}
      {status === 'ok' && <p className="text-green-600 text-sm">Alert saved!</p>}

      <button
        type="submit"
        disabled={status === 'saving' || apps.length === 0}
        className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
      >
        {status === 'saving' ? 'Saving…' : 'Save alert'}
      </button>

      {apps.length === 0 && (
        <p className="text-gray-400 text-xs">Add an app first before configuring alerts.</p>
      )}
    </form>
  );
}
