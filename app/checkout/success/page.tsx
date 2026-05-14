import Link from "next/link";
import { CheckoutSuccessCartCleanup } from "@/components/checkout-success-cart-cleanup";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    order_id?: string;
    preview?: string;
    session_id?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { order_id: orderId, preview, session_id: sessionId } = await searchParams;
  const isPreview = preview === "true";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <CheckoutSuccessCartCleanup skip={isPreview} />
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Checkout</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Payment received</h1>
      <div className="mt-6 grid gap-6 rounded-lg border border-amber-200 bg-store-card p-6 shadow-sm sm:grid-cols-[180px_1fr] sm:items-center">
        <img
          src="/mascots/mascot-shipping-box.png"
          alt="Baby Monkey mascot holding a shipping box."
          className="mx-auto h-44 w-44 object-contain"
        />
        <div>
          <p className="text-base leading-7 text-neutral-700">
            Thanks for your order. Stripe has sent the payment result to our server, and your order is being confirmed.
          </p>
          <p className="mt-4 text-base leading-7 text-neutral-700">
            {isPreview
              ? "Preview mode is on, so your cart has not been changed."
              : "Your cart has been cleared. If anything needs attention, we will use the email captured during Checkout."}
          </p>
          {orderId || sessionId ? (
            <div className="mt-5 space-y-2 rounded-md bg-amber-50 p-4 text-sm text-neutral-700">
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
