import { safe } from "@/server/api";
import { listGuidedPaths } from "@/server/guidedPaths";

export async function GET(request: Request) {
  return safe(() => listGuidedPaths(new URL(request.url).searchParams.get("view") === "archive" ? "archived" : "published"));
}
