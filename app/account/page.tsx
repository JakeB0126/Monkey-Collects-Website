import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutCustomerAction } from "@/app/account/actions";
import { getCurrentCustomerSession } from "@/lib/customer-auth";
import { getOrdersForUser } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { readSavedCartItemsWithProducts } from "@/lib/saved-cart";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

export default async function AccountPage() {
  const customer = await getCurrentCustomerSession();

  if (!customer) {
    redirect("/auth");
  }

  const [savedCart, orders] = await Promise.all([
    readSavedCartItemsWithProducts(customer.id),
    getOrdersForUser(customer.id)
  ]);
  const savedCartItemCount = savedCart.items.reduce((count, item) => count + item.quantity, 0);
  const savedCartSubtotalCents = savedCart.items.reduce(
    (subtotal, item) => subtotal + item.product.priceCents * item.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-store-red">Account</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">
            {customer.name ? `Hi, ${customer.name}` : "Your collector account"}
          </h1>
          <p className="mt-4 text-base leading-7 text-neutral-700">{customer.email}</p>
        </div>
        <form action={logoutCustomerAction}>
          <button
            type="submit"
            className="rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-ink transition hover:bg-neutral-100"
          >
            Log Out
          </button>
        </form>
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-lg border border-amber-200 bg-store-card p-5 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">Saved Cart</p>
          <p className="mt-3 text-3xl font-black text-ink">{savedCartItemCount} items</p>
          <p className="mt-2 text-base font-bold text-store-red">{formatPrice(savedCartSubtotalCents)}</p>
          <div className="mt-5">
            <Link
              href="/cart"
              className="inline-flex rounded-md bg-store-red px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              View Cart
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">Recent Orders</p>
          {orders.length === 0 ? (
            <p className="mt-4 text-base leading-7 text-neutral-700">
              No account-linked orders yet. Guest checkout orders remain separate unless you check out while signed in.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-ink">Order {order.id.slice(-8)}</p>
                      <p className="mt-1 text-sm text-neutral-600">{formatDate(order.createdAt)}</p>
                    </div>
                    <p className="text-base font-black text-store-red">{formatPrice(order.totalCents)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-normal">
                    <span className="rounded-full bg-white px-3 py-1 text-neutral-700">{formatStatus(order.status)}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-neutral-700">
                      {formatStatus(order.paymentStatus)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-neutral-700">
                    {order.items.map((item) => `${item.quantity}x ${item.productName}`).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
