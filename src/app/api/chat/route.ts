import { NextRequest } from "next/server";
import { safe, ApiError } from "@/server/api";
import { checkRateLimit } from "@/server/cache";
import { generateChatResponse, type ChatTurn } from "@/server/chatbotRag";

export type { ChatCard } from "@/server/chatbotRag";

interface ChatRequest {
  message?: string;
  history?: unknown;
}

export async function POST(request: NextRequest) {
  return safe(async () => {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";
    if (!checkRateLimit(`chat:${ip}`, 60, 60_000)) {
      throw new ApiError(
        429,
        "RATE_LIMITED",
        "Too many chat requests. Please wait a moment before sending another message."
      );
    }

    const body = (await request.json().catch(() => ({}))) as ChatRequest;
    const rawMessage =
      typeof body.message === "string" ? body.message.trim() : "";
    if (!rawMessage) {
      throw new ApiError(400, "EMPTY_MESSAGE", "Please enter a message.");
    }
    if (rawMessage.length > 500) {
      throw new ApiError(
        400,
        "MESSAGE_TOO_LONG",
        "Please keep your message under 500 characters."
      );
    }

    const history: ChatTurn[] = Array.isArray(body.history)
      ? body.history
          .filter(
            (item): item is ChatTurn =>
              Boolean(item) &&
              typeof item === "object" &&
              ((item as ChatTurn).role === "user" ||
                (item as ChatTurn).role === "assistant") &&
              typeof (item as ChatTurn).text === "string"
          )
          .slice(-8)
      : [];

    return generateChatResponse(rawMessage, history);
  });
}
