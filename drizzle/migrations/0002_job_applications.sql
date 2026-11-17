-- Application tracker: one row per job a user saves or applies to,
-- with the tailored resume version used for it.
CREATE TABLE IF NOT EXISTS job_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  job_url TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'saved',
  job_description TEXT,
  resume_text TEXT,
  structured_resume TEXT,
  ats_score INTEGER,
  keyword_score INTEGER,
  notes TEXT,
  applied_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_job_applications_user ON job_applications(user_id, updated_at DESC);
