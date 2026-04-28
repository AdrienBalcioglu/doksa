import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { scrapeApp } from '../scraper.js';

const router = Router();

// Hardcoded demo user for now — replace with auth middleware
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { name, app_store_id, play_store_id } = req.body;

  if (!name) return res.status(400).json({ error: 'name is required' });
  if (!app_store_id && !play_store_id)
    return res.status(400).json({ error: 'at least one of app_store_id or play_store_id is required' });

  const { data, error } = await supabase
    .from('apps')
    .insert({ user_id: DEMO_USER_ID, name, app_store_id, play_store_id })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Scrape synchronously so the response includes the initial review count
  let initialReviews = 0;
  try {
    const reviews = await scrapeApp(data);
    initialReviews = reviews.length;
  } catch (err) {
    console.error('[apps] initial scrape failed:', err.message);
  }

  res.status(201).json({ ...data, initial_reviews: initialReviews });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('apps')
    .delete()
    .eq('id', id)
    .eq('user_id', DEMO_USER_ID);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

router.get('/:id/reviews', async (req, res) => {
  const { id } = req.params;
  const { rating, platform, responded, page = '1', limit = '20' } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .eq('app_id', id)
    .order('reviewed_at', { ascending: false })
    .range(from, to);

  if (rating) query = query.lte('rating', parseInt(rating, 10));
  if (platform) query = query.eq('platform', platform);
  if (responded !== undefined) query = query.eq('responded', responded === 'true');

  const { data, error, count } = await query;

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, total: count, page: pageNum, limit: pageSize });
});

export default router;
