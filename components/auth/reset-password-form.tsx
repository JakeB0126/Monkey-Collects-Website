"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { completePasswordReset, type PasswordResetCompleteState } from "@/app/auth/password-reset-actions";

const initialState: PasswordResetCompleteState = {
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
      {pending ? "Updating..." : "Reset Password"}
    </button>
  );
}

function PasswordField({ label, name }: { label: string; name: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className="mt-2 flex rounded-md border border-neutral-300 bg-white focus-within:border-store-green focus-within:ring-2 focus-within:ring-store-green/20">
        <input
          name={name}
          type={isVisible ? "text" : "password"}
          required
          autoComplete="new-password"
          className="min-w-0 flex-1 rounded-l-md bg-white px-3 py-3 text-base text-ink outline-none"
        />
        <button
          type="button"
          onClick={() => setIsVisible((value) => !value)}
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="flex w-12 items-center justify-center rounded-r-md text-neutral-600 transition hover:bg-amber-50 hover:text-ink"
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(completePasswordReset, initialState);

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
          {state.message}
        </div>
      ) : null}

      {state.status === "success" ? (
        <Link
          href="/auth"
          className="inline-flex rounded-md bg-store-red px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
        >
          Sign In
        </Link>
      ) : (
        <form action={action} className="space-y-5">
          <input type="hidden" name="token" value={token} />
          <PasswordField label="New password" name="password" />
          <PasswordField label="Confirm new password" name="confirmPassword" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SubmitButton />
            <Link href="/auth" className="text-sm font-bold text-store-red transition hover:text-red-800">
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
