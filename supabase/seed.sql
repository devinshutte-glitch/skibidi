-- Seed initial user profiles for Skibidi app
-- Run AFTER 001_initial_schema.sql
-- NOTE: PINs are set to '0000' by default — each user must change on first login
-- bcrypt hash of '0000' with 10 rounds

-- Ruby (13 years old, coral theme)
INSERT INTO users (id, name, role, pin_hash, avatar, age, colour_theme)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Ruby',
  'child',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- placeholder hash, set real PIN on first login
  'surfer_girl',
  13,
  'coral'
) ON CONFLICT DO NOTHING;

-- Eli (10 years old, ocean theme)
INSERT INTO users (id, name, role, pin_hash, avatar, age, colour_theme)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Eli',
  'child',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- placeholder hash
  'surfer_boy',
  10,
  'ocean'
) ON CONFLICT DO NOTHING;

-- Dad (parent, admin access)
INSERT INTO users (id, name, role, pin_hash, avatar, age, colour_theme)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Dad',
  'parent',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- placeholder hash
  'dad_icon',
  NULL,
  'palm'
) ON CONFLICT DO NOTHING;

-- Initialize streaks
INSERT INTO streaks (user_id, current_streak, longest_streak)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 0, 0),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 0, 0)
ON CONFLICT (user_id) DO NOTHING;
