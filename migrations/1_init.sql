CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  filename TEXT NOT NULL,
  slug TEXT NOT NULL
);