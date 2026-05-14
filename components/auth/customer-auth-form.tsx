"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInCustomer, signUpCustomer, type AuthFormState } from "@/app/auth/actions";
import { readCartItems, writeCartItems } from "@/lib/cart";

const initialState: AuthFormState = {
  status: "idle"
};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-store-red px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      {pending ? "Working..." : children}
    </button>
  );
}

function Field({
  autoComplete,
  inputMode,
  label,
  name,
  required = true,
  type = "text"
}: {
  autoComplete: string;
  inputMode?: "email";
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-base text-ink outline-none transition focus:border-store-green focus:ring-2 focus:ring-store-green/20"
      />
    </label>
  );
}

function PasswordField({ autoComplete, label, name }: { autoComplete: string; label: string; name: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className="mt-2 flex rounded-md border border-neutral-300 bg-white focus-within:border-store-green focus-within:ring-2 focus-within:ring-store-green/20">
        <input
          name={name}
          type={isVisible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          className="min-w-0 flex-1 rounded-l-md bg-white px-3 py-3 text-base text-ink outline-none"
        />
        <button
          type="button"
          onClick={() => setIsVisible((value) => !value)}
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="flex w-12 items-center justify-center rounded-r-md text-neutral-600 transition hover:bg-amber-50 hover:text-ink"
        >
          {isVisible ? (
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
              <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9 5 10 8a14.4 14.4 0 0 1-3 4.6" />
              <path d="M6.5 6.5A14.3 14.3 0 0 0 2 12c1 3 5 8 10 8a10.9 10.9 0 0 0 4-.8" />
            </svg>
          ) : (
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </span>
    </label>
  );
}

export function CustomerAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [localCartItems, setLocalCartItems] = useState("[]");
  const [signInState, signInAction] = useActionState(signInCustomer, initialState);
  const [signUpState, signUpAction] = useActionState(signUpCustomer, initialState);
  const activeState = mode === "sign-in" ? signInState : signUpState;
  const successState = signInState.status === "success" ? signInState : signUpState.status === "success" ? signUpState : null;

  useEffect(() => {
    setLocalCartItems(JSON.stringify(readCartItems()));
  }, []);

  useEffect(() => {
    if (!successState) {
      return;
    }

    if (successState.cartItems) {
      writeCartItems(successState.cartItems);
    }

    router.refresh();
    router.push("/account");
  }, [successState, router]);

  return (
    <div className="overflow-hidden rounded-lg border border-amber-200 bg-store-card shadow-sm">
      <div className="grid grid-cols-2 border-b border-amber-200 bg-white/70 p-1">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={`rounded-md px-4 py-3 text-sm font-black transition ${
            mode === "sign-in" ? "bg-store-green text-white" : "text-ink hover:bg-amber-50"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={`rounded-md px-4 py-3 text-sm font-black transition ${
            mode === "sign-up" ? "bg-store-green text-white" : "text-ink hover:bg-amber-50"
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {activeState.status === "error" ? (
          <div className="mb-5 rounded-md border border-store-red bg-red-50 p-4 text-sm font-semibold text-store-red">
            {activeState.message}
          </div>
        ) : null}

        {activeState.status === "success" ? (
          <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            {activeState.message}
          </div>
        ) : null}

        {mode === "sign-in" ? (
          <form action={signInAction} className="space-y-5">
            <input type="hidden" name="localCartItems" value={localCartItems} />
            <Field label="Email" name="email" autoComplete="email" inputMode="email" />
            <PasswordField label="Password" name="password" autoComplete="current-password" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SubmitButton>Sign In</SubmitButton>
              <div className="flex flex-col gap-2 text-sm font-bold sm:text-right">
                <Link href="/auth/forgot-password" className="text-store-red transition hover:text-red-800">
                  Forgot password?
                </Link>
                <button
                  type="button"
                  onClick={() => setMode("sign-up")}
                  className="text-left text-store-red transition hover:text-red-800 sm:text-right"
                >
                  Create an account
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form action={signUpAction} className="space-y-5">
            <input type="hidden" name="localCartItems" value={localCartItems} />
            <Field label="Name" name="name" autoComplete="name" required={false} />
            <Field label="Email" name="email" autoComplete="email" inputMode="email" />
            <PasswordField label="Password" name="password" autoComplete="new-password" />
            <PasswordField label="Confirm password" name="confirmPassword" autoComplete="new-password" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SubmitButton>Create Account</SubmitButton>
              <button
                type="button"
                onClick={() => setMode("sign-in")}
                className="text-left text-sm font-bold text-store-red transition hover:text-red-800 sm:text-right"
              >
                I already have an account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
