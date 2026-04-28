const BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export type App = {
  id: string;
  user_id: string;
  name: string;
  app_store_id: string | null;
  play_store_id: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  app_id: string;
  platform: 'app_store' | 'play_store';
  review_id: string;
  author: string | null;
  rating: number;
  body: string | null;
  responded: boolean;
  response_text: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Stats = {
  avg_rating: number | null;
  total_reviews: number;
  reviews_this_week: number;
  by_platform: Record<string, number>;
  rating_distribution: Record<number, number>;
};

export type ReviewsResponse = {
  data: Review[];
  total: number;
  page: number;
  limit: number;
};

export const api = {
  getApps: () => request<App[]>('/apps'),

  addApp: (body: { name: string; app_store_id?: string; play_store_id?: string }) =>
    request<App>('/apps', { method: 'POST', body: JSON.stringify(body) }),

  getReviews: (appId: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<ReviewsResponse>(`/apps/${appId}/reviews${qs}`);
  },

  markResponded: (reviewId: string, responded: boolean, response_text?: string) =>
    request<Review>(`/reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify({ responded, response_text }),
    }),

  getStats: () => request<Stats>('/dashboard/stats'),
};
