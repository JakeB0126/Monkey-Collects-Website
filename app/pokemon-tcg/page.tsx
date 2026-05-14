import { ProductCard } from "@/components/product-card";
import {
  getProductListFiltersFromSearchParams,
  ProductListingControls
} from "@/components/product-listing-controls";
import { getActiveProductFilterOptions, getActiveProductsByCategory } from "@/lib/products-db";

export const dynamic = "force-dynamic";

type PokemonTcgPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PokemonTcgPage({ searchParams }: PokemonTcgPageProps) {
  const { filters, hasActiveFilters, selected } = getProductListFiltersFromSearchParams(await searchParams);
  const [products, filterOptions] = await Promise.all([
    getActiveProductsByCategory("pokemon_tcg", filters),
    getActiveProductFilterOptions("pokemon_tcg")
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Pokemon TCG</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Sealed Pokemon Products</h1>
      <ProductListingControls
        basePath="/pokemon-tcg"
        category="pokemon_tcg"
        filterOptions={filterOptions}
        resultCount={products.length}
        selected={selected}
      />
      {products.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-base leading-7 text-neutral-700">
            {hasActiveFilters
              ? "No Pokemon TCG products match those filters."
              : "No Pokemon TCG products are active right now. Check back soon for sealed inventory."}
          </p>
        </div>
      )}
    </div>
  );
}
