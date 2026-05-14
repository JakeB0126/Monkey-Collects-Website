import type { ValidatedCartItem } from "@/app/cart/actions";
import { Prisma } from "@prisma/client";
import { getPrismaClient } from "@/lib/prisma";

export type OrderStatus = "pending" | "canceled" | "fulfilled";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export type PendingOrderSummary = {
  id: string;
  userId: string | null;
  customerEmail: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotalCents: number;
  totalCents: number;
  itemCount: number;
};

export type ConfirmPaidOrderResult =
  | {
      status: "paid";
      orderId: string;
    }
  | {
      status: "already_processed";
      orderId: string;
    }
  | {
      status: "inventory_failed";
      orderId: string;
      message: string;
    };

const adminOrderSelect = {
  id: true,
  userId: true,
  customerEmail: true,
  status: true,
  paymentStatus: true,
  stripeCheckoutSessionId: true,
  stripePaymentIntentId: true,
  subtotalCents: true,
  totalCents: true,
  createdAt: true,
  updatedAt: true,
  items: {
    orderBy: {
      createdAt: "asc" as const
    },
    select: {
      id: true,
      productId: true,
      quantity: true,
      unitPriceCents: true,
      lineTotalCents: true,
      productName: true,
      productSlug: true,
      productImage: true,
      createdAt: true
    }
  }
};

export type AdminOrder = Prisma.OrderGetPayload<{
  select: typeof adminOrderSelect;
}>;

const customerOrderSelect = {
  id: true,
  userId: true,
  customerEmail: true,
  status: true,
  paymentStatus: true,
  subtotalCents: true,
  totalCents: true,
  createdAt: true,
  updatedAt: true,
  items: {
    orderBy: {
      createdAt: "asc" as const
    },
    select: {
      id: true,
      productId: true,
      quantity: true,
      unitPriceCents: true,
      lineTotalCents: true,
      productName: true,
      productSlug: true,
      productImage: true,
      createdAt: true
    }
  }
};

export type CustomerOrder = Prisma.OrderGetPayload<{
  select: typeof customerOrderSelect;
}>;

function sortOrdersByNewestFirst() {
  return {
    createdAt: "desc" as const
  };
}

export async function getRecentOrdersForAdmin() {
  const prisma = getPrismaClient();

  return prisma.order.findMany({
    orderBy: sortOrdersByNewestFirst(),
    take: 50,
    select: adminOrderSelect
  }) satisfies Promise<AdminOrder[]>;
}

export async function getOrderForAdminById(id: string) {
  const prisma = getPrismaClient();

  return prisma.order.findUnique({
    where: {
      id
    },
    select: adminOrderSelect
  }) satisfies Promise<AdminOrder | null>;
}

export async function getOrdersForUser(userId: string) {
  const prisma = getPrismaClient();

  return prisma.order.findMany({
    where: {
      userId
    },
    orderBy: sortOrdersByNewestFirst(),
    select: customerOrderSelect
  }) satisfies Promise<CustomerOrder[]>;
}

export async function createPendingOrderFromValidatedCartItems({
  customerEmail,
  userId,
  items
}: {
  customerEmail?: string | null;
  userId?: string | null;
  items: ValidatedCartItem[];
}): Promise<PendingOrderSummary> {
  if (items.length === 0) {
    throw new Error("Cannot create an order without validated cart items.");
  }

  const subtotalCents = items.reduce((subtotal, item) => subtotal + item.lineSubtotalCents, 0);
  const prisma = getPrismaClient();
  const order = await prisma.order.create({
    data: {
      userId: userId || null,
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
          lineTotalCents: item.lineSubtotalCents,
          productName: item.name,
          productSlug: item.slug,
          productImage: item.images[0] ?? null
        }))
      }
    },
    select: {
      id: true,
      userId: true,
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
    userId: order.userId,
    customerEmail: order.customerEmail,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotalCents: order.subtotalCents,
    totalCents: order.totalCents,
    itemCount: order.items.length
  };
}

export async function confirmPaidOrderFromStripeCheckout({
  orderId,
  customerEmail,
  stripeCheckoutSessionId,
  stripePaymentIntentId
}: {
  orderId: string;
  customerEmail?: string | null;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
}): Promise<ConfirmPaidOrderResult> {
  const prisma = getPrismaClient();

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`;

    const order = await tx.order.findUnique({
      where: {
        id: orderId
      },
      include: {
        items: true
      }
    });

    if (!order) {
      throw new Error(`Stripe checkout completed for missing order ${orderId}.`);
    }

    if (order.paymentStatus === "paid") {
      if (order.status === "fulfilled") {
        return {
          status: "already_processed",
          orderId: order.id
        };
      }

      if (order.status === "canceled") {
        return {
          status: "inventory_failed",
          orderId: order.id,
          message: `Paid order ${order.id} was previously canceled because inventory was insufficient.`
        };
      }

      throw new Error(`Stripe checkout completed for already-paid order ${order.id} in ${order.status} status.`);
    }

    if (order.paymentStatus !== "unpaid" || order.status !== "pending") {
      throw new Error(`Stripe checkout completed for order ${order.id} in ${order.status}/${order.paymentStatus}.`);
    }

    const quantityByProductId = new Map<string, number>();

    for (const item of order.items) {
      quantityByProductId.set(item.productId, (quantityByProductId.get(item.productId) ?? 0) + item.quantity);
    }

    const productIds = Array.from(quantityByProductId.keys());

    if (productIds.length > 0) {
      await tx.$queryRaw`SELECT "id" FROM "Product" WHERE "id" IN (${Prisma.join(productIds)}) FOR UPDATE`;
    }

    const products = await tx.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true,
        stockQuantity: true
      }
    });
    const stockByProductId = new Map(products.map((product) => [product.id, product.stockQuantity]));
    const stockIssue = productIds.find(
      (productId) => (stockByProductId.get(productId) ?? 0) < (quantityByProductId.get(productId) ?? 0)
    );

    if (stockIssue) {
      const message = `Paid order ${order.id} could not be fulfilled because product ${stockIssue} no longer has ${
        quantityByProductId.get(stockIssue) ?? 0
      } units available.`;

      await tx.order.update({
        where: {
          id: order.id
        },
        data: {
          status: "canceled",
          paymentStatus: "paid",
          customerEmail: customerEmail?.trim() || order.customerEmail,
          stripeCheckoutSessionId,
          stripePaymentIntentId: stripePaymentIntentId || null
        }
      });

      return {
        status: "inventory_failed",
        orderId: order.id,
        message
      };
    }

    for (const [productId, quantity] of quantityByProductId) {
      await tx.product.update({
        where: {
          id: productId
        },
        data: {
          stockQuantity: {
            decrement: quantity
          }
        }
      });
    }

    await tx.order.update({
      where: {
        id: order.id
      },
      data: {
        status: "fulfilled",
        paymentStatus: "paid",
        customerEmail: customerEmail?.trim() || order.customerEmail,
        stripeCheckoutSessionId,
        stripePaymentIntentId: stripePaymentIntentId || null
      }
    });

    return {
      status: "paid",
      orderId: order.id
    };
  });
}
