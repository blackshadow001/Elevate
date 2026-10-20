import { safe } from "@/server/api";
import { razorpayConfigured } from "@/server/razorpayGateway";
export async function GET() { return safe(async () => ({ checkoutAvailable: razorpayConfigured() })); }
