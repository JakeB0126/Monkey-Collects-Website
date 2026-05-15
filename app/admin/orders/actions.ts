"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { orderStatuses, updateOrderFulfillment, updateOrderInternalNotes, type OrderStatus } from "@/lib/orders";

function getString(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function getOrderRedirect(orderId: string, status: "saved" | "notes-saved" | "email-error" | "error"): never {
  redirect(`/admin/orders/${orderId}?status=${status}`);
}

function parseShippedAt(value: string) {
  if (!value) {
    return null;
  }

  const shippedAt = new Date(value);

  if (Number.isNaN(shippedAt.getTime())) {
    return undefined;
  }

  return shippedAt;
}

export async function updateOrderFulfillmentAction(orderId: string, formData: FormData) {
  const status = getString(formData, "status") as OrderStatus;
  const shippedAt = parseShippedAt(getString(formData, "shippedAt"));

  if (!orderStatuses.includes(status) || shippedAt === undefined) {
    getOrderRedirect(orderId, "error");
  }

  let shippingEmailStatus: "sent" | "skipped" | "failed" = "skipped";

  try {
    const result = await updateOrderFulfillment({
      orderId,
      status,
      shippedAt,
      shippingCarrier: getString(formData, "shippingCarrier"),
      trackingNumber: getString(formData, "trackingNumber")
    });
    shippingEmailStatus = result.shippingEmailStatus;
  } catch (error) {
    getOrderRedirect(orderId, "error");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  getOrderRedirect(orderId, shippingEmailStatus === "failed" ? "email-error" : "saved");
}

export async function updateOrderInternalNotesAction(orderId: string, formData: FormData) {
  try {
    await updateOrderInternalNotes({
      orderId,
      internalNotes: getString(formData, "internalNotes")
    });
  } catch {
    getOrderRedirect(orderId, "error");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  getOrderRedirect(orderId, "notes-saved");
}
