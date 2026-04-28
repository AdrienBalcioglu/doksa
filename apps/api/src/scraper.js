import appStore from 'app-store-scraper';
import gplay from 'google-play-scraper';
import supabase from './lib/supabase.js';
import { triggerAlerts } from './alerts.js';

async function fetchAppStoreReviews(appStoreId) {
  const pages = await Promise.all(
    [1, 2, 3].map((page) =>
      appStore.reviews({ id: appStoreId, page, sort: appStore.sort.RECENT }).catch(() => [])
    )
  );
  return pages.flat().map((r) => ({
    platform: 'app_store',
    review_id: String(r.id),
    author: r.userName,
    rating: r.score,
    body: r.text,
    reviewed_at: r.updated ? new Date(r.updated).toISOString() : new Date().toISOString(),
  }));
}

async function fetchPlayStoreReviews(playStoreId) {
  const result = await gplay
    .reviews({ appId: playStoreId, num: 100, sort: gplay.sort.NEWEST })
    .catch(() => ({ data: [] }));
  return (result.data ?? []).map((r) => ({
    platform: 'play_store',
    review_id: String(r.id),
    author: r.userName,
    rating: r.score,
    body: r.text,
    reviewed_at: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
  }));
}

async function upsertReviews(appId, reviews) {
  if (!reviews.length) return [];

  const rows = reviews.map((r) => ({ ...r, app_id: appId }));

  // Insert, ignore conflicts on (review_id, platform)
  const { data, error } = await supabase
    .from('reviews')
    .upsert(rows, { onConflict: 'review_id,platform', ignoreDuplicates: true })
    .select();

  if (error) throw error;
  return data ?? [];
}

export async function scrapeApp(app) {
  const newReviews = [];

  if (app.app_store_id) {
    const reviews = await fetchAppStoreReviews(app.app_store_id);
    const inserted = await upsertReviews(app.id, reviews);
    newReviews.push(...inserted);
  }

  if (app.play_store_id) {
    const reviews = await fetchPlayStoreReviews(app.play_store_id);
    const inserted = await upsertReviews(app.id, reviews);
    newReviews.push(...inserted);
  }

  if (newReviews.length) {
    await triggerAlerts(app, newReviews);
  }

  return newReviews;
}

export async function scrapeAll() {
  const { data: apps, error } = await supabase.from('apps').select('*');
  if (error) throw error;

  const results = await Promise.allSettled(apps.map((app) => scrapeApp(app)));

  const summary = [];
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[scraper] failed for app ${apps[i].name}:`, r.reason?.message);
      summary.push({ app: apps[i].name, error: r.reason?.message });
    } else {
      console.log(`[scraper] ${apps[i].name}: ${r.value.length} new reviews`);
      summary.push({ app: apps[i].name, new_reviews: r.value.length });
    }
  });
  return summary;
}
