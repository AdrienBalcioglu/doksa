# Doksa — App Store & Google Play Review Monitor

Monitor your iOS and Android app reviews in one place. Get alerted via Slack or email when low-rated reviews arrive.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS |
| Backend | Node.js (ESM) + Express |
| Database | Supabase (Postgres) |
| Scraping | app-store-scraper + google-play-scraper |
| Scheduler | node-cron (every 6 hours) |
| Email alerts | Resend |
| Slack alerts | Incoming webhooks |

## Project structure

```
doksa/
├── apps/
│   ├── web/          # Next.js 14 frontend (port 3000)
│   └── api/          # Node.js backend (port 3001)
└── supabase/
    └── migrations/   # SQL schema + seed data
```

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/migrations/001_initial.sql` to create the schema.
3. Optionally run `supabase/migrations/002_seed.sql` to load demo data.
4. Copy your **Project URL** and **service_role key** (Settings → API).

### 2. Resend (email alerts)

1. Sign up at [resend.com](https://resend.com) and create an API key.
2. Verify a sending domain (or use the sandbox for testing).

### 3. Environment variables

Copy `.env.example` and fill in the values:

```bash
# Root (for reference)
cp .env.example .env

# API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your Supabase URL + service key + Resend key

# Web
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your Supabase URL + anon key
```

### 4. Install dependencies

```bash
npm install --workspaces
# or individually:
cd apps/api && npm install
cd apps/web && npm install
```

### 5. Run

```bash
# Terminal 1 — API (includes cron)
cd apps/api && npm run dev

# Terminal 2 — Frontend
cd apps/web && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/apps` | List all tracked apps |
| `POST` | `/apps` | Add a new app |
| `GET` | `/apps/:id/reviews` | Paginated reviews (filters: `rating`, `platform`, `responded`, `page`, `limit`) |
| `PATCH` | `/reviews/:id` | Mark as responded, save response text |
| `GET` | `/dashboard/stats` | Avg rating, total, this week, by platform |
| `GET` | `/alerts` | List alerts |
| `POST` | `/alerts` | Create an alert |
| `PATCH` | `/alerts/:id` | Update an alert |
| `GET` | `/health` | Health check |

## Cron schedule

The scraper runs every 6 hours automatically when the API server is running (`0 */6 * * *`). To trigger a manual scrape, restart the server or add a `POST /scrape` endpoint.

## Database schema

```sql
users       — id, email, created_at
apps        — id, user_id, name, app_store_id, play_store_id, created_at
reviews     — id, app_id, platform, review_id, author, rating, body,
              responded, response_text, reviewed_at, created_at
              UNIQUE (review_id, platform)
alerts      — id, app_id, user_id, channel, webhook_url, email, min_rating, active
```
