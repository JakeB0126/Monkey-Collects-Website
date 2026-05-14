"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordReset, type PasswordResetRequestState } from "@/app/auth/password-reset-actions";

const initialState: PasswordResetRequestState = {
  status: "idle"
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-store-red px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      {pending ? "Preparing link..." : "Request Reset Link"}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialState);

  return (
    <div className="rounded-lg border border-amber-200 bg-store-card p-5 shadow-sm sm:p-6">
      {state.message ? (
        <div
          className={`mb-5 rounded-md border p-4 text-sm font-semibold ${
            state.status === "error"
              ? "border-store-red bg-red-50 text-store-red"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          <p>{state.message}</p>
          {state.resetUrl ? (
            <p className="mt-3">
              Development reset link:{" "}
              <Link href={state.resetUrl} className="font-black underline">
                open reset form
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      <form action={action} className="space-y-5">
        <label className="block">
          <span className="text-sm font-bold text-ink">Email</span>
          <input
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-base text-ink outline-none transition focus:border-store-green focus:ring-2 focus:ring-store-green/20"
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SubmitButton />
          <Link href="/auth" className="text-sm font-bold text-store-red transition hover:text-red-800">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
