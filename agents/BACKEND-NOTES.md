# Backend Notes

## Current Backend State

Core V1 ecommerce backend is implemented.

Implemented:
- PostgreSQL + Prisma product storage
- Product statuses and inventory tracking
- Admin product management
- Server-side cart validation
- Order and OrderItem models
- Stripe Checkout session creation
- Stripe webhook payment confirmation
- Inventory decrement after confirmed payment
- Admin order visibility
- Minimal admin password protection
- Guest checkout

## Backend Priorities

Keep backend changes focused on:
- checkout safety
- inventory correctness
- order accuracy
- clear admin visibility
- secure handling of secrets
- simple maintainable patterns

## Safety Rules

Never trust client-side values for:
- price
- stock
- product status
- cart totals
- checkout totals

Stripe webhooks are the source of truth for payment confirmation.

Do not mark an order paid from a success-page redirect.

## V1.1 Backend Focus

Next likely backend features:
- customer accounts
- saved carts
- order history
- account settings
- password reset
- email verification

Add these incrementally.