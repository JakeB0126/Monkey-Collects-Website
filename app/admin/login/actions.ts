"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionValue,
  isAdminPasswordConfigured,
  isCorrectAdminPassword
} from "@/lib/admin-auth";

export type AdminLoginState = {
  formError?: string;
};

function getSafeNextPath(value: FormDataEntryValue | null) {
  const nextPath = typeof value === "string" ? value : "";

  if (!nextPath.startsWith("/admin") || nextPath.startsWith("/admin/login")) {
    return "/admin";
  }

  return nextPath;
}

export async function loginAdmin(_previousState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  if (!isAdminPasswordConfigured()) {
    return {
      formError: "Admin password is not configured."
    };
  }

  const password = String(formData.get("password") ?? "");

  if (!isCorrectAdminPassword(password)) {
    return {
      formError: "That password did not work. Please try again."
    };
  }

  const sessionValue = await getAdminSessionValue();

  if (!sessionValue) {
    return {
      formError: "Admin login is not configured."
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  redirect(getSafeNextPath(formData.get("next")));
}

export async function logoutAdmin() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  redirect("/admin/login");
}
