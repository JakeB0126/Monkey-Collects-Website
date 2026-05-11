import { ProductCard } from "@/components/product-card";
import { getActiveProductsByCategory } from "@/lib/products";

export default function MerchPage() {
  const products = getActiveProductsByCategory("merch");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-green">Merch</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Collector merch</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Apparel, playmats, and display accessories for collectors. Only active mock products are shown here.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
