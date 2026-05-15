import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { getOrdersNeedingShipmentForAdmin, getRecentOrdersForAdmin, type AdminOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    view?: string;
  }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function getStatusClass(order: Pick<AdminOrder, "status" | "paymentStatus">) {
  if (order.status === "canceled" && order.paymentStatus === "paid") {
    return "border-red-200 bg-red-50 text-store-red";
  }

  if (order.status === "fulfilled" && order.paymentStatus === "paid") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (order.paymentStatus === "unpaid") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-neutral-200 bg-neutral-50 text-neutral-700";
}

function StatusBadge({ children, className }: { children: string; className: string }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-bold uppercase tracking-normal ${className}`}>
      {children}
    </span>
  );
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { view } = await searchParams;
  const showNeedsShipment = view === "needs-shipment";
  const [recentOrders, shipmentOrders] = await Promise.all([
    getRecentOrdersForAdmin(),
    getOrdersNeedingShipmentForAdmin()
  ]);
  const orders = showNeedsShipment ? shipmentOrders : recentOrders;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/admin" className="text-sm font-bold text-store-red transition hover:text-red-700">
        Back to dashboard
      </Link>
      <p className="mt-6 text-sm font-bold uppercase tracking-normal text-store-red">Admin</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Orders</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Review recent orders, Stripe references, payment state, and orders that need manual resolution.
      </p>
      <div className="mt-6">
        <AdminLogoutButton />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-md border px-4 py-2 text-sm font-bold transition ${
            showNeedsShipment
              ? "border-neutral-300 bg-white text-ink hover:bg-neutral-100"
              : "border-store-red bg-store-red text-white hover:bg-red-700"
          }`}
        >
          Recent orders
        </Link>
        <Link
          href="/admin/orders?view=needs-shipment"
          className={`rounded-md border px-4 py-2 text-sm font-bold transition ${
            showNeedsShipment
              ? "border-store-red bg-store-red text-white hover:bg-red-700"
              : "border-neutral-300 bg-white text-ink hover:bg-neutral-100"
          }`}
        >
          Needs shipment ({shipmentOrders.length})
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-base leading-7 text-neutral-700">
            {showNeedsShipment ? "No paid orders currently need shipping attention." : "No orders have been created yet."}
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">
                  Order
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Customer
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Total
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Payment / fulfillment
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Created
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {orders.map((order) => {
                const statusClass = getStatusClass(order);

                return (
                  <tr key={order.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-ink">{order.orderNumber ?? order.id}</p>
                      <p className="mt-1 text-xs text-neutral-500">{order.id}</p>
                      {order.status === "canceled" && order.paymentStatus === "paid" ? (
                        <p className="mt-1 text-xs font-bold text-store-red">Manual resolution needed</p>
                      ) : null}
                      {order.internalNotes ? (
                        <p className="mt-1 text-xs font-bold text-amber-800">Has internal notes</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-neutral-700">{order.customerEmail ?? "Not captured"}</td>
                    <td className="space-y-2 px-4 py-4">
                      <StatusBadge className={statusClass}>{order.status}</StatusBadge>
                      <div>
                        <StatusBadge className={statusClass}>{order.paymentStatus}</StatusBadge>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-store-red">{formatPrice(order.totalCents)}</p>
                      <p className="mt-1 text-xs text-neutral-500">Subtotal {formatPrice(order.subtotalCents)}</p>
                    </td>
                    <td className="px-4 py-4 text-xs text-neutral-700">
                      <p className="max-w-64 break-all">Session: {order.stripeCheckoutSessionId ?? "None"}</p>
                      <p className="mt-1 max-w-64 break-all">Payment: {order.stripePaymentIntentId ?? "None"}</p>
                      <p className="mt-1 max-w-64 break-all">Tracking: {order.trackingNumber || "Missing"}</p>
                      <p className="mt-1 max-w-64 break-all">
                        Shipped: {order.shippedAt ? formatDate(order.shippedAt) : "No"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-neutral-700">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-ink transition hover:bg-neutral-100"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
