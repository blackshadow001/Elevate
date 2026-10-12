import { ApiError } from "@/server/api";
import { createSession, currentUser } from "@/server/auth";
import { resolveGoogleAccount } from "@/server/googleAccounts";
import { consumeGoogleFlow, googleConfig, verifyGoogleCode } from "@/server/googleOAuth";
import { getDb } from "@/server/db";

function errorCode(error: unknown): string {
  if (error instanceof ApiError) {
    if (["LINK_LOGIN_REQUIRED", "EMAIL_MISMATCH", "GOOGLE_ALREADY_LINKED", "ADMIN_PORTAL_REQUIRED", "ACCOUNT_UNAVAILABLE"].includes(error.code)) return error.code.toLowerCase();
    if (error.code === "GOOGLE_STATE_INVALID") return "state";
  }
  return "failed";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  let publicOrigin = url;
  try { publicOrigin = new URL(googleConfig().redirectUri); }
  catch { /* A missing configuration still returns a readable error on the current host. */ }
  const loginUrl = new URL("/login", publicOrigin);
  try {
    const flow = await consumeGoogleFlow(url.searchParams.get("state") || "");
    if (url.searchParams.has("error")) {
      loginUrl.searchParams.set("google_error", "cancelled");
      return Response.redirect(loginUrl, 303);
    }
    const identity = await verifyGoogleCode(url.searchParams.get("code") || "", flow);
    const current = flow.intent === "link" ? await currentUser() : null;
    const userId = resolveGoogleAccount(identity, flow.intent, current);
    if (flow.intent === "link") {
      loginUrl.searchParams.set("google", "linked");
      return Response.redirect(loginUrl, 303);
    }
    await createSession(userId);
    const role = getDb().prepare("SELECT role FROM users WHERE id=?").get(userId)?.role;
    return Response.redirect(new URL(role === "instructor" ? "/instructor" : "/dashboard", publicOrigin), 303);
  } catch (error) {
    loginUrl.searchParams.set("google_error", errorCode(error));
    return Response.redirect(loginUrl, 303);
  }
}
