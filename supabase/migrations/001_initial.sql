-- Bracket Builder — Initial Schema

CREATE TABLE brackets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  description     text,
  creator_token   text NOT NULL,
  option_count    int NOT NULL,
  bracket_size    int NOT NULL CHECK (bracket_size IN (4, 8, 16, 32)),
  vote_threshold  int NOT NULL DEFAULT 10,
  status          text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('draft', 'active', 'completed')),
  winner_name     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brackets_slug       ON brackets(slug);
CREATE INDEX idx_brackets_status     ON brackets(status);
CREATE INDEX idx_brackets_created_at ON brackets(created_at DESC);

-- ---

CREATE TABLE bracket_options (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bracket_id  uuid NOT NULL REFERENCES brackets(id) ON DELETE CASCADE,
  name        text NOT NULL,
  seed        int NOT NULL,
  image_url   text,
  is_bye      boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bracket_options_bracket_id ON bracket_options(bracket_id);

-- ---

CREATE TABLE matchups (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bracket_id      uuid NOT NULL REFERENCES brackets(id) ON DELETE CASCADE,
  round           int NOT NULL,
  position        int NOT NULL,
  option_a_id     uuid REFERENCES bracket_options(id),
  option_b_id     uuid REFERENCES bracket_options(id),
  votes_a         int NOT NULL DEFAULT 0,
  votes_b         int NOT NULL DEFAULT 0,
  winner_id       uuid REFERENCES bracket_options(id),
  next_matchup_id uuid REFERENCES matchups(id),
  next_slot       text CHECK (next_slot IN ('a', 'b')),
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'active', 'completed')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(bracket_id, round, position)
);

CREATE INDEX idx_matchups_bracket_id ON matchups(bracket_id);
CREATE INDEX idx_matchups_status     ON matchups(status);

-- ---

CREATE TABLE votes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matchup_id  uuid NOT NULL REFERENCES matchups(id) ON DELETE CASCADE,
  option_id   uuid NOT NULL REFERENCES bracket_options(id),
  voter_id    text NOT NULL,
  voter_ip    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(matchup_id, voter_id)
);

CREATE INDEX idx_votes_matchup_id ON votes(matchup_id);
CREATE INDEX idx_votes_voter_id   ON votes(voter_id);
CREATE INDEX idx_votes_voter_ip   ON votes(voter_ip);

-- --- Row Level Security ---

ALTER TABLE brackets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bracket_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchups        ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON brackets        FOR SELECT USING (true);
CREATE POLICY "public read" ON bracket_options FOR SELECT USING (true);
CREATE POLICY "public read" ON matchups        FOR SELECT USING (true);
CREATE POLICY "public read" ON votes           FOR SELECT USING (true);

-- All mutations go through API routes using the service role key.
-- No INSERT/UPDATE/DELETE policies needed for anonymous users.

-- --- Updated-at trigger ---

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER brackets_set_updated_at
  BEFORE UPDATE ON brackets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER matchups_set_updated_at
  BEFORE UPDATE ON matchups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
