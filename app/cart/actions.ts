"use server";

import { getPrismaClient } from "@/lib/prisma";
import { type ProductStatus } from "@/lib/products";

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
  const products = await prisma.product.findMany({
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
