# Provider boundaries

The tutor builder now streams MP4/WebM lesson videos (up to 1 GB each) to a private local directory, defaulting to `media` beside the SQLite database or `MEDIA_STORAGE_DIR` when set. A saved lesson references the asset in SQLite. Authorized requests stream byte ranges for playback; the URL itself is not a public or expiring signed URL. Keep the disk and database on the same durable deployment, back both up together, and allow the request size and duration at the reverse proxy. This is a single-server implementation without transcoding, resumable uploads, CDN delivery, or verified watched-video completion. A cloud media provider remains a separate future integration.

Media and live-room provider interfaces live in `src/server/integrations.ts` and return `503 PROVIDER_NOT_CONFIGURED` without configured implementations. Paid-course checkout is implemented separately in `src/server/razorpayGateway.ts` and `src/server/payments.ts` using the official Razorpay SDK. It remains disabled when credentials are absent. A real Razorpay Test Mode charge and webhook have not been verified in this environment.

| Provider | Existing contract | Required implementation and verification |
| --- | --- | --- |
| Private media | Local streamed upload, stored asset and lesson association, authenticated range playback | For multi-instance/cloud deployment, add object storage, transcoding, resumable transfer and CDN delivery; verify expiry/revocation and deletion. The legacy provider URL interface still returns 503. |
| Live room | Create room, issue short-lived role token, end room | Connect a streaming/meeting vendor, verify provider webhooks, bind room to stored class status, enforce learner eligibility and instructor privileges. |
| Razorpay paid courses | Server order, Standard Checkout, signed callback and raw-body webhook, captured-payment verification, idempotent enrollment, pending-order reconciliation | Configure Test Mode keys and webhook; verify a real provider transaction before live rollout. Refund initiation, payout accounting and paid event registration are outside this integration. |
| Notifications | Persisted records in `notifications` | Add an outbound email/push adapter with templates, preferences, retries and delivery status. |
| Realtime chat | SQLite stored messages and moderation route | Add authenticated realtime fanout/presence, reconnect replay, rate limiting and durable Q&A/poll models. |

Provider credentials are intentionally absent. `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` enable the Razorpay path when configured. `MEDIA_PROVIDER` is a future cloud-provider placeholder and does not control local storage; `LIVE_PROVIDER` and `EMAIL_PROVIDER` also do not activate integrations by themselves. See `QA_PAYMENTS.md` for payment setup and evidence.
