"use server";

import { revalidatePath } from "next/cache";
import {
  createCustomerAccount,
  setCustomerSession,
  verifyCustomerLoginCredentials
} from "@/lib/customer-auth";
import type { CartItem } from "@/lib/cart";
import { syncLocalCartItemsToSavedCart, type SavedCartInputItem } from "@/lib/saved-cart";

export type AuthFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  cartItems?: CartItem[];
};

function getFormString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseLocalCartItems(value: FormDataEntryValue | null): SavedCartInputItem[] {
  if (typeof value !== "string" || !value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item): item is SavedCartInputItem =>
          typeof item?.productId === "string" && Number.isInteger(item.quantity) && item.quantity > 0
      )
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      }));
  } catch {
    return [];
  }
}

async function mergeLocalCartForUser(userId: string, formData: FormData): Promise<CartItem[]> {
  const cart = await syncLocalCartItemsToSavedCart(userId, parseLocalCartItems(formData.get("localCartItems")));

  return cart.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      productType: item.product.productType,
      priceCents: item.product.priceCents,
      stockQuantity: item.product.stockQuantity,
      status: item.product.status,
      images: item.product.images
    }
  }));
}

export async function signInCustomer(_previousState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = getFormString(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      status: "error",
      message: "Enter your email and password."
    };
  }

  if (!isLikelyEmail(email)) {
    return {
      status: "error",
      message: "Enter a valid email address."
    };
  }

  try {
    const customer = await verifyCustomerLoginCredentials(email, password);

    if (!customer) {
      return {
        status: "error",
        message: "That email and password did not match an account."
      };
    }

    await setCustomerSession(customer.id);
    const cartItems = await mergeLocalCartForUser(customer.id, formData);

    revalidatePath("/");
    revalidatePath("/auth");
    revalidatePath("/account");

    return {
      status: "success",
      message: "Signed in.",
      cartItems
    };
  } catch {
    return {
      status: "error",
      message: "Sign-in could not be completed. Please try again."
    };
  }
}

export async function signUpCustomer(_previousState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = getFormString(formData, "name");
  const email = getFormString(formData, "email");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password || !confirmPassword) {
    return {
      status: "error",
      message: "Enter an email, password, and confirmation."
    };
  }

  if (!isLikelyEmail(email)) {
    return {
      status: "error",
      message: "Enter a valid email address."
    };
  }

  if (password.length < 8) {
    return {
      status: "error",
      message: "Use at least 8 characters for your password."
    };
  }

  if (password !== confirmPassword) {
    return {
      status: "error",
      message: "Passwords do not match."
    };
  }

  try {
    const customer = await createCustomerAccount({
      email,
      name,
      password
    });

    await setCustomerSession(customer.id);
    const cartItems = await mergeLocalCartForUser(customer.id, formData);

    revalidatePath("/");
    revalidatePath("/auth");
    revalidatePath("/account");

    return {
      status: "success",
      message: "Account created.",
      cartItems
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Account could not be created. Please try again."
    };
  }
}
