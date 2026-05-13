import { CartView } from "@/components/cart-view";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Cart</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Your cart</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Review quantities before checkout. The server refreshes product availability and pricing before payment.
      </p>
      <div className="mt-6">
        <CartView />
      </div>
    </div>
  );
}
