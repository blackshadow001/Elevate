import { ApiError, readJson, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { getDb } from "@/server/db";

export async function GET() {
  return safe(async () => {
    await requireRole("admin");
    const row = getDb().prepare("SELECT monthly_price_minor,annual_price_minor,updated_at FROM personal_plan_settings WHERE id=1").get();
    return { monthlyPriceMinor: row?.monthly_price_minor ?? null, annualPriceMinor: row?.annual_price_minor ?? null, updatedAt: row?.updated_at ?? null };
  });
}

export async function PUT(request: Request) {
  return safe(async () => {
    const admin = await requireRole("admin");
    const body = await readJson(request);
    const price = (value: unknown, field: string) => {
      if (value === null) return null;
      if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 100 || value > 100_000_000)
        throw new ApiError(422, "INVALID_PRICE", `${field} must be a whole number of paise between ₹1 and ₹10,00,000, or blank.`);
      return value;
    };
    const monthly = price(body.monthlyPriceMinor, "Monthly price");
    const annual = price(body.annualPriceMinor, "Annual price");
    getDb().prepare("UPDATE personal_plan_settings SET monthly_price_minor=?,annual_price_minor=?,updated_by=?,updated_at=? WHERE id=1")
      .run(monthly, annual, admin.id, new Date().toISOString());
    return { monthlyPriceMinor: monthly, annualPriceMinor: annual };
  });
}
