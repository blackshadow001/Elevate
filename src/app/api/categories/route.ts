import { safeCached } from "@/server/api";
import { listCatalogCategories } from "@/server/catalogCategories";

export async function GET() { return safeCached(() => listCatalogCategories(), 60, 300); }
