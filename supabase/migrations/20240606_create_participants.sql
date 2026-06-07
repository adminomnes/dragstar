CREATE TYPE participant_status AS ENUM ('active', 'deleted', 'finalist', 'winner');

CREATE TABLE participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_name varchar NOT NULL,
  real_name varchar,
  city varchar,
  biography text,
  social_links jsonb,
  photo_url varchar,
  gallery jsonb,
  video_url varchar,
  status participant_status NOT NULL DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- trigger to update updated_at
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_on_participants
BEFORE UPDATE ON participants
FOR EACH ROW EXECUTE FUNCTION set_timestamp();
