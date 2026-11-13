import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import appsRouter from './routes/apps.js';
import reviewsRouter from './routes/reviews.js';
import dashboardRouter from './routes/dashboard.js';
import alertsRouter from './routes/alerts.js';
import { startCron } from './cron.js';
import { scrapeAll, scrapeApp } from './scraper.js';
import supabase from './lib/supabase.js';
import { rateLimit } from './middleware/rateLimit.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

// Only the listed origins may call the API from a browser.
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({ windowMs: 60_000, max: Number(process.env.RATE_LIMIT_PER_MINUTE) || 120 }));

// Writes and scrapes cost more (store requests, emails): stricter limit.
const writeLimit = rateLimit({ windowMs: 60_000, max: Number(process.env.WRITE_LIMIT_PER_MINUTE) || 10 });
app.use((req, res, next) => (req.method === 'GET' ? next() : writeLimit(req, res, next)));

app.use('/apps', appsRouter);
app.use('/reviews', reviewsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/alerts', alertsRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

// Manual scrape trigger
app.post('/scrape', async (req, res) => {
  const { app_id } = req.body ?? {};
  if (app_id) {
    const { data: appRow, error } = await supabase.from('apps').select('*').eq('id', app_id).single();
    if (error || !appRow) return res.status(404).json({ error: 'app not found' });
    const newReviews = await scrapeApp(appRow);
    return res.json({ app: appRow.name, new_reviews: newReviews.length });
  }
  const results = await scrapeAll();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
  startCron();
});
