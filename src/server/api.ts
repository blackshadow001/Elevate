import "server-only";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

export function json(data: unknown, status = 200): Response {
  return Response.json({ data }, { status, headers: { "Cache-Control": "no-store" } });
}

export function errorResponse(error: unknown): Response {
  unstable_rethrow(error);
  if (error instanceof ApiError) {
    return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  }
  console.error("API request failed", error instanceof Error ? error.message : "unknown");
  return Response.json({ error: { code: "INTERNAL_ERROR", message: "The server could not complete this request. Please try again." } }, { status: 500 });
}

export async function safe<T>(handler: () => Promise<T | Response> | T | Response): Promise<Response> {
  await connection();
  try {
    const result = await handler();
    return result instanceof Response ? result : json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  let parsedOrigin: string | null = null;
  try { parsedOrigin = origin ? new URL(origin).origin : null; }
  catch { throw new ApiError(403, "CSRF_REJECTED", "This request must originate from Elevate."); }
  const requestUrl = new URL(request.url);
  const expectedOrigin = `${requestUrl.protocol}//${request.headers.get("host") || requestUrl.host}`;
  if (site === "cross-site" || (parsedOrigin && parsedOrigin !== expectedOrigin)) {
    throw new ApiError(403, "CSRF_REJECTED", "This request must originate from Elevate.");
  }
}

export async function readJson(request: Request, maxBytes = 65536): Promise<Record<string, unknown>> {
  requireSameOrigin(request);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Send a JSON request body.");
  }
  const size = Number(request.headers.get("content-length") || 0);
  if (size > maxBytes) throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > maxBytes) throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new ApiError(400, "INVALID_JSON", "Request body is not valid JSON."); }
  if (!value || Array.isArray(value) || typeof value !== "object") throw new ApiError(422, "INVALID_INPUT", "A JSON object is required.");
  return value as Record<string, unknown>;
}

export function text(value: unknown, field: string, min = 1, max = 200): string {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) {
    throw new ApiError(422, "INVALID_INPUT", `${field} must contain ${min}–${max} characters.`);
  }
  return value.trim();
}

export function optionalText(value: unknown, field: string, max = 2000): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length > max) throw new ApiError(422, "INVALID_INPUT", `${field} is invalid.`);
  return value.trim();
}

export function number(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new ApiError(422, "INVALID_INPUT", `${field} must be between ${min} and ${max}.`);
  }
  return value;
}

export function id(value: string): string {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(value)) throw new ApiError(422, "INVALID_ID", "Invalid identifier.");
  return value;
}
