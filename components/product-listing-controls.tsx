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
  productTypes: string[];
  availability: ProductAvailabilityFilter;
  minPrice: string;
  maxPrice: string;
  pokemonSets: string[];
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
  { value: "all", label: "All" },
  { value: "in_stock", label: "In Stock" },
  { value: "out_of_stock", label: "Out of Stock" }
];

const sortOptions: { value: ProductSortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price low to high" },
  { value: "price_desc", label: "Price high to low" },
  { value: "newest", label: "Newest" }
];

function searchValues(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value : [value]).map((item) => item?.trim() ?? "").filter(Boolean);
}

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

function productCountLabel(resultCount: number) {
  return `${resultCount} ${resultCount === 1 ? "product" : "products"}`;
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-2.5 w-2.5 rotate-[-45deg] border-b-2 border-r-2 transition-transform duration-200 ease-out group-open:rotate-45 ${className}`}
    />
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-md border border-amber-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm font-black text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-green">
        {title}
        <ChevronIcon className="border-store-green" />
      </summary>
      <div className="border-t border-amber-100 px-3 py-3">{children}</div>
    </details>
  );
}

function CheckOption({
  checked,
  label,
  name,
  value
}: {
  checked: boolean;
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-amber-50">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        className="peer sr-only"
      />
      <span className="flex h-5 w-5 items-center justify-center rounded border border-amber-300 bg-amber-50 text-xs font-black text-transparent transition peer-checked:border-store-green peer-checked:bg-store-green peer-checked:text-white">
        ✓
      </span>
      {label}
    </label>
  );
}

function RadioOption({
  checked,
  label,
  name,
  value
}: {
  checked: boolean;
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-amber-50">
      <input type="radio" name={name} value={value} defaultChecked={checked} className="peer sr-only" />
      <span className="h-5 w-5 rounded-full border border-amber-300 bg-amber-50 shadow-[inset_0_0_0_4px_#fff7e6] transition peer-checked:border-store-green peer-checked:bg-store-green" />
      {label}
    </label>
  );
}

export function getProductListFiltersFromSearchParams(searchParams: SearchParams): {
  filters: ProductListFilters;
  hasActiveFilters: boolean;
  selected: SelectedProductFilters;
} {
  const productTypes = searchValues(searchParams.type);
  const pokemonSets = searchValues(searchParams.set);
  const minPrice = firstSearchValue(searchParams.minPrice)?.trim() ?? "";
  const maxPrice = firstSearchValue(searchParams.maxPrice)?.trim() ?? "";
  const availabilityValue = firstSearchValue(searchParams.availability)?.trim() ?? "all";
  const sortValue = firstSearchValue(searchParams.sort)?.trim() ?? "featured";
  const availability = isAvailabilityFilter(availabilityValue) ? availabilityValue : "all";
  const sort = isSortOption(sortValue) ? sortValue : "featured";
  const minPriceCents = parsePriceCents(minPrice);
  const maxPriceCents = parsePriceCents(maxPrice);

  const filters: ProductListFilters = {
    ...(productTypes.length ? { productTypes } : {}),
    ...(pokemonSets.length ? { pokemonSets } : {}),
    ...(availability !== "all" ? { availability } : {}),
    ...(minPriceCents !== undefined ? { minPriceCents } : {}),
    ...(maxPriceCents !== undefined ? { maxPriceCents } : {}),
    sort
  };

  return {
    filters,
    hasActiveFilters: Boolean(productTypes.length || pokemonSets.length || minPrice || maxPrice || availability !== "all"),
    selected: {
      productTypes,
      pokemonSets,
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
    <form action={basePath} className="relative mt-8">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <p className="text-sm font-bold text-ink">{productCountLabel(resultCount)}</p>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <details className="group relative" name="product-listing-menu" data-testid="product-filter-menu">
            <summary
              data-testid="product-filter-trigger"
              className="flex min-w-24 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-store-green bg-store-green px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-store-green"
            >
              Filter
              <ChevronIcon className="border-white" />
            </summary>
            <div className="absolute left-0 z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-amber-200 bg-store-card p-4 shadow-xl shadow-amber-950/15 sm:left-auto sm:right-0">
              <div className="space-y-3">
                <FilterGroup title="Product Type">
                  {filterOptions.productTypes.length > 0 ? (
                    <div className="space-y-1">
                      {filterOptions.productTypes.map((productType) => (
                        <CheckOption
                          key={productType}
                          name="type"
                          value={productType}
                          label={productType}
                          checked={selected.productTypes.includes(productType)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-600">No product types yet.</p>
                  )}
                </FilterGroup>

                <FilterGroup title="Availability">
                  <div className="space-y-1">
                    {availabilityOptions.map((option) => (
                      <RadioOption
                        key={option.value}
                        name="availability"
                        value={option.value}
                        label={option.label}
                        checked={selected.availability === option.value}
                      />
                    ))}
                  </div>
                </FilterGroup>

                {category === "pokemon_tcg" ? (
                  <FilterGroup title="Pokemon Set">
                    {filterOptions.pokemonSets.length > 0 ? (
                      <div className="space-y-1">
                        {filterOptions.pokemonSets.map((pokemonSet) => (
                          <CheckOption
                            key={pokemonSet}
                            name="set"
                            value={pokemonSet}
                            label={pokemonSet}
                            checked={selected.pokemonSets.includes(pokemonSet)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-600">No Pokemon sets yet.</p>
                    )}
                  </FilterGroup>
                ) : null}

                <FilterGroup title="Price">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-bold uppercase text-neutral-600">Min</span>
                      <input
                        name="minPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={selected.minPrice}
                        placeholder={
                          filterOptions.minPriceCents ? String(Math.floor(filterOptions.minPriceCents / 100)) : "0"
                        }
                        className="mt-1 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-ink focus:border-store-green focus:outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase text-neutral-600">Max</span>
                      <input
                        name="maxPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={selected.maxPrice}
                        placeholder={
                          filterOptions.maxPriceCents ? String(Math.ceil(filterOptions.maxPriceCents / 100)) : "0"
                        }
                        className="mt-1 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-ink focus:border-store-green focus:outline-none"
                      />
                    </label>
                  </div>
                </FilterGroup>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-amber-200 pt-4">
                <Link
                  href={basePath}
                  className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-black text-ink transition hover:bg-amber-50"
                >
                  Reset
                </Link>
                <button
                  type="submit"
                  className="rounded-md bg-store-red px-4 py-2 text-sm font-black text-white transition hover:bg-red-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </details>

          <details className="group relative" name="product-listing-menu" data-testid="product-sort-menu">
            <summary
              data-testid="product-sort-trigger"
              className="flex min-w-24 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-amber-300 bg-white px-4 py-2.5 text-sm font-black text-ink shadow-sm transition hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-store-green"
            >
              Sort
              <span className="hidden text-xs text-neutral-500 sm:inline">
                {sortOptions.find((option) => option.value === selected.sort)?.label}
              </span>
              <ChevronIcon className="border-store-green" />
            </summary>
            <div className="absolute left-0 z-20 mt-2 w-64 rounded-lg border border-amber-200 bg-store-card p-3 shadow-xl shadow-amber-950/15 sm:left-auto sm:right-0">
              <div className="space-y-1">
                {sortOptions.map((option) => (
                  <RadioOption
                    key={option.value}
                    name="sort"
                    value={option.value}
                    label={option.label}
                    checked={selected.sort === option.value}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="mt-3 w-full rounded-md bg-store-red px-4 py-2 text-sm font-black text-white transition hover:bg-red-700"
              >
                Apply Sort
              </button>
            </div>
          </details>
        </div>
      </div>
    </form>
  );
}
