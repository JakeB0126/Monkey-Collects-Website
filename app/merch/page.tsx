import { ProductCard } from "@/components/product-card";
import {
  getProductListFiltersFromSearchParams,
  ProductListingControls
} from "@/components/product-listing-controls";
import { getActiveProductFilterOptions, getActiveProductsByCategory } from "@/lib/products-db";

export const dynamic = "force-dynamic";

type MerchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MerchPage({ searchParams }: MerchPageProps) {
  const { filters, selected } = getProductListFiltersFromSearchParams(await searchParams);
  const hasActiveFilters = Boolean(
    selected.productTypes.length || selected.minPrice || selected.maxPrice || selected.availability !== "all"
  );
  const [products, filterOptions] = await Promise.all([
    getActiveProductsByCategory("merch", { ...filters, pokemonSets: undefined }),
    getActiveProductFilterOptions("merch")
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-green">Merch</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Collector Merch</h1>
      <ProductListingControls
        basePath="/merch"
        category="merch"
        filterOptions={filterOptions}
        resultCount={products.length}
        selected={{ ...selected, pokemonSets: [] }}
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
              ? "No merch products match those filters."
              : "No merch products are active right now. Check back soon for collector accessories."}
          </p>
        </div>
      )}
    </div>
  );
}
