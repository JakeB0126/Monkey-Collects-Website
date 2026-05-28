# Admin Handoff

## Login

- Admin URL: `/admin`
- Password environment variable: `ADMIN_PASSWORD`
- The admin area uses one shared owner password. Do not add staff accounts, roles, or per-user permissions for the current v1 owner workflow.

## Dashboard

Use `/admin` as the owner control center.

The dashboard shows:
- active product count
- low-stock products at or below 3 units
- paid orders needing shipment or tracking
- hidden and sold-out product count
- recent orders

## Products

Use `/admin/products` to view all products.

Use `/admin/products/new` to add a product. Product forms support:
- name
- slug
- description
- category
- product type
- Pokemon set
- price in cents
- stock quantity
- status
- image uploads from your computer
- image URLs
- featured flag

Uploaded product images are saved to Vercel Blob and then added to the image URL list. Pasted image URLs still work.

Use the edit link on `/admin/products` to update an existing product.

## Hiding And Sold-Out Products

Prefer hiding products instead of deleting them.

- `active`: visible and purchasable when stock is available
- `draft`: saved but not public
- `hidden`: intentionally removed from public storefront pages
- `sold_out`: kept in admin as a product record but not currently buyable

Use the Hide button on `/admin/products` for a quick soft removal.

## Product Types And Pokemon Sets

Use `/admin/filters` to manage customer-facing filter dropdown values.

- Select Pokemon TCG to manage Product Types and Pokemon Sets.
- Select Merch to manage Product Types only.

These values feed product form dropdowns and storefront filters. Existing products keep their stored string values, so changing filter values does not automatically rewrite products.

## Orders

Use `/admin/orders` to review recent orders.

Use the Needs shipment view for orders that are:
- paid
- not shipped yet
- missing tracking info

Open an order to see product snapshots, payment status, Stripe references, fulfillment fields, and admin notes.

## Shipping And Tracking

On an order detail page, update:
- order status
- shipped date
- shipping carrier
- tracking number

Saving a shipped date marks pending orders fulfilled and sends one shipping email when transactional email is configured. If email sending fails, the fulfillment details still save and the admin page shows a warning.

## Internal Order Notes

Use Internal notes on an order detail page for admin-only follow-up, such as:
- refund needed
- customer issue
- shipping problem
- inventory problem
- manual follow-up

These notes are not shown to customers.

## What Not To Touch

- Do not mark an order as paid manually from a redirect or admin screen.
- Do not change Stripe payment logic without a focused payment task.
- Do not hard-delete orders.
- Do not add refund automation yet.
- Do not add admin accounts, staff users, or roles for the current two-owner workflow.
