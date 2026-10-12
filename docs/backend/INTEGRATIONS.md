# Provider boundaries

Provider interfaces live in `src/server/integrations.ts`: `MediaService`, `LiveClassProvider`, and `PaymentProvider`. Their current implementations return `503 PROVIDER_NOT_CONFIGURED`. The backend does not generate fake signed media URLs, room tokens, checkouts or payment confirmations.

| Provider | Existing contract | Required implementation and verification |
| --- | --- | --- |
| Private media | Upload URL, short-lived access URL, deletion, metadata | Choose object storage and transcoding; validate content type/size, enforce course ownership and enrollment, rotate signing keys, test expiry/revocation and deletion. |
| Live room | Create room, issue short-lived role token, end room | Connect a streaming/meeting vendor, verify provider webhooks, bind room to stored class status, enforce learner eligibility and instructor privileges. |
| Payment | Create checkout, verify webhook | Choose checkout provider, store provider references, verify signed idempotent webhooks, grant enrollment only after verified settlement, handle refunds and reconciliation. |
| Notifications | Persisted records in `notifications` | Add an outbound email/push adapter with templates, preferences, retries and delivery status. |
| Realtime chat | SQLite stored messages and moderation route | Add authenticated realtime fanout/presence, reconnect replay, rate limiting and durable Q&A/poll models. |

Provider credentials are intentionally absent. `MEDIA_PROVIDER`, `LIVE_PROVIDER`, `PAYMENT_PROVIDER`, and `EMAIL_PROVIDER` in `.env.example` currently document disabled configuration; setting them alone does not activate an integration.
