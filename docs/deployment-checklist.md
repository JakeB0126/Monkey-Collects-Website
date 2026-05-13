# Deployment Checklist

## Required Vercel Environment Variables

Set these in Vercel before deploying production:

- `DATABASE_URL`: PostgreSQL connection string.
- `NEXT_PUBLIC_SITE_URL`: Production site URL, for example `https://example.com`.
- `STRIPE_SECRET_KEY`: Stripe secret key from the business owner's Stripe account.
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret for the production webhook endpoint.
- `ADMIN_PASSWORD`: Long random password for the temporary V1 admin gate.

Do not commit real secret values to the repo.

## Database and Prisma

- Confirm the production database is reachable from Vercel.
- Run Prisma migrations against production before launch.
- Expected migration command: `pnpm prisma migrate deploy`.
- Confirm `pnpm prisma generate` runs during install/build or run it manually if needed.
- Seed production only if starter inventory is intentionally wanted there.

## Stripe Setup

- The business owner should create and own the Stripe account.
- Use that account's test mode keys for final testing.
- Create a Stripe webhook endpoint:
  - Local testing: `http://localhost:3000/api/stripe/webhook`
  - Production: `https://your-domain.com/api/stripe/webhook`
- Subscribe at minimum to `checkout.session.completed`.
- Copy the endpoint signing secret into `STRIPE_WEBHOOK_SECRET`.
- Keep `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from the same Stripe account and mode.

## Admin Access

- Set `ADMIN_PASSWORD` in Vercel.
- Visit `/admin`.
- Confirm logged-out users are redirected to `/admin/login`.
- Confirm the password grants access to products and orders.
- Confirm logout returns to the login page.

## Final Smoke Tests

- Visit `/`, `/pokemon-tcg`, `/merch`, `/about`, and `/cart`.
- Add an active product to cart.
- Confirm cart refreshes current price and stock.
- Start Stripe Checkout.
- Complete a Stripe test payment.
- Confirm `/checkout/success` renders and clears the local cart.
- Confirm Stripe webhook marks the order `paid` and `fulfilled`.
- Confirm inventory decreases exactly once.
- Confirm `/admin/orders` shows customer email, Stripe IDs, order status, and payment status.
- Retry a duplicate webhook event if practical and confirm inventory does not decrement again.
- Cancel a Checkout session and confirm `/checkout/cancel` returns the customer to cart.

## Known Pre-Deployment Blocker

The full Stripe payment loop is blocked until the business owner creates or owns the Stripe account and provides test keys plus webhook setup. Frontend and non-Stripe backend checks can continue before that.
