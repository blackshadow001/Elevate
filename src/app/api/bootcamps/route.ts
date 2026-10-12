import { safe } from "@/server/api";
import { listBootcamps } from "@/server/bootcamps";
export async function GET() { return safe(() => listBootcamps()); }
