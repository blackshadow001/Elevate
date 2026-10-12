import { safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { instructorStudents } from "@/server/analytics";
export async function GET() { return safe(async () => instructorStudents(await requireAnyRole(["instructor", "admin"]))); }
