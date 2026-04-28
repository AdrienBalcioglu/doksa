'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

function extractAppStoreId(input: string): string | undefined {
  // e.g. https://apps.apple.com/us/app/notion/id1232780281
  const match = input.match(/\/id(\d+)/);
  if (match) return match[1];
  // bare numeric ID
  if (/^\d+$/.test(input.trim())) return input.trim();
  return undefined;
}

function extractPlayStoreId(input: string): string | undefined {
  // e.g. https://play.google.com/store/apps/details?id=notion.id
  const url = (() => {
    try {
      return new URL(input);
    } catch {
      return null;
    }
  })();
  if (url) return url.searchParams.get('id') ?? undefined;
  // bare package name like com.notion.id
  if (/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i.test(input.trim())) return input.trim();
  return undefined;
}

export default function AddAppForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [appStoreInput, setAppStoreInput] = useState('');
  const [playStoreInput, setPlayStoreInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const app_store_id = appStoreInput ? extractAppStoreId(appStoreInput) : undefined;
    const play_store_id = playStoreInput ? extractPlayStoreId(playStoreInput) : undefined;

    if (appStoreInput && !app_store_id) {
      setError('Could not extract App Store ID from the URL or value you entered.');
      return;
    }
    if (playStoreInput && !play_store_id) {
      setError('Could not extract Play Store package name from the URL or value you entered.');
      return;
    }
    if (!app_store_id && !play_store_id) {
      setError('Please enter at least one store URL or ID.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.addApp({ name, app_store_id, play_store_id });
      setName('');
      setAppStoreInput('');
      setPlayStoreInput('');
      setOpen(false);
      router.refresh();
      if ((result as any).initial_reviews === 0) {
        console.warn('[AddApp] scrape returned 0 reviews — app may have none yet');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add app');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700"
      >
        + Add app
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-5 space-y-4 max-w-lg">
      <h2 className="font-semibold">Add a new app</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">App name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My App"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          App Store URL or ID <span className="text-gray-400">(optional)</span>
        </label>
        <input
          value={appStoreInput}
          onChange={(e) => setAppStoreInput(e.target.value)}
          placeholder="https://apps.apple.com/… or 1232780281"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Google Play URL or package name <span className="text-gray-400">(optional)</span>
        </label>
        <input
          value={playStoreInput}
          onChange={(e) => setPlayStoreInput(e.target.value)}
          placeholder="https://play.google.com/… or com.example.app"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Fetching reviews…' : 'Add app'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-gray-500 text-sm hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
