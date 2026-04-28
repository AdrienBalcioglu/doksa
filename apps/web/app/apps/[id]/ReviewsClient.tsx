'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, Review, ReviewsResponse } from '@/lib/api';
import ReviewCard from '@/components/ReviewCard';

type Filters = {
  rating: string;
  platform: string;
  responded: string;
  page: number;
};

const PAGE_SIZE = 20;

export default function ReviewsClient({
  appId,
  initialData,
}: {
  appId: string;
  initialData: ReviewsResponse | null;
}) {
  const [filters, setFilters] = useState<Filters>({ rating: '', platform: '', responded: '', page: 1 });
  const [data, setData] = useState<ReviewsResponse | null>(initialData);
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async (f: Filters) => {
    setLoading(true);
    const params: Record<string, string> = { limit: String(PAGE_SIZE), page: String(f.page) };
    if (f.rating) params.rating = f.rating;
    if (f.platform) params.platform = f.platform;
    if (f.responded !== '') params.responded = f.responded;
    try {
      const result = await api.getReviews(appId, params);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchReviews(filters);
  }, [filters, fetchReviews]);

  function setFilter(key: keyof Omit<Filters, 'page'>, value: string) {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  }

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white border rounded-lg p-3">
        <select
          value={filters.rating}
          onChange={(e) => setFilter('rating', e.target.value)}
          className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All ratings</option>
          <option value="1">≤ 1 ★</option>
          <option value="2">≤ 2 ★</option>
          <option value="3">≤ 3 ★</option>
          <option value="4">≤ 4 ★</option>
        </select>

        <select
          value={filters.platform}
          onChange={(e) => setFilter('platform', e.target.value)}
          className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All platforms</option>
          <option value="app_store">App Store</option>
          <option value="play_store">Play Store</option>
        </select>

        <select
          value={filters.responded}
          onChange={(e) => setFilter('responded', e.target.value)}
          className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All</option>
          <option value="false">Needs response</option>
          <option value="true">Responded</option>
        </select>
      </div>

      {loading && <p className="text-sm text-gray-400 animate-pulse">Loading…</p>}

      {!loading && data?.data.length === 0 && (
        <p className="text-gray-400 text-sm py-8 text-center">No reviews match your filters.</p>
      )}

      <div className="space-y-3">
        {data?.data.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-center pt-2">
          <button
            disabled={filters.page <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {filters.page} of {totalPages}
          </span>
          <button
            disabled={filters.page >= totalPages}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
