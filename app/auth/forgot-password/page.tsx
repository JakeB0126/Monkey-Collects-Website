import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-blue">Account</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Reset your password</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Enter your account email and we will prepare a time-limited password reset link.
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
