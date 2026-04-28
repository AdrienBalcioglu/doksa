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

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

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
