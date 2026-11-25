import { safeCached } from "@/server/api";
import { listCourses } from "@/server/courses";

export async function GET(request: Request) { return safeCached(() => listCourses(new URL(request.url).searchParams), 30, 120); }
