"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCustomerSession } from "@/lib/customer-auth";
import { replaceSavedCartItemsForUser, type SavedCartInputItem } from "@/lib/saved-cart";

function getValidItems(items: SavedCartInputItem[]) {
  return items.filter(
    (item) => typeof item.productId === "string" && Number.isInteger(item.quantity) && item.quantity > 0
  );
}

export async function syncCurrentCustomerCart(items: SavedCartInputItem[]) {
  const customer = await getCurrentCustomerSession();

  if (!customer) {
    return {
      status: "guest" as const
    };
  }

  await replaceSavedCartItemsForUser(customer.id, getValidItems(items));
  revalidatePath("/account");

  return {
    status: "synced" as const
  };
}
