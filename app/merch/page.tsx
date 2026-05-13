import { ProductCard } from "@/components/product-card";
import { getActiveProductsByCategory } from "@/lib/products-db";

export const dynamic = "force-dynamic";

export default async function MerchPage() {
  const products = await getActiveProductsByCategory("merch");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-green">Merch</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Collector merch</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Apparel, playmats, and display accessories for collectors. Only active, in-stock products are shown here.
      </p>
      {products.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-base leading-7 text-neutral-700">
            No merch products are active right now. Check back soon for collector accessories.
          </p>
        </div>
      )}
    </div>
  );
}
