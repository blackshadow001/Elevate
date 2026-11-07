import "server-only";

import { randomUUID } from "node:crypto";
import { ApiError } from "@/server/api";
import { recordAdminAction } from "@/server/adminAudit";
import { getDb, transaction } from "@/server/db";
import { catalogCategory } from "@/lib/catalogTaxonomy";

export type CatalogCategory = {
  id: string;
  name: string;
  subcategories: string[];
  courseCount: number;
  publishedCount: number;
};

export function listCatalogCategories(): CatalogCategory[] {
  return getDb().prepare(`SELECT t.id,t.name,t.subcategories_json,
    (SELECT COUNT(*) FROM courses c WHERE c.category=t.name) course_count,
    (SELECT COUNT(*) FROM courses c WHERE c.category=t.name AND c.status='published' AND c.review_status='approved') published_count
    FROM catalog_categories t ORDER BY t.position,t.created_at,t.id`).all().map((row) => ({
      id: String(row.id), name: String(row.name), subcategories: JSON.parse(String(row.subcategories_json)) as string[],
      courseCount: Number(row.course_count), publishedCount: Number(row.published_count),
    }));
}

export function requireCatalogCategory(value: unknown): string {
  const name = typeof value === "string" ? value.trim() : "";
  const direct = name ? getDb().prepare("SELECT name FROM catalog_categories WHERE name=? COLLATE NOCASE").get(name) : null;
  const row = direct || (name ? getDb().prepare("SELECT name FROM catalog_categories WHERE name=? COLLATE NOCASE").get(catalogCategory(name)) : null);
  if (!row)
    throw new ApiError(422, "INVALID_CATEGORY", "Choose a category from the catalog.");
  return String(row.name);
}

export function requireCatalogSubcategory(category: string, value: unknown): string {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name) return "";
  const row = getDb().prepare("SELECT subcategories_json FROM catalog_categories WHERE name=?").get(category);
  const options = row ? JSON.parse(String(row.subcategories_json)) as string[] : [];
  if (!options.includes(name)) throw new ApiError(422, "INVALID_SUBCATEGORY", "Choose a subcategory within the selected category.");
  return name;
}

function categoryName(value: unknown): string {
  const name = typeof value === "string" ? value.trim() : "";
  if (name.length < 2 || name.length > 80) throw new ApiError(422, "INVALID_CATEGORY", "Category name must be 2–80 characters.");
  return name;
}

function subcategoryNames(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 20) throw new ApiError(422, "INVALID_SUBCATEGORIES", "Provide up to 20 subcategories.");
  const names = value.map((item) => typeof item === "string" ? item.trim() : "");
  if (names.some((name) => name.length < 2 || name.length > 80) || new Set(names.map((name) => name.toLowerCase())).size !== names.length)
    throw new ApiError(422, "INVALID_SUBCATEGORIES", "Use distinct subcategory names of 2–80 characters.");
  return names;
}

export function createCatalogCategory(actorId: string, body: Record<string, unknown>) {
  const name = categoryName(body.name);
  const subcategories = subcategoryNames(body.subcategories ?? []);
  return transaction((db) => {
    if (db.prepare("SELECT 1 FROM catalog_categories WHERE name=? COLLATE NOCASE").get(name))
      throw new ApiError(409, "CATEGORY_EXISTS", "This category already exists.");
    const id = randomUUID();
    const position = Number(db.prepare("SELECT COALESCE(MAX(position),-1)+1 next_position FROM catalog_categories").get()?.next_position);
    db.prepare("INSERT INTO catalog_categories(id,name,subcategories_json,position) VALUES (?,?,?,?)")
      .run(id, name, JSON.stringify(subcategories), position);
    recordAdminAction(db, { actorId, action: "category_created", entityType: "category", entityId: id,
      changes: { name, subcategories } });
    return { id, name, subcategories };
  });
}

export function updateCatalogCategory(actorId: string, id: string, body: Record<string, unknown>) {
  const name = categoryName(body.name);
  const subcategories = subcategoryNames(body.subcategories);
  return transaction((db) => {
    const previous = db.prepare("SELECT name,subcategories_json FROM catalog_categories WHERE id=?").get(id);
    if (!previous) throw new ApiError(404, "CATEGORY_NOT_FOUND", "Category not found.");
    if (db.prepare("SELECT 1 FROM catalog_categories WHERE name=? COLLATE NOCASE AND id<>?").get(name, id))
      throw new ApiError(409, "CATEGORY_EXISTS", "This category already exists.");
    const before = { name: String(previous.name), subcategories: JSON.parse(String(previous.subcategories_json)) as string[] };
    const removed = before.subcategories.filter((item) => !subcategories.includes(item));
    if (removed.length) {
      const courses = db.prepare("SELECT metadata_json FROM courses WHERE category=?").all(before.name);
      if (courses.some((course) => {
        try { return removed.includes(String((JSON.parse(String(course.metadata_json || "{}")) as Record<string, unknown>).subcategory || "")); }
        catch { return false; }
      })) throw new ApiError(409, "SUBCATEGORY_IN_USE", "A course uses a removed subcategory. Move that course first.");
    }
    db.prepare("UPDATE catalog_categories SET name=?,subcategories_json=?,updated_at=? WHERE id=?")
      .run(name, JSON.stringify(subcategories), new Date().toISOString(), id);
    if (before.name !== name) db.prepare("UPDATE courses SET category=? WHERE category=?").run(name, before.name);
    recordAdminAction(db, { actorId, action: "category_updated", entityType: "category", entityId: id,
      changes: { before, after: { name, subcategories } } });
    return { id, name, subcategories };
  });
}
