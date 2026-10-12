import { randomUUID } from "node:crypto";
import { ApiError, json, readJson, safe, text } from "@/server/api";
import { createSession, hashPassword, publicUser } from "@/server/auth";
import { getDb } from "@/server/db";
import { rateLimit } from "@/server/rateLimit";


export async function POST(request: Request) {
  return safe(async () => {
    const body = await readJson(request);
    const name = text(body.name, "Name", 2, 160);
    const email = text(body.email, "Email", 5, 254).toLowerCase();
    const password = text(body.password, "Password", 8, 128);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(422, "INVALID_EMAIL", "Enter a valid email address.");
    rateLimit(`register:${email}`, 5);
    const db = getDb();
    if (db.prepare("SELECT 1 FROM users WHERE email=?").get(email)) throw new ApiError(409, "EMAIL_EXISTS", "An account with this email already exists.");
    const id = randomUUID();
    try {
      db.prepare("INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)")
        .run(id, name, email, hashPassword(password), "learner");
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE")) throw new ApiError(409, "EMAIL_EXISTS", "An account with this email already exists.");
      throw error;
    }
    await createSession(id);
    return json(publicUser(db.prepare("SELECT id,name,email,role,avatar FROM users WHERE id=?").get(id)!), 201);
  });
}
