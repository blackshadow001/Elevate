import { currentUser } from "@/server/auth";
import { beginGoogleFlow, googleConfig } from "@/server/googleOAuth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const intent = url.searchParams.get("intent") === "link" ? "link" : "login";
  if (intent === "link") {
    const user = await currentUser();
    if (!user || user.role === "admin") return Response.redirect(new URL("/login?google_error=link_login", url), 303);
  }
  try {
    const host = request.headers.get("host") || request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || url.host;
    const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || url.protocol.slice(0, -1);
    if (`${protocol}://${host}` !== new URL(googleConfig().redirectUri).origin) {
      return Response.redirect(new URL("/login?google_error=origin", `${protocol}://${host}`), 303);
    }
    const authUrl = await beginGoogleFlow(intent);
    return Response.redirect(authUrl, 303);
  } catch {
    return Response.redirect(new URL("/login?google_error=configuration", url), 303);
  }
}
