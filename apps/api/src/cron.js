import cron from 'node-cron';
import { scrapeAll } from './scraper.js';

export function startCron() {
  // Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('[cron] starting scheduled scrape');
    try {
      await scrapeAll();
      console.log('[cron] scrape complete');
    } catch (err) {
      console.error('[cron] scrape failed:', err.message);
    }
  });

  console.log('[cron] scheduler started — running every 6 hours');
}
