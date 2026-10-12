import { ApiError, id, json, readJson, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { createOrder } from "@/server/orders";
export async function POST(request: Request) {
  return safe(async () => {
    const user = await requireAuth();
    const body = await readJson(request);
    if (typeof body.courseId !== "string") throw new ApiError(422, "INVALID_INPUT", "courseId is required.");
    return json(createOrder(id(body.courseId), user), 201);
  });
}
