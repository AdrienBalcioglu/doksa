import { Router } from 'express';
import supabase from '../lib/supabase.js';

const router = Router();

// The server posts to this URL: only real Slack incoming webhooks are accepted.
function isSlackWebhook(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === 'hooks.slack.com';
  } catch {
    return false;
  }
}

function isEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

router.get('/', async (req, res) => {
  const { app_id, user_id } = req.query;
  let query = supabase.from('alerts').select('*');
  if (app_id) query = query.eq('app_id', app_id);
  if (user_id) query = query.eq('user_id', user_id);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const { app_id, user_id, channel, webhook_url, email, min_rating, active } = req.body;
  if (!app_id || !user_id || !channel) {
    return res.status(400).json({ error: 'app_id, user_id, and channel are required' });
  }
  if (channel === 'slack' && !webhook_url) {
    return res.status(400).json({ error: 'webhook_url is required for slack alerts' });
  }
  if (channel === 'email' && !email) {
    return res.status(400).json({ error: 'email is required for email alerts' });
  }
  if (webhook_url && !isSlackWebhook(webhook_url)) {
    return res.status(400).json({ error: 'webhook_url must be a Slack incoming webhook (https://hooks.slack.com/...)' });
  }
  if (email && !isEmail(email)) {
    return res.status(400).json({ error: 'email is invalid' });
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert({ app_id, user_id, channel, webhook_url, email, min_rating: min_rating ?? 3, active: active ?? true })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { active, webhook_url, email, min_rating } = req.body;
  if (webhook_url && !isSlackWebhook(webhook_url)) {
    return res.status(400).json({ error: 'webhook_url must be a Slack incoming webhook (https://hooks.slack.com/...)' });
  }
  if (email && !isEmail(email)) {
    return res.status(400).json({ error: 'email is invalid' });
  }
  const updates = {};
  if (typeof active === 'boolean') updates.active = active;
  if (webhook_url !== undefined) updates.webhook_url = webhook_url;
  if (email !== undefined) updates.email = email;
  if (min_rating !== undefined) updates.min_rating = min_rating;

  const { data, error } = await supabase.from('alerts').update(updates).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'alert not found' });
  res.json(data);
});

export default router;
