import { safe } from "@/server/api";
import { listLiveClasses } from "@/server/live";

export async function GET() { return safe(() => listLiveClasses()); }
