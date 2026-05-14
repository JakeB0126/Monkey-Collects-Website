import { redirect } from "next/navigation";
import { CustomerAuthForm } from "@/components/auth/customer-auth-form";
import { getCurrentCustomerSession } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export default async function AuthPage() {
  const customer = await getCurrentCustomerSession();

  if (customer) {
    redirect("/account");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-blue">Account</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Sign in or create an account</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Keep your cart close and review past sealed-product orders from one cozy shelf.
      </p>
      <div className="mt-6">
        <CustomerAuthForm />
      </div>
    </div>
  );
}
