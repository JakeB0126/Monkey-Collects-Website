"use server";

import { createPendingOrderFromValidatedCartItems } from "@/lib/orders";
import { getCurrentCustomerSession } from "@/lib/customer-auth";
import { getPrismaClient } from "@/lib/prisma";
import { type Product, type ProductStatus } from "@/lib/products";
import { getStripeClient } from "@/lib/stripe";

export type CartValidationInputItem = {
  productId: string;
  quantity: number;
  priceCents?: number;
};

export type ValidatedCartItem = {
  productId: string;
  slug: string;
  name: string;
  productType: string;
  priceCents: number;
  stockQuantity: number;
  status: ProductStatus;
  images: string[];
  quantity: number;
  requestedQuantity: number;
  lineSubtotalCents: number;
};

export type CartValidationIssue = {
  productId: string;
  message: string;
};

export type CartValidationResult = {
  validItems: ValidatedCartItem[];
  unavailableItems: CartValidationIssue[];
  stockIssues: CartValidationIssue[];
  priceChanges: CartValidationIssue[];
  subtotalCents: number;
};

export type CheckoutStartResult =
  | {
      status: "success";
      checkoutUrl: string;
      orderId: string;
    }
  | {
      status: "cart_error";
      message: string;
      validation: CartValidationResult;
    }
  | {
      status: "server_error";
      message: string;
    };

function getEmptyCartValidationResult(): CartValidationResult {
  return {
    validItems: [],
    unavailableItems: [],
    stockIssues: [],
    priceChanges: [],
    subtotalCents: 0
  };
}

function isValidCheckoutInputItem(item: unknown): item is CartValidationInputItem {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as CartValidationInputItem).productId === "string" &&
    Number.isInteger((item as CartValidationInputItem).quantity) &&
    (item as CartValidationInputItem).quantity > 0
  );
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function getStripeImageUrls(item: ValidatedCartItem) {
  return item.images.filter((image) => image.startsWith("https://") || image.startsWith("http://")).slice(0, 1);
}

export async function validateCartItems(items: CartValidationInputItem[]): Promise<CartValidationResult> {
  const requestedItems = items.filter(
    (item) => typeof item.productId === "string" && Number.isInteger(item.quantity) && item.quantity > 0
  );

  if (requestedItems.length === 0) {
    return {
      validItems: [],
      unavailableItems: [],
      stockIssues: [],
      priceChanges: [],
      subtotalCents: 0
    };
  }

  const prisma = getPrismaClient();
  const products: Product[] = await prisma.product.findMany({
    where: {
      id: {
        in: requestedItems.map((item) => item.productId)
      }
    }
  });
  const productsById = new Map(products.map((product) => [product.id, product]));
  const unavailableItems: CartValidationIssue[] = [];
  const stockIssues: CartValidationIssue[] = [];
  const priceChanges: CartValidationIssue[] = [];
  const validItems: ValidatedCartItem[] = [];

  for (const item of requestedItems) {
    const product = productsById.get(item.productId);

    if (!product) {
      unavailableItems.push({
        productId: item.productId,
        message: "This item is no longer available."
      });
      continue;
    }

    if (product.status !== "active") {
      unavailableItems.push({
        productId: item.productId,
        message: "This item is no longer available."
      });
      continue;
    }

    if (product.stockQuantity <= 0) {
      unavailableItems.push({
        productId: item.productId,
        message: "This item is out of stock."
      });
      continue;
    }

    const quantity = Math.min(item.quantity, product.stockQuantity);

    if (quantity !== item.quantity) {
      stockIssues.push({
        productId: item.productId,
        message: "Quantity reduced to available stock."
      });
    }

    if (typeof item.priceCents === "number" && item.priceCents !== product.priceCents) {
      priceChanges.push({
        productId: item.productId,
        message: "Price has changed since this item was added."
      });
    }

    validItems.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      productType: product.productType,
      priceCents: product.priceCents,
      stockQuantity: product.stockQuantity,
      status: product.status,
      images: product.images,
      quantity,
      requestedQuantity: item.quantity,
      lineSubtotalCents: product.priceCents * quantity
    });
  }

  return {
    validItems,
    unavailableItems,
    stockIssues,
    priceChanges,
    subtotalCents: validItems.reduce((subtotal, item) => subtotal + item.lineSubtotalCents, 0)
  };
}

export async function startCheckout(items: CartValidationInputItem[]): Promise<CheckoutStartResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      status: "cart_error",
      message: "Add at least one item before checkout.",
      validation: getEmptyCartValidationResult()
    };
  }

  if (!items.every(isValidCheckoutInputItem)) {
    return {
      status: "cart_error",
      message: "Cart contains an invalid item. Refresh your cart and try again.",
      validation: getEmptyCartValidationResult()
    };
  }

  const validation = await validateCartItems(items);

  if (validation.validItems.length === 0) {
    return {
      status: "cart_error",
      message: "Your cart no longer has any available items.",
      validation
    };
  }

  if (
    validation.unavailableItems.length > 0 ||
    validation.stockIssues.length > 0 ||
    validation.priceChanges.length > 0
  ) {
    return {
      status: "cart_error",
      message: "Your cart changed. Review the updated cart before checkout.",
      validation
    };
  }

  try {
    const stripe = getStripeClient();
    const customerSession = await getCurrentCustomerSession();
    const order = await createPendingOrderFromValidatedCartItems({
      customerEmail: customerSession?.email,
      userId: customerSession?.id,
      items: validation.validItems
    });
    const siteUrl = getSiteUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.id,
      line_items: validation.validItems.map((item) => {
        const images = getStripeImageUrls(item);

        return {
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: item.priceCents,
            product_data: {
              name: item.name,
              description: item.productType,
              images: images.length > 0 ? images : undefined,
              metadata: {
                productId: item.productId,
                productSlug: item.slug
              }
            }
          }
        };
      }),
      metadata: {
        orderId: order.id
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id
        }
      },
      success_url: `${siteUrl}/checkout/success?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`
    });

    if (!session.url) {
      return {
        status: "server_error",
        message: "Stripe did not return a checkout URL. Please try again."
      };
    }

    return {
      status: "success",
      checkoutUrl: session.url,
      orderId: order.id
    };
  } catch {
    return {
      status: "server_error",
      message: "Checkout could not be started. Check Stripe configuration and try again."
    };
  }
}
