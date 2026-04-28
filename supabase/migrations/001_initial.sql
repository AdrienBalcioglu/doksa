create extension if not exists "uuid-ossp";

create table users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table apps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  app_store_id text,
  play_store_id text,
  created_at timestamptz not null default now(),
  constraint apps_has_at_least_one_store check (app_store_id is not null or play_store_id is not null)
);

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  app_id uuid not null references apps(id) on delete cascade,
  platform text not null check (platform in ('app_store', 'play_store')),
  review_id text not null,
  author text,
  rating int not null check (rating between 1 and 5),
  body text,
  responded boolean not null default false,
  response_text text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reviews_unique_per_platform unique (review_id, platform)
);

create table alerts (
  id uuid primary key default uuid_generate_v4(),
  app_id uuid not null references apps(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  channel text not null check (channel in ('slack', 'email')),
  webhook_url text,
  email text,
  min_rating int not null default 3 check (min_rating between 1 and 5),
  active boolean not null default true
);

create index reviews_app_id_idx on reviews(app_id);
create index reviews_platform_idx on reviews(platform);
create index reviews_rating_idx on reviews(rating);
create index reviews_responded_idx on reviews(responded);
create index alerts_app_id_idx on alerts(app_id);
