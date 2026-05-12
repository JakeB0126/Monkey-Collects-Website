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
        Placeholder admin view showing all database products, including draft, hidden, and sold out items.
      </p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">
                Product
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Category
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Stock
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-4 font-semibold text-ink">{product.name}</td>
                <td className="px-4 py-4 text-neutral-700">{product.category}</td>
                <td className="px-4 py-4 text-neutral-700">{product.status}</td>
                <td className="px-4 py-4 text-neutral-700">{product.stockQuantity}</td>
                <td className="px-4 py-4 font-semibold text-store-red">{formatPrice(product.priceCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
