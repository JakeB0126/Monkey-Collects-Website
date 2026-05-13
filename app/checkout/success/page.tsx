import Link from "next/link";
import { CheckoutSuccessCartCleanup } from "@/components/checkout-success-cart-cleanup";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    order_id?: string;
    session_id?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { order_id: orderId, session_id: sessionId } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <CheckoutSuccessCartCleanup />
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Checkout</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Payment received</h1>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-base leading-7 text-neutral-700">
          Thanks for your order. Stripe has sent the payment result to our server, and your order is being confirmed.
        </p>
        <p className="mt-4 text-base leading-7 text-neutral-700">
          Your cart has been cleared. If anything needs attention, we will use the email captured during Checkout.
        </p>
        {orderId || sessionId ? (
          <div className="mt-5 space-y-2 rounded-md bg-neutral-50 p-4 text-sm text-neutral-700">
            {orderId ? (
              <p className="break-all">
                <span className="font-bold text-ink">Order reference:</span> {orderId}
              </p>
            ) : null}
            {sessionId ? (
              <p className="break-all">
                <span className="font-bold text-ink">Stripe session:</span> {sessionId}
              </p>
            ) : null}
          </div>
        ) : null}
        <p className="mt-5 text-sm leading-6 text-neutral-600">
          This page is not used to mark payment as complete. Final confirmation comes from Stripe's server webhook.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/pokemon-tcg"
          className="rounded-md bg-store-red px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-red-700"
        >
          Keep shopping
        </Link>
        <Link
          href="/cart"
          className="rounded-md border border-neutral-300 bg-white px-5 py-3 text-center text-sm font-bold text-ink transition hover:bg-neutral-100"
        >
          View cart
        </Link>
      </div>
    </div>
  );
}
