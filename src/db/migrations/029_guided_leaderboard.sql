CREATE TABLE guided_leaderboard_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  show_name INTEGER NOT NULL DEFAULT 0 CHECK(show_name IN (0,1))
);

CREATE INDEX guided_step_progress_passed_idx ON guided_step_progress(step_id,user_id) WHERE passed=1;
