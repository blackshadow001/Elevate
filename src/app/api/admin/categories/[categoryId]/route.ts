import { id, readJson, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { updateCatalogCategory } from "@/server/catalogCategories";

export async function PATCH(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  return safe(async () => {
    const admin = await requireRole("admin");
    return updateCatalogCategory(admin.id, id((await params).categoryId), await readJson(request));
  });
}
