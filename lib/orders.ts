import { randomBytes } from "node:crypto";
import type { ValidatedCartItem } from "@/app/cart/actions";
import { sendOrderConfirmationEmail, sendShippingConfirmationEmail } from "@/lib/email";
import { getPrismaClient } from "@/lib/prisma";

export type OrderStatus = "pending" | "canceled" | "fulfilled";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export const orderStatuses: OrderStatus[] = ["pending", "canceled", "fulfilled"];

export type PendingOrderSummary = {
  id: string;
  orderNumber: string | null;
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
  orderNumber: true,
  userId: true,
  customerEmail: true,
  status: true,
  paymentStatus: true,
  stripeCheckoutSessionId: true,
  stripePaymentIntentId: true,
  trackingNumber: true,
  shippingCarrier: true,
  shippedAt: true,
  internalNotes: true,
  orderConfirmationEmailSentAt: true,
  shippingConfirmationEmailSentAt: true,
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

export type AdminOrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  productName: string;
  productSlug: string;
  productImage: string | null;
  createdAt: Date;
};

export type AdminOrder = {
  id: string;
  orderNumber: string | null;
  userId: string | null;
  customerEmail: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  shippedAt: Date | null;
  internalNotes: string | null;
  orderConfirmationEmailSentAt: Date | null;
  shippingConfirmationEmailSentAt: Date | null;
  subtotalCents: number;
  totalCents: number;
  createdAt: Date;
  updatedAt: Date;
  items: AdminOrderItem[];
};

type ProductStock = {
  id: string;
  stockQuantity: number;
};

type TransactionPrismaClient = Omit<
  ReturnType<typeof getPrismaClient>,
  "$connect" | "$disconnect" | "$on" | "$use" | "$extends"
>;

const customerOrderSelect = {
  id: true,
  orderNumber: true,
  userId: true,
  customerEmail: true,
  status: true,
  paymentStatus: true,
  subtotalCents: true,
  totalCents: true,
  trackingNumber: true,
  shippingCarrier: true,
  shippedAt: true,
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

export type CustomerOrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  productName: string;
  productSlug: string;
  productImage: string | null;
  createdAt: Date;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string | null;
  userId: string | null;
  customerEmail: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotalCents: number;
  totalCents: number;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  shippedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: CustomerOrderItem[];
};

const transactionalEmailOrderSelect = {
  id: true,
  orderNumber: true,
  customerEmail: true,
  status: true,
  paymentStatus: true,
  subtotalCents: true,
  totalCents: true,
  trackingNumber: true,
  shippingCarrier: true,
  shippedAt: true,
  orderConfirmationEmailSentAt: true,
  shippingConfirmationEmailSentAt: true,
  items: {
    orderBy: {
      createdAt: "asc" as const
    },
    select: {
      quantity: true,
      unitPriceCents: true,
      lineTotalCents: true,
      productName: true
    }
  }
};

type TransactionalEmailOrder = {
  id: string;
  orderNumber: string | null;
  customerEmail: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotalCents: number;
  totalCents: number;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  shippedAt: Date | null;
  orderConfirmationEmailSentAt: Date | null;
  shippingConfirmationEmailSentAt: Date | null;
  items: Array<{
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
    productName: string;
  }>;
};

function sortOrdersByNewestFirst() {
  return {
    createdAt: "desc" as const
  };
}

function generateOrderNumber() {
  return `BMC-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function getOrderNumber(order: Pick<TransactionalEmailOrder, "id" | "orderNumber">) {
  return order.orderNumber ?? `BMC-${order.id.slice(-8).toUpperCase()}`;
}

export async function getRecentOrdersForAdmin(): Promise<AdminOrder[]> {
  const prisma = getPrismaClient();

  const orders: AdminOrder[] = await prisma.order.findMany({
    orderBy: sortOrdersByNewestFirst(),
    take: 50,
    select: adminOrderSelect
  });

  return orders;
}

export async function getOrdersNeedingShipmentForAdmin(): Promise<AdminOrder[]> {
  const prisma = getPrismaClient();

  const orders: AdminOrder[] = await prisma.order.findMany({
    where: {
      paymentStatus: "paid",
      OR: [
        {
          shippedAt: null
        },
        {
          trackingNumber: null
        },
        {
          trackingNumber: ""
        }
      ]
    },
    orderBy: sortOrdersByNewestFirst(),
    take: 50,
    select: adminOrderSelect
  });

  return orders;
}

export async function getOrderForAdminById(id: string): Promise<AdminOrder | null> {
  const prisma = getPrismaClient();

  const order: AdminOrder | null = await prisma.order.findUnique({
    where: {
      id
    },
    select: adminOrderSelect
  });

  return order;
}

export async function updateOrderInternalNotes({ orderId, internalNotes }: { orderId: string; internalNotes: string }) {
  const prisma = getPrismaClient();

  const order: AdminOrder = await prisma.order.update({
    where: {
      id: orderId
    },
    data: {
      internalNotes: internalNotes.trim() || null
    },
    select: adminOrderSelect
  });

  return order;
}

export async function getOrdersForUser(userId: string): Promise<CustomerOrder[]> {
  const prisma = getPrismaClient();

  const orders: CustomerOrder[] = await prisma.order.findMany({
    where: {
      userId
    },
    orderBy: sortOrdersByNewestFirst(),
    select: customerOrderSelect
  });

  return orders;
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
      orderNumber: generateOrderNumber(),
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
      orderNumber: true,
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
    orderNumber: order.orderNumber,
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

  const result: ConfirmPaidOrderResult = await prisma.$transaction(
    async (tx: TransactionPrismaClient): Promise<ConfirmPaidOrderResult> => {
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
      const placeholders = productIds.map((_, index) => `$${index + 1}`).join(", ");

      await tx.$queryRawUnsafe(`SELECT "id" FROM "Product" WHERE "id" IN (${placeholders}) FOR UPDATE`, ...productIds);
    }

    const products: ProductStock[] = await tx.product.findMany({
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
    }
  );

  return result;
}

export async function sendOrderConfirmationEmailForOrder(orderId: string) {
  const prisma = getPrismaClient();
  const order = await prisma.order.findUnique({
    where: {
      id: orderId
    },
    select: transactionalEmailOrderSelect
  });

  if (!order || !order.customerEmail || order.orderConfirmationEmailSentAt) {
    return;
  }

  await sendOrderConfirmationEmail(order.customerEmail, {
    orderNumber: getOrderNumber(order),
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotalCents: order.subtotalCents,
    totalCents: order.totalCents,
    items: order.items
  });

  await prisma.order.update({
    where: {
      id: order.id
    },
    data: {
      orderConfirmationEmailSentAt: new Date()
    }
  });
}

export async function sendShippingConfirmationEmailForOrder(orderId: string) {
  const prisma = getPrismaClient();
  const order = await prisma.order.findUnique({
    where: {
      id: orderId
    },
    select: transactionalEmailOrderSelect
  });

  if (!order || !order.customerEmail || !order.shippedAt || order.shippingConfirmationEmailSentAt) {
    return false;
  }

  await sendShippingConfirmationEmail(order.customerEmail, {
    orderNumber: getOrderNumber(order),
    trackingNumber: order.trackingNumber,
    shippingCarrier: order.shippingCarrier
  });

  await prisma.order.update({
    where: {
      id: order.id
    },
    data: {
      shippingConfirmationEmailSentAt: new Date()
    }
  });

  return true;
}

export async function updateOrderFulfillment({
  orderId,
  shippedAt,
  shippingCarrier,
  status,
  trackingNumber
}: {
  orderId: string;
  shippedAt: Date | null;
  shippingCarrier?: string | null;
  status: OrderStatus;
  trackingNumber?: string | null;
}) {
  const prisma = getPrismaClient();
  const nextStatus = shippedAt && status === "pending" ? "fulfilled" : status;
  const order = await prisma.order.update({
    where: {
      id: orderId
    },
    data: {
      status: nextStatus,
      shippingCarrier: shippingCarrier?.trim() || null,
      trackingNumber: trackingNumber?.trim() || null,
      shippedAt
    },
    select: adminOrderSelect
  });

  let shippingEmailStatus: "sent" | "skipped" | "failed" = "skipped";

  if (order.shippedAt && !order.shippingConfirmationEmailSentAt) {
    try {
      const sentShippingEmail = await sendShippingConfirmationEmailForOrder(order.id);
      shippingEmailStatus = sentShippingEmail ? "sent" : "skipped";
    } catch {
      shippingEmailStatus = "failed";
    }
  }

  return {
    order,
    shippingEmailStatus
  };
}

export async function markOrderShipped({
  orderId,
  shippingCarrier,
  trackingNumber
}: {
  orderId: string;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
}) {
  return updateOrderFulfillment({
    orderId,
    shippedAt: new Date(),
    shippingCarrier,
    status: "fulfilled",
    trackingNumber
  });
}
