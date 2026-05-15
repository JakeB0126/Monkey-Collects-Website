import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { getProductFilterValuesForAdmin } from "@/lib/product-filter-values";
import { getRecentOrdersForAdmin } from "@/lib/orders";
import { getAllProductsForAdmin } from "@/lib/products-db";

export const dynamic = "force-dynamic";

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
  const [products, orders, filterValues] = await Promise.all([
    getAllProductsForAdmin(),
    getRecentOrdersForAdmin(),
    getProductFilterValuesForAdmin()
  ]);
  const activeProducts = products.filter((product) => product.status === "active").length;
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid").length;

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

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Products</p>
          <p className="mt-2 text-3xl font-bold text-ink">{products.length}</p>
          <p className="mt-1 text-sm text-neutral-600">{activeProducts} active</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Recent orders</p>
          <p className="mt-2 text-3xl font-bold text-ink">{orders.length}</p>
          <p className="mt-1 text-sm text-neutral-600">{paidOrders} paid</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-neutral-500">Filter values</p>
          <p className="mt-2 text-3xl font-bold text-ink">{filterValues.length}</p>
          <p className="mt-1 text-sm text-neutral-600">Product types and sets</p>
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
    </div>
  );
}
