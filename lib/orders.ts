import type { ValidatedCartItem } from "@/app/cart/actions";
import { getPrismaClient } from "@/lib/prisma";

export type OrderStatus = "pending" | "canceled" | "fulfilled";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export type PendingOrderSummary = {
  id: string;
  customerEmail: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotalCents: number;
  totalCents: number;
  itemCount: number;
};

export async function createPendingOrderFromValidatedCartItems({
  customerEmail,
  items
}: {
  customerEmail?: string | null;
  items: ValidatedCartItem[];
}): Promise<PendingOrderSummary> {
  if (items.length === 0) {
    throw new Error("Cannot create an order without validated cart items.");
  }

  const subtotalCents = items.reduce((subtotal, item) => subtotal + item.priceCents * item.quantity, 0);
  const prisma = getPrismaClient();
  const order = await prisma.order.create({
    data: {
      customerEmail: customerEmail?.trim() || null,
      status: "pending",
      paymentStatus: "unpaid",
      subtotalCents,
      totalCents: subtotalCents,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceCents: item.priceCents,
          lineTotalCents: item.priceCents * item.quantity,
          productName: item.name,
          productSlug: item.slug,
          productImage: item.images[0] ?? null
        }))
      }
    },
    select: {
      id: true,
      customerEmail: true,
      status: true,
      paymentStatus: true,
      subtotalCents: true,
      totalCents: true,
      items: {
        select: {
          id: true
        }
      }
    }
  });

  return {
    id: order.id,
    customerEmail: order.customerEmail,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotalCents: order.subtotalCents,
    totalCents: order.totalCents,
    itemCount: order.items.length
  };
}
