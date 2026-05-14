"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logoutCustomer } from "@/lib/customer-auth";

export async function logoutCustomerAction() {
  await logoutCustomer();

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/auth");

  redirect("/auth");
}
