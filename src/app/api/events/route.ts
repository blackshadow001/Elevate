import { safe } from "@/server/api";
import { listEvents } from "@/server/events";
export async function GET() { return safe(() => listEvents()); }
