import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Checkout</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Checkout canceled</h1>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-base leading-7 text-neutral-700">
          No payment was completed. Your cart is still saved, so you can review it or keep shopping.
        </p>
        <p className="mt-4 text-sm leading-6 text-neutral-600">
          If prices or stock change before your next attempt, the cart will refresh before checkout starts.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/cart"
          className="rounded-md bg-store-red px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-red-700"
        >
          Return to cart
        </Link>
        <Link
          href="/pokemon-tcg"
          className="rounded-md border border-neutral-300 bg-white px-5 py-3 text-center text-sm font-bold text-ink transition hover:bg-neutral-100"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
