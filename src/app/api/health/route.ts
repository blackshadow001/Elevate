import { connection } from "next/server";
import { getDb } from "@/server/db";

export async function GET() {
  await connection();
  const headers = { "Cache-Control": "no-store" };
  try {
    getDb().prepare("SELECT 1").get();
    return Response.json({ status: "ok" }, { headers });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503, headers });
  }
}
