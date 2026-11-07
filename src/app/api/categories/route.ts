import { safe } from "@/server/api";
import { listCatalogCategories } from "@/server/catalogCategories";

export async function GET() { return safe(() => listCatalogCategories()); }
