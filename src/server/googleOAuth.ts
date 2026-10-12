import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { OAuth2Client } from "google-auth-library";
import { cookies } from "next/headers";
import { ApiError } from "@/server/api";

const FLOW_COOKIE = "elevate_google_oauth";
const FLOW_SECONDS = 10 * 60;
const CALLBACK_PATH = "/api/auth/google/callback";

type Flow = { state: string; nonce: string; verifier: string; intent: "login" | "link" };

export function googleConfig() {
  let fileCredentials: { web?: { client_id?: string; client_secret?: string } } = {};
  if (process.env.GOOGLE_CREDENTIALS_FILE) {
    try { fileCredentials = JSON.parse(readFileSync(process.env.GOOGLE_CREDENTIALS_FILE, "utf8")); }
    catch { throw new ApiError(503, "GOOGLE_NOT_CONFIGURED", "Google credentials file is unavailable."); }
  }
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || fileCredentials.web?.client_id;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || fileCredentials.web?.client_secret;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (!clientId || !clientSecret || !redirectUri) {
    throw new ApiError(503, "GOOGLE_NOT_CONFIGURED", "Google sign-in is not configured yet.");
  }
  let callback: URL;
  try { callback = new URL(redirectUri); }
  catch { throw new ApiError(503, "GOOGLE_NOT_CONFIGURED", "Google sign-in callback is invalid."); }
  if (callback.pathname !== CALLBACK_PATH || callback.search || callback.hash ||
      (callback.protocol !== "https:" && !(callback.protocol === "http:" && ["localhost", "127.0.0.1"].includes(callback.hostname)))) {
    throw new ApiError(503, "GOOGLE_NOT_CONFIGURED", "Google sign-in callback must use HTTPS or local development HTTP.");
  }
  return { clientId, clientSecret, redirectUri };
}

function client() {
  const { clientId, clientSecret, redirectUri } = googleConfig();
  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

export async function beginGoogleFlow(intent: Flow["intent"]) {
  const { clientId, redirectUri } = googleConfig();
  const state = randomBytes(32).toString("base64url");
  const nonce = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const flow: Flow = { state, nonce, verifier, intent };
  (await cookies()).set(FLOW_COOKIE, Buffer.from(JSON.stringify(flow)).toString("base64url"), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && !redirectUri.startsWith("http://"),
    path: "/", maxAge: FLOW_SECONDS,
  });
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  for (const [key, value] of Object.entries({ client_id: clientId, redirect_uri: redirectUri,
    response_type: "code", scope: "openid email profile", state, nonce,
    code_challenge: challenge, code_challenge_method: "S256" })) authUrl.searchParams.set(key, value);
  return authUrl;
}

export async function consumeGoogleFlow(returnedState: string): Promise<Flow> {
  const store = await cookies();
  const raw = store.get(FLOW_COOKIE)?.value;
  store.delete(FLOW_COOKIE);
  if (!raw || !returnedState) throw new ApiError(400, "GOOGLE_STATE_INVALID", "Google sign-in expired. Please try again.");
  let flow: Flow;
  try { flow = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Flow; }
  catch { throw new ApiError(400, "GOOGLE_STATE_INVALID", "Google sign-in expired. Please try again."); }
  if (typeof flow.state !== "string" || typeof flow.nonce !== "string" || typeof flow.verifier !== "string" ||
      !["login", "link"].includes(flow.intent) ||
      Buffer.byteLength(flow.state) !== Buffer.byteLength(returnedState) ||
      !timingSafeEqual(Buffer.from(flow.state), Buffer.from(returnedState))) {
    throw new ApiError(400, "GOOGLE_STATE_INVALID", "Google sign-in expired. Please try again.");
  }
  return flow;
}

export async function verifyGoogleCode(code: string, flow: Flow) {
  if (!code || code.length > 2048) throw new ApiError(400, "GOOGLE_CODE_INVALID", "Google did not return a valid authorization code.");
  const oauth = client();
  const { tokens } = await oauth.getToken({ code, codeVerifier: flow.verifier, redirect_uri: googleConfig().redirectUri });
  if (!tokens.id_token) throw new ApiError(401, "GOOGLE_TOKEN_INVALID", "Google did not return an identity token.");
  const ticket = await oauth.verifyIdToken({ idToken: tokens.id_token, audience: googleConfig().clientId });
  const payload = ticket.getPayload();
  if (!payload || payload.nonce !== flow.nonce || !payload.sub || !payload.email || payload.email_verified !== true) {
    throw new ApiError(401, "GOOGLE_TOKEN_INVALID", "Google account identity could not be verified.");
  }
  return { subject: payload.sub, email: payload.email.toLowerCase(), name: payload.name || "Google user",
    authoritativeEmail: /@(?:gmail|googlemail)\.com$/i.test(payload.email) ||
      Boolean(payload.hd && payload.email.toLowerCase().endsWith(`@${payload.hd.toLowerCase()}`)) };
}
