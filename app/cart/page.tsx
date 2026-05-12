import { CartView } from "@/components/cart-view";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Cart</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Your cart</h1>
      <div className="mt-6">
        <CartView />
      </div>
    </div>
  );
}
