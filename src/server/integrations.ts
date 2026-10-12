import "server-only";
import { ApiError } from "@/server/api";

export interface MediaService {
  createUploadUrl(input: { storageKey: string; mimeType: string; sizeBytes: number }): Promise<{ url: string; headers?: Record<string, string> }>;
  getMediaUrl(storageKey: string): Promise<{ url: string; expiresAt: string }>;
  deleteMedia(storageKey: string): Promise<void>;
  getMediaMetadata(storageKey: string): Promise<{ mimeType: string; sizeBytes: number; durationSeconds: number | null }>;
}

export interface LiveClassProvider {
  createRoom(classId: string): Promise<{ providerRoomId: string }>;
  createJoinToken(roomId: string, userId: string, role: "instructor" | "participant"): Promise<{ token: string; expiresAt: string }>;
  endRoom(roomId: string): Promise<void>;
}

export interface PaymentProvider {
  createCheckout(orderId: string, amountMinor: number, currency: string): Promise<{ url: string; providerReference: string }>;
  verifyWebhook(payload: Uint8Array, signature: string): Promise<{ providerPaymentId: string; orderId: string; paid: boolean }>;
}

function unavailable(feature: string): never {
  throw new ApiError(503, "PROVIDER_NOT_CONFIGURED", `${feature} is not configured. This action is unavailable.`);
}

export const mediaService: MediaService = {
  async createUploadUrl() { return unavailable("Private media storage"); },
  async getMediaUrl() { return unavailable("Private media storage"); },
  async deleteMedia() { return unavailable("Private media storage"); },
  async getMediaMetadata() { return unavailable("Private media storage"); },
};

export const liveProvider: LiveClassProvider = {
  async createRoom() { return unavailable("Live streaming"); },
  async createJoinToken() { return unavailable("Live streaming"); },
  async endRoom() { return unavailable("Live streaming"); },
};

export const paymentProvider: PaymentProvider = {
  async createCheckout() { return unavailable("Payments"); },
  async verifyWebhook() { return unavailable("Payments"); },
};
