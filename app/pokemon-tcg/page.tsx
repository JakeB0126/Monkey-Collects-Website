import { ProductCard } from "@/components/product-card";
import { getActiveProductsByCategory } from "@/lib/products-db";

export const dynamic = "force-dynamic";

export default async function PokemonTcgPage() {
  const products = await getActiveProductsByCategory("pokemon_tcg");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Pokemon TCG</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Sealed Pokemon products</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Booster boxes, elite trainer boxes, bundles, collection boxes, tins, and packs will live here as inventory grows.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
