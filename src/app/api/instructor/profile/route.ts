import { ApiError, optionalText, readJson, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { getDb } from "@/server/db";

export async function GET() {
  return safe(async () => {
    const user = await requireRole("instructor");
    const profile = getDb().prepare("SELECT headline,bio,updated_at FROM instructor_profiles WHERE user_id=?").get(user.id);
    return { name: user.name, email: user.email, avatar: user.avatar,
      headline: String(profile?.headline || ""), bio: String(profile?.bio || ""), updatedAt: profile?.updated_at || null };
  });
}

export async function PATCH(request: Request) {
  return safe(async () => {
    const user = await requireRole("instructor");
    const body = await readJson(request);
    if (Object.keys(body).some((key) => key !== "headline" && key !== "bio"))
      throw new ApiError(422, "INVALID_INPUT", "Only headline and biography can be changed here.");
    const headline = optionalText(body.headline, "Headline", 120) || "";
    const bio = optionalText(body.bio, "Biography", 2000) || "";
    getDb().prepare(`INSERT INTO instructor_profiles(user_id,headline,bio,updated_at) VALUES (?,?,?,?)
      ON CONFLICT(user_id) DO UPDATE SET headline=excluded.headline,bio=excluded.bio,updated_at=excluded.updated_at`)
      .run(user.id, headline, bio, new Date().toISOString());
    return { headline, bio };
  });
}
