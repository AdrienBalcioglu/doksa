import { Router } from 'express';
import supabase from '../lib/supabase.js';

const router = Router();

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

router.get('/stats', async (req, res) => {
  // Fetch all app IDs for this user
  const { data: apps, error: appsError } = await supabase
    .from('apps')
    .select('id')
    .eq('user_id', DEMO_USER_ID);

  if (appsError) return res.status(500).json({ error: appsError.message });

  const appIds = apps.map((a) => a.id);
  if (!appIds.length) return res.json({ avg_rating: null, total_reviews: 0, reviews_this_week: 0, by_platform: {} });

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [allReviews, weekReviews] = await Promise.all([
    supabase.from('reviews').select('rating, platform').in('app_id', appIds),
    supabase.from('reviews').select('id').in('app_id', appIds).gte('reviewed_at', oneWeekAgo),
  ]);

  if (allReviews.error) return res.status(500).json({ error: allReviews.error.message });

  const reviews = allReviews.data ?? [];
  const total = reviews.length;
  const avg_rating = total ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : null;

  const by_platform = reviews.reduce((acc, r) => {
    acc[r.platform] = (acc[r.platform] ?? 0) + 1;
    return acc;
  }, {});

  const rating_distribution = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] ?? 0) + 1;
    return acc;
  }, {});

  res.json({
    avg_rating: avg_rating ? Math.round(avg_rating * 10) / 10 : null,
    total_reviews: total,
    reviews_this_week: weekReviews.data?.length ?? 0,
    by_platform,
    rating_distribution,
  });
});

export default router;
