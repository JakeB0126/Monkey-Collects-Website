"use server";

import { createPasswordResetRequest, resetCustomerPasswordWithToken } from "@/lib/customer-auth";
import { sendPasswordResetEmail } from "@/lib/email";

export type PasswordResetRequestState = {
  status: "idle" | "success" | "error";
  message?: string;
  resetUrl?: string;
};

export type PasswordResetCompleteState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function getFormString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function requestPasswordReset(
  _previousState: PasswordResetRequestState,
  formData: FormData
): Promise<PasswordResetRequestState> {
  const email = getFormString(formData, "email");

  if (!email || !isLikelyEmail(email)) {
    return {
      status: "error",
      message: "Enter a valid email address."
    };
  }

  const result = await createPasswordResetRequest(email);

  if (result.email) {
    try {
      await sendPasswordResetEmail(result.email, {
        resetUrl: result.resetUrl
      });
    } catch (error) {
      console.error(error instanceof Error ? error.message : "Password reset email could not be sent.");
    }
  }

  return {
    status: "success",
    message: "If an account exists for that email, a password reset link has been sent.",
    resetUrl: process.env.NODE_ENV === "production" ? undefined : result.resetUrl
  };
}

export async function completePasswordReset(
  _previousState: PasswordResetCompleteState,
  formData: FormData
): Promise<PasswordResetCompleteState> {
  const token = getFormString(formData, "token");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return {
      status: "error",
      message: "This reset link is missing a token."
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
    await resetCustomerPasswordWithToken(token, password);

    return {
      status: "success",
      message: "Your password has been updated. You can sign in with the new password."
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Password could not be reset. Please request a new link."
    };
  }
}
