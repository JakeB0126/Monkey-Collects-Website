# Deployment Checklist

Use this checklist for the production Vercel deployment. Do not commit real secret values.

## Current Readiness Status

- Typecheck: `pnpm run typecheck` passes.
- Production build: `pnpm run build` passes.
- Prisma migrations are present in `prisma/migrations`.
- `.env.example` documents the required deployment variables.
- `.env` is ignored and is not tracked.
- Stripe Checkout uses server-side cart validation before creating a Checkout Session.
- Stripe webhook signature verification is enabled at `/api/stripe/webhook`.
- Webhooks are the payment source of truth. `/checkout/success` does not mark orders paid.
- Inventory decrement happens during webhook-confirmed payment handling.
- Duplicate signed webhook delivery was verified not to double-decrement inventory.
- Admin routes are protected by middleware and the `ADMIN_PASSWORD` session gate.
- Admin product image uploads use Vercel Blob public URLs. Uploaded files are not stored in the repo or local filesystem.

## Required Vercel Environment Variables

Set these in Vercel for Production before deploying:

- `DATABASE_URL`: Production PostgreSQL connection string.
- `NEXT_PUBLIC_SITE_URL`: Production site URL, for example `https://your-domain.com`.
- `ADMIN_PASSWORD`: Long random password for the temporary V1 admin gate.
- `CUSTOMER_SESSION_SECRET`: Long random secret for customer session signing.
- `STRIPE_SECRET_KEY`: Production Stripe restricted key preferred, or secret key if a restricted key is not ready.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Production Stripe publishable key from the same Stripe account and mode.
- `STRIPE_WEBHOOK_SECRET`: Production webhook endpoint signing secret for `https://your-domain.com/api/stripe/webhook`.
- `RESEND_API_KEY`: Production Resend API key.
- `RESEND_FROM_EMAIL`: Verified production sender, for example `Baby Monkey Collects <orders@your-domain.com>`.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob read/write token for public product image uploads.

Keep Stripe secret/restricted keys, publishable keys, and webhook secrets from the same Stripe account and mode.

## Vercel Project Settings

- Framework preset: Next.js.
- Install command: `pnpm install`.
- Build command: `pnpm run build`.
- Output directory: leave Vercel default for Next.js.
- Node version: use Vercel default unless project settings require pinning.

## Database And Prisma

- Confirm the production database is reachable from Vercel.
- Confirm `DATABASE_URL` is set in Vercel before build/runtime.
- Run production migrations before launch:

```bash
pnpm prisma migrate deploy
```

- Confirm migrations complete without drift or failed migration records.
- Seed production only if starter inventory is intentionally wanted there:

```bash
pnpm prisma db seed
```

## Stripe Production Setup

- The business owner should create and own the Stripe account.
- Prefer a restricted API key with only the permissions this integration needs.
- Configure production payment methods in the Stripe Dashboard.
- Create a production webhook endpoint:
  - Endpoint URL: `https://your-domain.com/api/stripe/webhook`
  - Event: `checkout.session.completed`
- Copy the endpoint signing secret into Vercel as `STRIPE_WEBHOOK_SECRET`.
- Do not add `payment_method_types`; Checkout should continue using dynamic payment methods.
- Before switching live, run a test-mode payment against the deployed preview or production-like environment.

## Resend Production Setup

- Verify the sending domain in Resend.
- Add required DNS records from Resend at the domain DNS provider.
- Create a production Resend API key.
- Set `RESEND_API_KEY` in Vercel.
- Set `RESEND_FROM_EMAIL` to an address on the verified sending domain.
- After deployment, confirm order confirmation and shipping confirmation emails send.

## Vercel Blob Setup

- In the Vercel project, add a Blob store for product images.
- Connect the Blob store to this project so Vercel provides `BLOB_READ_WRITE_TOKEN`.
- Pull env vars locally after setup:

```bash
pnpm dlx vercel@latest env pull .env.local --yes
```

- Product image uploads accept JPG, PNG, and WebP files up to 4 MB each. Uploaded images are saved as public Blob URLs and stored on products alongside any manually pasted image URLs.

## Domain Setup

- Add the production domain in Vercel.
- Configure DNS records exactly as Vercel provides.
- Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain, with no trailing slash.
- After DNS is active, update Stripe webhook endpoint URLs to use the final production domain.
- Confirm HTTPS is active before running live payments.

## Deployment Commands

Local readiness:

```bash
pnpm install
pnpm run typecheck
pnpm run build
```

Production database migration:

```bash
pnpm prisma migrate deploy
```

Deploy through Vercel after env vars and migrations are ready.

## Final Smoke Test

Run `docs/final-smoke-test.md` after deployment and before announcing launch.
