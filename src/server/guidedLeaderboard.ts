import "server-only";
import { ApiError } from "@/server/api";
import { getDb } from "@/server/db";
import type { SessionUser } from "@/server/auth";

type RankRow = {
  user_id: string;
  name: string;
  show_name: number;
  points: number;
  steps: number;
  rank: number;
};

export function guidedLeaderboard(slug: string | null, user: SessionUser | null) {
  const db = getDb();
  if (slug && !db.prepare("SELECT 1 FROM guided_paths WHERE slug=? AND status='published'").get(slug))
    throw new ApiError(404, "PATH_NOT_FOUND", "Learning path not found.");

  // One progress row per learner and step makes scores resistant to repeated submissions.
  const rows = db.prepare(`WITH scores AS (
    SELECT u.id AS user_id,u.name,COALESCE(pref.show_name,0) AS show_name,
      COUNT(*) AS steps,
      SUM(CASE
        WHEN s.block_type IN ('quiz','first_check') THEN 10
        WHEN s.block_type='lab' THEN 8
        WHEN s.block_type IN ('workshop','first_build') THEN 5
        ELSE 2 END) AS points
    FROM guided_step_progress progress
    JOIN guided_steps s ON s.id=progress.step_id
    JOIN guided_paths p ON p.id=s.path_id
    JOIN users u ON u.id=progress.user_id
    LEFT JOIN guided_leaderboard_preferences pref ON pref.user_id=u.id
    WHERE progress.passed=1 AND p.status='published' AND u.status='active' AND u.role='learner'
      AND (? IS NULL OR p.slug=?)
    GROUP BY u.id
  )
  SELECT *, ROW_NUMBER() OVER (ORDER BY points DESC,steps DESC,user_id ASC) AS rank
  FROM scores ORDER BY rank`).all(slug, slug) as RankRow[];

  const present = (row: RankRow) => ({
    rank: row.rank,
    name: row.show_name === 1 || row.user_id === user?.id ? row.name : `Learner ${row.rank}`,
    points: row.points,
    steps: row.steps,
    isYou: row.user_id === user?.id,
    optedIn: row.user_id === user?.id ? row.show_name === 1 : undefined,
  });
  const own = user ? rows.find((row) => row.user_id === user.id) : undefined;
  const preference = user ? db.prepare("SELECT show_name FROM guided_leaderboard_preferences WHERE user_id=?").get(user.id) as { show_name: number } | undefined : undefined;
  return {
    entries: rows.slice(0, 20).map(present),
    yours: own && own.rank > 20 ? present(own) : null,
    totalLearners: rows.length,
    showName: preference?.show_name === 1,
  };
}

export function updateGuidedLeaderboardPreference(user: SessionUser, showName: boolean) {
  if (user.role !== "learner") throw new ApiError(403, "FORBIDDEN", "Only learner accounts can join the leaderboard.");
  getDb().prepare(`INSERT INTO guided_leaderboard_preferences(user_id,show_name) VALUES(?,?)
    ON CONFLICT(user_id) DO UPDATE SET show_name=excluded.show_name`).run(user.id, showName ? 1 : 0);
  return { showName };
}
