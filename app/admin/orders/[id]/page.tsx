import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { getOrderForAdminById, type AdminOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

type AdminOrderDetailPageProps = {
  params: Promise<{
    id: string;
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

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderForAdminById(id);

  if (!order) {
    notFound();
  }

  const statusClass = getStatusClass(order);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/admin/orders" className="text-sm font-bold text-store-red transition hover:text-red-700">
        Back to orders
      </Link>
      <p className="mt-6 text-sm font-bold uppercase tracking-normal text-store-red">Admin</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Order detail</h1>
      <div className="mt-6">
        <AdminLogoutButton />
      </div>

      {order.status === "canceled" && order.paymentStatus === "paid" ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-store-red shadow-sm">
          This order was paid but canceled during webhook confirmation. Check inventory and issue any needed manual
          refund in Stripe.
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase text-neutral-500">Order id</p>
          <p className="mt-1 break-all font-semibold text-ink">{order.id}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-neutral-500">Customer email</p>
          <p className="mt-1 font-semibold text-ink">{order.customerEmail ?? "Not captured"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-neutral-500">Status</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge className={statusClass}>{order.status}</StatusBadge>
            <StatusBadge className={statusClass}>{order.paymentStatus}</StatusBadge>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-neutral-500">Totals</p>
          <p className="mt-1 font-semibold text-store-red">{formatPrice(order.totalCents)}</p>
          <p className="mt-1 text-sm text-neutral-600">Subtotal {formatPrice(order.subtotalCents)}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-neutral-500">Stripe checkout session</p>
          <p className="mt-1 break-all text-sm text-neutral-700">{order.stripeCheckoutSessionId ?? "None"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-neutral-500">Stripe payment intent</p>
          <p className="mt-1 break-all text-sm text-neutral-700">{order.stripePaymentIntentId ?? "None"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-neutral-500">Created</p>
          <p className="mt-1 text-sm text-neutral-700">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-neutral-500">Updated</p>
          <p className="mt-1 text-sm text-neutral-700">{formatDate(order.updatedAt)}</p>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">
                Product snapshot
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Product id
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Quantity
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Unit price
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Line total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {order.items.map((item) => {
              const image = item.productImage ?? "/product-placeholder.svg";

              return (
                <tr key={item.id}>
                  <td className="px-4 py-4">
                    <div className="flex min-w-64 items-center gap-3">
                      <img
                        src={image}
                        alt=""
                        className="h-14 w-14 rounded-md border border-neutral-200 bg-neutral-100 object-cover"
                      />
                      <div>
                        <p className="font-semibold text-ink">{item.productName}</p>
                        <p className="mt-1 text-xs text-neutral-500">{item.productSlug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-neutral-700">
                    <p className="max-w-64 break-all">{item.productId}</p>
                  </td>
                  <td className="px-4 py-4 text-neutral-700">{item.quantity}</td>
                  <td className="px-4 py-4 font-semibold text-store-red">{formatPrice(item.unitPriceCents)}</td>
                  <td className="px-4 py-4 font-semibold text-store-red">{formatPrice(item.lineTotalCents)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
