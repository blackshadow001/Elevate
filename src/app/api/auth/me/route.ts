import { safe } from "@/server/api";
import { requireAuth } from "@/server/auth";


export async function GET() { return safe(() => requireAuth()); }
