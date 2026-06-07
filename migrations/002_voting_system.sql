-- 002_voting_system.sql
-- Migration for Drag Star voting system
-- Run with: supabase db push

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: admins (for RLS example)
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: participants
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid REFERENCES competition_stages(id) ON DELETE SET NULL,
  artist_name text NOT NULL,
  real_name text,
  photo_url text,
  bio text,
  city text,
  social_links jsonb,
  status text CHECK (status IN ('activa','eliminada','finalista','ganadora')) DEFAULT 'activa',
  created_at timestamp with time zone DEFAULT now()
);

-- Table: competition_stages (10 weeks)
CREATE TABLE IF NOT EXISTS competition_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number integer NOT NULL UNIQUE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: vote_settings (single row controlling open/closed)
CREATE TABLE IF NOT EXISTS vote_settings (
  id integer PRIMARY KEY DEFAULT 1,
  is_open boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: votes
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  user_ip inet NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Table: weekly_rankings (materialized view could be used, but simple table)
CREATE TABLE IF NOT EXISTS weekly_rankings (
  week_number integer NOT NULL,
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  vote_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (week_number, participant_id)
);

-- Table: vote_logs (audit of each vote)
CREATE TABLE IF NOT EXISTS vote_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid REFERENCES votes(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES participants(id),
  logged_at timestamp with time zone DEFAULT now()
);

-- Table: audit_logs (general admin actions)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admins(id) ON DELETE SET NULL,
  action text NOT NULL,
  payload jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies (enable row level security)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_rankings ENABLE ROW LEVEL SECURITY;

-- Example policy: allow anyone to read participants and vote settings, but only authenticated admins can insert votes
CREATE POLICY participants_select ON participants FOR SELECT USING (true);
CREATE POLICY vote_settings_select ON vote_settings FOR SELECT USING (true);
CREATE POLICY votes_insert ON votes FOR INSERT WITH CHECK (true); -- public voting via ip

-- Trigger to update weekly rankings after insert vote
CREATE OR REPLACE FUNCTION update_weekly_ranking() RETURNS trigger AS $$
DECLARE
  current_week integer;
BEGIN
  SELECT week_number INTO current_week FROM competition_stages WHERE is_active = true LIMIT 1;
  IF current_week IS NULL THEN
    RETURN NEW; -- no active week, ignore
  END IF;
  INSERT INTO weekly_rankings (week_number, participant_id, vote_count)
    VALUES (current_week, NEW.participant_id, 1)
    ON CONFLICT (week_number, participant_id) DO UPDATE SET vote_count = weekly_rankings.vote_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_ranking AFTER INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION update_weekly_ranking();

-- Trigger to log vote insertion
CREATE OR REPLACE FUNCTION log_vote() RETURNS trigger AS $$
BEGIN
  INSERT INTO vote_logs (vote_id, participant_id) VALUES (NEW.id, NEW.participant_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_vote AFTER INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION log_vote();

-- Insert a default row into vote_settings
INSERT INTO vote_settings (id, is_open) VALUES (1, false) ON CONFLICT (id) DO NOTHING;

-- Insert initial competition stages (weeks 1-10)
DO $$
DECLARE i integer := 1;
BEGIN
  WHILE i <= 10 LOOP
    INSERT INTO competition_stages (week_number, start_date, end_date, is_active)
    VALUES (i, (CURRENT_DATE + ((i-1)*7) * INTERVAL '1 day'), (CURRENT_DATE + (i*7 -1) * INTERVAL '1 day'), i = 1)
    ON CONFLICT (week_number) DO UPDATE SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;
    i := i + 1;
  END LOOP;
END $$;

-- End of migration
