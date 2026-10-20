# Razorpay payment setup and QA — 12 October 2026

## Scope and current evidence

Paid **courses** use Razorpay Standard Checkout. The server creates an internal order from the approved published course price, creates a Razorpay order, and sends only the public key ID, gateway order ID, amount and currency to the browser. A checkout callback alone never grants access. The server checks its stored gateway order ID, the HMAC signature, the provider order's `paid` state, the provider payment's `captured` state, and the exact minor-unit amount/currency before writing payment and enrollment in one SQLite transaction. Signed raw-body webhooks and owner-initiated reconciliation handle a missed callback. Failed or abandoned attempts remain unpaid. Free enrollment is unchanged.

The isolated backend suite uses a process-only replacement for the official SDK; it does **not** prove a Razorpay network transaction. No Razorpay Test Mode credentials or reachable webhook were supplied, so a real charge, callback and provider-delivered webhook remain **BLOCKED**. The browser suite verifies the safely disabled state with no credentials, not a real payment.

| ID | Scenario | Status | Executed evidence or dependency |
| --- | --- | --- | --- |
| PAY-01 | Published paid course creates an authoritative INR order despite forged client price/status | PASS | `npm run test:backend`; payment contract test, 149900 minor units from seed |
| PAY-02 | Anonymous, cross-user and missing-course order access denied | PASS | Backend HTTP payment contract |
| PAY-03 | Checkout order uses stored amount and retry reuses the same gateway order | PASS | Backend HTTP with isolated SDK mock |
| PAY-04 | Wrong checkout signature/order/amount/currency grants no access | PASS | Backend HTTP assertions |
| PAY-05 | Captured payment, repeated callback and duplicate webhook create one payment and enrollment | PASS | Backend HTTP plus SQLite counts |
| PAY-06 | Failed payment remains pending without enrollment; lost callback can reconcile | PASS | Backend HTTP with isolated SDK mock |
| PAY-07 | Webhook before callback settles once; later callback is idempotent | PASS | Backend HTTP plus SQLite counts |
| PAY-08 | Invalid webhook signature is rejected | PASS | Backend HTTP returns 401 |
| PAY-09 | Missing credentials show disabled checkout without enrollment | PASS | Isolated Playwright Chrome browser at published paid course |
| PAY-10 | Existing learner, admin, marketplace and free-course flows survive | PASS | `npm run test:backend` and `npm run test:browser` |
| PAY-11 | Genuine Razorpay Test Mode payment, callback, capture, webhook and reload | BLOCKED | Test Mode key pair and a publicly reachable signed webhook endpoint are unavailable |
| PAY-12 | Genuine Test Mode failure and abandonment behavior | BLOCKED | Same provider configuration and operator test card flow required |
| PAY-13 | Razorpay refund initiation and entitlement policy | NOT IMPLEMENTED | Requires product refund policy and provider API workflow |
| PAY-14 | Tutor payouts/split settlements | NOT IMPLEMENTED | Separate financial rules and provider setup |
| PAY-15 | Paid event and bootcamp checkout | NOT IMPLEMENTED | This integration covers courses only |

The payment HTTP tests run on a randomly named, migrated and seeded SQLite database in `data/`, then remove only that test database. They do not modify the configured user database. The 72-case historical frontend matrix was not rerun as part of this feature.

## Configure Test Mode

1. Back up the existing SQLite file consistently, including WAL state, and test the snapshot. Deploy the code to one durable Node.js 24 host. Set `DATABASE_URL` to the intended absolute durable file path. Run `npm ci`, then `npm run db:migrate` **before** starting the new build. Migration `013_razorpay_payments.sql` adds columns and a webhook-event table; it does not reset users, courses or prices. It was applied successfully to isolated test databases, not to the user's existing database.
2. Create a Razorpay **Test Mode** key pair in the Razorpay dashboard. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` only in the server secret environment. Generate a separate strong `RAZORPAY_WEBHOOK_SECRET`; add it both to the Razorpay webhook configuration and the server environment. Never use `NEXT_PUBLIC_` for a secret. Leave all three empty to disable checkout. Restart the server after changing them.
3. Set `NEXT_PUBLIC_SITE_URL` to the site's public HTTPS origin. Register `https://your-domain.example/api/payments/razorpay/webhook` in Razorpay for `payment.captured`, `payment.failed`, and `order.paid`. Use a supported secure development tunnel for local tests; Razorpay's webhook documentation says localhost and some common tunnel domains are blocked. Ensure the webhook reaches the same durable app/database and is not intercepted by an authentication page or CSRF middleware. Keep the secret in sync when rotating it.
4. Run `npm run build` and `npm run start`. Use a dedicated learner test account and a published, admin-approved paid **reading** course. Seeded video courses have no hosted media, so payment alone cannot make their videos playable.
5. Sign in as that learner, open the course, click **Buy Course**, confirm the amount, and use Razorpay's documented Test Mode success method. Return to `/orders/<internal-order-id>` and confirm **Payment captured and course access confirmed**, the new item in My Learning, and one successful payment in the administrator Orders ledger. Refresh and sign out/in to verify persistence. Compare the gateway order/payment IDs, amount and currency with the Razorpay Test Mode dashboard. Do not use a live card or production key for automated QA.
6. Repeat with a Test Mode failure and an abandoned checkout. Neither should create enrollment. Use **Check payment status** on a pending order after the provider state changes to exercise reconciliation. Retry from the course page only after checking that the prior order is unpaid.

## Switch to live mode

Complete Test Mode acceptance and operational review first. Use a production HTTPS origin and persistent database backup. Replace **both** API keys with live credentials from the same Razorpay account, configure a separate live webhook and secret, then restart the app. Confirm webhook delivery, settlement, support contact, refund/chargeback handling, access revocation policy, monitoring and reconciliation procedures before taking real learner payments. The repository does not implement refund API actions or tutor payouts. Restrict who can edit environment secrets and who can view payment identifiers in admin pages.

## API and status behavior

- `POST /api/orders` creates or reuses the learner's pending quote for an approved published paid course.
- `POST /api/orders/{id}/checkout` creates or reuses a Razorpay order; unavailable configuration returns 503.
- `POST /api/orders/{id}/verify` accepts Razorpay callback IDs/signature, then fetches and validates capture from Razorpay.
- `GET /api/orders/{id}` and `POST /api/orders/{id}/reconcile` are learner-owned; the latter checks provider state after a lost callback.
- `POST /api/payments/razorpay/webhook` verifies the raw-body HMAC and event ID before applying supported events. It does not require a browser session.
- `GET /api/admin/orders` and `GET /api/admin/orders/{id}` require server-side admin authorization and show persisted order/payment data.

An internal `pending` order is **not** evidence of payment. Only `paid` after capture grants enrollment. An unsuccessful attempt is recorded in `payments` as `failed`; the order stays pending for an authorized retry. A callback/webhook race converges through unique payment and enrollment constraints plus a database transaction. The gateway key ID is public by design; the key secret and webhook secret never enter the browser response.

## Troubleshooting

- **Checkout disabled:** check all three server variables, restart the app, and inspect `/api/payments/configuration`. Do not place keys in source control.
- **Order pending after checkout:** use the order page's status check. Inspect Razorpay's Test Mode order/payment state and webhook delivery. A payment must be captured and the amount/currency must match the stored order.
- **Webhook rejected:** verify the exact raw-body secret and `x-razorpay-signature`, the provider event ID header, public URL, HTTPS/tunnel availability, and app logs without printing secrets or full payloads.
- **Duplicate webhook:** a repeated event ID is acknowledged without duplicate enrollment. A different event for the same captured payment also converges on one record.
- **Price changed:** an existing gateway order keeps its original server-side snapshot; a new quote uses the newly approved price. Previously enrolled access is retained.

Official references: [Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps), [Orders API](https://razorpay.com/docs/api/orders/), [webhook validation](https://razorpay.com/docs/webhooks/validate-test/).
