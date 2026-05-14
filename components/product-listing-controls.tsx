import Link from "next/link";
import type { ProductCategory } from "@/lib/products";
import type { ProductAvailabilityFilter, ProductListFilters, ProductSortOption } from "@/lib/products-db";

type SearchParams = Record<string, string | string[] | undefined>;

type ProductFilterOptions = {
  productTypes: string[];
  pokemonSets: string[];
  minPriceCents: number;
  maxPriceCents: number;
};

type SelectedProductFilters = {
  productType: string;
  availability: ProductAvailabilityFilter;
  minPrice: string;
  maxPrice: string;
  pokemonSet: string;
  sort: ProductSortOption;
};

type ProductListingControlsProps = {
  basePath: string;
  category: ProductCategory;
  filterOptions: ProductFilterOptions;
  resultCount: number;
  selected: SelectedProductFilters;
};

const availabilityOptions: { value: ProductAvailabilityFilter; label: string }[] = [
  { value: "all", label: "All availability" },
  { value: "in_stock", label: "In stock" },
  { value: "sold_out", label: "Sold out" }
];

const sortOptions: { value: ProductSortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" }
];

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePriceCents(value: string) {
  if (!value) {
    return undefined;
  }

  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? Math.round(price * 100) : undefined;
}

function isAvailabilityFilter(value: string): value is ProductAvailabilityFilter {
  return availabilityOptions.some((option) => option.value === value);
}

function isSortOption(value: string): value is ProductSortOption {
  return sortOptions.some((option) => option.value === value);
}

export function getProductListFiltersFromSearchParams(searchParams: SearchParams): {
  filters: ProductListFilters;
  hasActiveFilters: boolean;
  selected: SelectedProductFilters;
} {
  const productType = firstSearchValue(searchParams.type)?.trim() ?? "";
  const pokemonSet = firstSearchValue(searchParams.set)?.trim() ?? "";
  const minPrice = firstSearchValue(searchParams.minPrice)?.trim() ?? "";
  const maxPrice = firstSearchValue(searchParams.maxPrice)?.trim() ?? "";
  const availabilityValue = firstSearchValue(searchParams.availability)?.trim() ?? "all";
  const sortValue = firstSearchValue(searchParams.sort)?.trim() ?? "featured";
  const availability = isAvailabilityFilter(availabilityValue) ? availabilityValue : "all";
  const sort = isSortOption(sortValue) ? sortValue : "featured";

  const filters: ProductListFilters = {
    ...(productType ? { productType } : {}),
    ...(pokemonSet ? { pokemonSet } : {}),
    ...(availability !== "all" ? { availability } : {}),
    ...(parsePriceCents(minPrice) !== undefined ? { minPriceCents: parsePriceCents(minPrice) } : {}),
    ...(parsePriceCents(maxPrice) !== undefined ? { maxPriceCents: parsePriceCents(maxPrice) } : {}),
    sort
  };

  return {
    filters,
    hasActiveFilters: Boolean(productType || pokemonSet || minPrice || maxPrice || availability !== "all"),
    selected: {
      productType,
      pokemonSet,
      minPrice,
      maxPrice,
      availability,
      sort
    }
  };
}

export function ProductListingControls({
  basePath,
  category,
  filterOptions,
  resultCount,
  selected
}: ProductListingControlsProps) {
  return (
    <form
      action={basePath}
      className="mt-8 rounded-lg border border-amber-200 bg-store-card p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-ink">
          {resultCount} {resultCount === 1 ? "product" : "products"}
        </p>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-store-red px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Apply
          </button>
          <Link
            href={basePath}
            className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-amber-50"
          >
            Reset
          </Link>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="text-xs font-bold uppercase text-neutral-600">Type</span>
          <select
            name="type"
            defaultValue={selected.productType}
            className="mt-1 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="">All types</option>
            {filterOptions.productTypes.map((productType) => (
              <option key={productType} value={productType}>
                {productType}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase text-neutral-600">Availability</span>
          <select
            name="availability"
            defaultValue={selected.availability}
            className="mt-1 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-ink"
          >
            {availabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {category === "pokemon_tcg" ? (
          <label className="block">
            <span className="text-xs font-bold uppercase text-neutral-600">Pokemon Set</span>
            <select
              name="set"
              defaultValue={selected.pokemonSet}
              className="mt-1 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-ink"
            >
              <option value="">All sets</option>
              {filterOptions.pokemonSets.map((pokemonSet) => (
                <option key={pokemonSet} value={pokemonSet}>
                  {pokemonSet}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block">
          <span className="text-xs font-bold uppercase text-neutral-600">Sort</span>
          <select
            name="sort"
            defaultValue={selected.sort}
            className="mt-1 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-ink"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:max-w-md">
        <label className="block">
          <span className="text-xs font-bold uppercase text-neutral-600">Min price</span>
          <input
            name="minPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={selected.minPrice}
            placeholder={filterOptions.minPriceCents ? String(Math.floor(filterOptions.minPriceCents / 100)) : "0"}
            className="mt-1 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase text-neutral-600">Max price</span>
          <input
            name="maxPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={selected.maxPrice}
            placeholder={filterOptions.maxPriceCents ? String(Math.ceil(filterOptions.maxPriceCents / 100)) : "0"}
            className="mt-1 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
      </div>
    </form>
  );
}
