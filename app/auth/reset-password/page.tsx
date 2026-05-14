import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{
    token?: string;
  }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-blue">Account</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Choose a new password</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Reset links expire after one hour and can only be used once.
      </p>
      <div className="mt-6">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-store-card p-5 shadow-sm">
            <p className="text-base font-semibold leading-7 text-neutral-700">This reset link is missing a token.</p>
            <Link
              href="/auth/forgot-password"
              className="mt-5 inline-flex rounded-md bg-store-red px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Request a new link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
