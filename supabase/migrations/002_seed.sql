-- Seed demo data for local development
insert into users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'demo@doksa.io');

insert into apps (id, user_id, name, app_store_id, play_store_id) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Notion', '1232780281', 'notion.id'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Linear', '1469439981', 'io.linear');

insert into alerts (app_id, user_id, channel, email, min_rating) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'email', 'demo@doksa.io', 3),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'email', 'demo@doksa.io', 2);

insert into reviews (app_id, platform, review_id, author, rating, body, responded, reviewed_at) values
  ('00000000-0000-0000-0000-000000000010', 'app_store', 'seed-001', 'Alice', 5, 'Best productivity app ever. Changed how I work.', false, now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000010', 'app_store', 'seed-002', 'Bob', 4, 'Great app, occasionally slow on older devices.', false, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000010', 'app_store', 'seed-003', 'Carol', 2, 'Crashes frequently on my iPad. Very frustrating.', false, now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000010', 'app_store', 'seed-004', 'Dave', 5, 'Worth every penny. Replaced 5 other apps.', true, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000010', 'app_store', 'seed-005', 'Eve', 3, 'Decent but the offline mode is unreliable.', false, now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000010', 'play_store', 'seed-006', 'Frank', 5, 'Incredible. The Android version has caught up.', false, now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000010', 'play_store', 'seed-007', 'Grace', 1, 'Deleted all my notes. Lost months of work. Never again.', false, now() - interval '6 hours'),
  ('00000000-0000-0000-0000-000000000010', 'play_store', 'seed-008', 'Hank', 4, 'Good app. Dark mode is excellent.', false, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000010', 'play_store', 'seed-009', 'Iris', 3, 'UI is beautiful but sync is broken.', false, now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000010', 'play_store', 'seed-010', 'Jack', 5, 'Team collaboration features are top-notch.', true, now() - interval '7 days'),
  ('00000000-0000-0000-0000-000000000011', 'app_store', 'seed-011', 'Karen', 5, 'Linear is perfection. Fast, clean, and powerful.', false, now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000011', 'app_store', 'seed-012', 'Leo', 4, 'Best issue tracker I have ever used. Slight learning curve.', false, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000011', 'app_store', 'seed-013', 'Mia', 5, 'Replaced Jira for our whole team. No regrets.', true, now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000011', 'app_store', 'seed-014', 'Nick', 2, 'Missing a few key integrations we rely on.', false, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000011', 'app_store', 'seed-015', 'Olivia', 5, 'Keyboard shortcuts are amazing. So fast.', false, now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000011', 'play_store', 'seed-016', 'Paul', 4, 'Android app is solid. Notifications could be better.', false, now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000011', 'play_store', 'seed-017', 'Quinn', 3, 'The app sometimes loses state on background.', false, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000011', 'play_store', 'seed-018', 'Rosa', 5, 'Exceptional design. A joy to use every day.', true, now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000011', 'play_store', 'seed-019', 'Sam', 1, 'Cannot log in after last update. Totally broken.', false, now() - interval '12 hours'),
  ('00000000-0000-0000-0000-000000000011', 'play_store', 'seed-020', 'Tina', 4, 'Great tool for remote teams. Wish it had time tracking.', false, now() - interval '6 days');
