import { readJson, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { createCatalogCategory, listCatalogCategories } from "@/server/catalogCategories";

export async function GET() {
  return safe(async () => { await requireRole("admin"); return listCatalogCategories(); });
}

export async function POST(request: Request) {
  return safe(async () => {
    const admin = await requireRole("admin");
    return createCatalogCategory(admin.id, await readJson(request));
  });
}
