import { safe } from "@/server/api";
import { listCourses } from "@/server/courses";

export async function GET(request: Request) { return safe(() => listCourses(new URL(request.url).searchParams)); }
