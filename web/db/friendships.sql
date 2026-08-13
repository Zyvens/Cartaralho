CREATE TABLE IF NOT EXISTS friendships (
  id BIGSERIAL PRIMARY KEY,
  user_a BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN('pending','accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK(user_a < user_b),
  UNIQUE(user_a,user_b)
);
CREATE INDEX IF NOT EXISTS idx_friendships_a_status ON friendships(user_a,status);
CREATE INDEX IF NOT EXISTS idx_friendships_b_status ON friendships(user_b,status);
CREATE INDEX IF NOT EXISTS idx_friendships_requested_by ON friendships(requested_by,status);
