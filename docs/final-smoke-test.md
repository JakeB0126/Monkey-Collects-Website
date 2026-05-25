# Final Smoke Test

Run this against the deployed Vercel URL after production environment variables and migrations are in place.

## Storefront

- Visit `/`, `/pokemon-tcg`, `/merch`, `/about`, `/cart`, `/refund-policy`, and `/shipping-policy`.
- Confirm pages load over HTTPS with no obvious layout breakage.
- Open an active product detail page.
- Add an active product to the cart.
- Confirm the cart displays the current product price and available quantity.
- Update quantity and confirm it cannot exceed available stock.

## Guest Checkout

- Start Checkout from a guest cart.
- Confirm Stripe Checkout opens.
- Complete a Stripe test-mode payment before launch, or a controlled low-value live payment after launch approval.
- Confirm `/checkout/success` renders and clears the local cart.
- Confirm the success page does not claim to mark the order paid directly.
- Confirm the Stripe webhook marks the order `paid` and `fulfilled`.
- Confirm inventory decrements exactly once.
- If practical, replay or duplicate the webhook event and confirm inventory does not decrement again.

## Logged-In Checkout

- Create or sign into a customer account.
- Add an active product to the cart.
- Start Checkout while signed in.
- Complete payment through Stripe Checkout.
- Confirm the order is linked to the account and appears in `/account`.
- Confirm the order is `paid` and `fulfilled` only after webhook confirmation.

## Admin

- Visit `/admin` while logged out and confirm redirect to `/admin/login`.
- Sign in with `ADMIN_PASSWORD`.
- Confirm `/admin`, `/admin/products`, and `/admin/orders` load.
- Confirm `/admin/orders` shows the completed order with:
  - customer email
  - order status
  - payment status
  - Stripe Checkout Session ID
  - Stripe Payment Intent ID
- Confirm product inventory reflects the paid order.

## Email

- Confirm `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured in Vercel.
- Complete a paid Checkout order with a reachable email address.
- Confirm the order confirmation email sends.
- Add shipping details on the admin order page.
- Confirm the shipping confirmation email sends.

## Rollback Criteria

Pause launch and fix before accepting real orders if any of these fail:

- Checkout uses stale or client-supplied price, stock, or totals.
- `/checkout/success` marks payment as complete without webhook confirmation.
- Webhook signature verification fails for the production Stripe endpoint.
- A duplicate webhook decrements inventory more than once.
- Admin routes are reachable without login.
- Production order emails fail after Resend is configured.
