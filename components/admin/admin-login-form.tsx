"use client";

import { useActionState } from "react";
import { loginAdmin, type AdminLoginState } from "@/app/admin/login/actions";

type AdminLoginFormProps = {
  nextPath: string;
};

const initialState: AdminLoginState = {};

export function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const [state, formAction] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      {state.formError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-store-red">
          {state.formError}
        </div>
      ) : null}
      <input type="hidden" name="next" value={nextPath} />
      <label className="block">
        <span className="text-sm font-bold text-neutral-700">Admin password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-store-red px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
      >
        Log in
      </button>
    </form>
  );
}
