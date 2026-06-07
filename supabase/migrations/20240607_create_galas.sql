CREATE TYPE gala_status AS ENUM ('scheduled','completed','cancelled');

CREATE TABLE galas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  date date NOT NULL,
  time time NOT NULL,
  status gala_status NOT NULL DEFAULT 'scheduled',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Reuse the set_timestamp function created in participants migration
CREATE TRIGGER set_timestamp_on_galas
BEFORE UPDATE ON galas
FOR EACH ROW EXECUTE FUNCTION set_timestamp();
