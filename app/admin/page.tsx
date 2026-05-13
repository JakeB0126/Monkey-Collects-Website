import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { getAllProductsForAdmin } from "@/lib/products-db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Admin</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Product overview</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Manage all database products, including draft, hidden, and sold out items.
      </p>
      <div className="mt-6">
        <Link
          href="/admin/products/new"
          className="inline-flex rounded-md bg-store-red px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
        >
          Create product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">
                Product
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Type
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Category
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Price
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Stock
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Featured
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {products.map((product) => {
              const image = product.images[0] ?? "/product-placeholder.svg";

              return (
                <tr key={product.id}>
                  <td className="px-4 py-4">
                    <div className="flex min-w-64 items-center gap-3">
                      <img
                        src={image}
                        alt=""
                        className="h-14 w-14 rounded-md border border-neutral-200 bg-neutral-100 object-cover"
                      />
                      <div>
                        <p className="font-semibold text-ink">{product.name}</p>
                        <p className="mt-1 text-xs text-neutral-500">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-neutral-700">{product.productType}</td>
                  <td className="px-4 py-4 text-neutral-700">{product.category}</td>
                  <td className="px-4 py-4 font-semibold text-store-red">{formatPrice(product.priceCents)}</td>
                  <td className="px-4 py-4 text-neutral-700">{product.stockQuantity}</td>
                  <td className="px-4 py-4 text-neutral-700">{product.status}</td>
                  <td className="px-4 py-4 text-neutral-700">{product.featured ? "Yes" : "No"}</td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-ink transition hover:bg-neutral-100"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
