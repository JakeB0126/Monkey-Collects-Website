import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { getOrdersNeedingShipmentForAdmin, getRecentOrdersForAdmin } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { getAllProductsForAdmin } from "@/lib/products-db";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 3;

function DashboardLink({
  description,
  href,
  label
}: {
  description: string;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-store-red hover:bg-red-50"
    >
      <p className="text-lg font-bold text-ink">{label}</p>
      <p className="mt-2 text-sm leading-6 text-neutral-700">{description}</p>
    </Link>
  );
}

export default async function AdminPage() {
  const [products, orders, ordersNeedingShipment] = await Promise.all([
    getAllProductsForAdmin(),
    getRecentOrdersForAdmin(),
    getOrdersNeedingShipmentForAdmin()
  ]);
  const activeProducts = products.filter((product) => product.status === "active").length;
  const lowStockProducts = products.filter(
    (product) => product.stockQuantity <= LOW_STOCK_THRESHOLD && product.status !== "hidden"
  );
  const unavailableProducts = products.filter((product) => product.status === "hidden" || product.status === "sold_out");
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Admin</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Owner dashboard</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        One place to manage products, orders, and the storefront filter values customers see.
      </p>
      <div className="mt-6">
        <AdminLogoutButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Active products</p>
          <p className="mt-2 text-3xl font-bold text-ink">{activeProducts}</p>
          <p className="mt-1 text-sm text-neutral-600">{products.length} total products</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Low stock</p>
          <p className="mt-2 text-3xl font-bold text-ink">{lowStockProducts.length}</p>
          <p className="mt-1 text-sm text-neutral-600">At or below {LOW_STOCK_THRESHOLD} units</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Needs shipment</p>
          <p className="mt-2 text-3xl font-bold text-ink">{ordersNeedingShipment.length}</p>
          <p className="mt-1 text-sm text-neutral-600">Paid, unshipped, or missing tracking</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Hidden / sold out</p>
          <p className="mt-2 text-3xl font-bold text-ink">{unavailableProducts.length}</p>
          <p className="mt-1 text-sm text-neutral-600">Not currently buyable</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <DashboardLink
          href="/admin/products"
          label="Products"
          description="View, edit, feature, draft, sell out, or hide products."
        />
        <DashboardLink
          href="/admin/products/new"
          label="Add product"
          description="Create a new product using managed product type and set values."
        />
        <DashboardLink
          href="/admin/orders"
          label="Orders"
          description="Review payments, order items, Stripe references, and fulfillment state."
        />
        <DashboardLink
          href="/admin/filters"
          label="Filter/category management"
          description="Manage product type and Pokemon set dropdown values for storefront filters."
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-ink">Low stock</h2>
            <Link href="/admin/products" className="text-sm font-bold text-store-red transition hover:text-red-700">
              View products
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-neutral-700">No products are at or below {LOW_STOCK_THRESHOLD} units.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {lowStockProducts.slice(0, 6).map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3">
                  <div>
                    <p className="font-semibold text-ink">{product.name}</p>
                    <p className="mt-1 text-xs text-neutral-600">
                      {product.stockQuantity} in stock / {product.status}
                    </p>
                  </div>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-ink transition hover:bg-neutral-100"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-ink">Orders needing shipment</h2>
            <Link
              href="/admin/orders?view=needs-shipment"
              className="text-sm font-bold text-store-red transition hover:text-red-700"
            >
              Open view
            </Link>
          </div>
          {ordersNeedingShipment.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-neutral-700">No paid orders currently need shipping attention.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {ordersNeedingShipment.slice(0, 6).map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3">
                  <div>
                    <p className="font-semibold text-ink">{order.orderNumber ?? order.id}</p>
                    <p className="mt-1 text-xs text-neutral-600">
                      {order.customerEmail ?? "No email"} / {formatPrice(order.totalCents)}
                    </p>
                  </div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-ink transition hover:bg-neutral-100"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-ink">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-bold text-store-red transition hover:text-red-700">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-neutral-700">No orders yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-neutral-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold text-ink">{order.orderNumber ?? order.id}</p>
                  <p className="mt-1 text-xs text-neutral-600">
                    {order.customerEmail ?? "No email"} / {order.paymentStatus} / {formatPrice(order.totalCents)}
                  </p>
                </div>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-ink transition hover:bg-neutral-100"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
