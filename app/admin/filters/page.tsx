import Link from "next/link";
import { createFilterValue, deleteFilterValue, updateFilterValue } from "@/app/admin/filters/actions";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import {
  getProductFilterValuesForAdmin,
  type ProductFilterKind,
  type ProductFilterValue
} from "@/lib/product-filter-values";
import type { ProductCategory } from "@/lib/products";

export const dynamic = "force-dynamic";

type AdminFiltersPageProps = {
  searchParams: Promise<{
    category?: string;
    status?: string;
  }>;
};

function getSelectedCategory(category?: string): ProductCategory {
  return category === "merch" ? "merch" : "pokemon_tcg";
}

function StatusMessage({ status }: { status?: string }) {
  if (status === "saved") {
    return (
      <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
        Filter value saved.
      </div>
    );
  }

  if (status === "deleted") {
    return (
      <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
        Filter value removed.
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-store-red">
        That filter value could not be saved. Check for a duplicate or missing value.
      </div>
    );
  }

  return null;
}

function CategoryLink({
  href,
  isActive,
  label
}: {
  href: string;
  isActive: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md border px-4 py-2 text-sm font-bold transition ${
        isActive
          ? "border-store-red bg-store-red text-white hover:bg-red-700"
          : "border-neutral-300 bg-white text-ink hover:bg-neutral-100"
      }`}
    >
      {label}
    </Link>
  );
}

function AddFilterValueForm({
  category,
  kind,
  label,
  placeholder
}: {
  category: ProductCategory;
  kind: ProductFilterKind;
  label: string;
  placeholder: string;
}) {
  return (
    <form action={createFilterValue} className="mt-4 flex flex-wrap gap-3 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="category" value={category} />
      <input
        name="value"
        required
        aria-label={label}
        placeholder={placeholder}
        className="min-w-60 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="rounded-md bg-store-red px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700"
      >
        Add
      </button>
    </form>
  );
}

function FilterValueTable({
  category,
  emptyMessage,
  filterValues,
  kind
}: {
  category: ProductCategory;
  emptyMessage: string;
  filterValues: ProductFilterValue[];
  kind: ProductFilterKind;
}) {
  const values = filterValues.filter((filterValue) => filterValue.kind === kind);

  if (values.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-5 text-sm leading-6 text-neutral-700 shadow-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
        <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
          <tr>
            <th scope="col" className="px-4 py-3 font-bold">
              Value
            </th>
            <th scope="col" className="px-4 py-3 font-bold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {values.map((filterValue) => (
            <tr key={filterValue.id}>
              <td className="px-4 py-4">
                <form action={updateFilterValue.bind(null, filterValue.id)} className="flex min-w-80 flex-wrap gap-2">
                  <input type="hidden" name="kind" value={kind} />
                  <input type="hidden" name="category" value={category} />
                  <input
                    name="value"
                    required
                    defaultValue={filterValue.value}
                    className="min-w-48 rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-ink transition hover:bg-neutral-100"
                  >
                    Save
                  </button>
                </form>
              </td>
              <td className="px-4 py-4">
                <form action={deleteFilterValue.bind(null, filterValue.id)}>
                  <input type="hidden" name="category" value={category} />
                  <button
                    type="submit"
                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-ink transition hover:bg-neutral-100"
                  >
                    Remove
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminFiltersPage({ searchParams }: AdminFiltersPageProps) {
  const [{ category, status }, allFilterValues] = await Promise.all([searchParams, getProductFilterValuesForAdmin()]);
  const selectedCategory = getSelectedCategory(category);
  const filterValues = allFilterValues.filter((filterValue) => filterValue.category === selectedCategory);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/admin" className="text-sm font-bold text-store-red transition hover:text-red-700">
        Back to dashboard
      </Link>
      <p className="mt-6 text-sm font-bold uppercase tracking-normal text-store-red">Admin</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Filter/category management</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Manage the dropdown values used by product forms and customer-facing filters.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <AdminLogoutButton />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <CategoryLink
          href="/admin/filters?category=pokemon_tcg"
          isActive={selectedCategory === "pokemon_tcg"}
          label="Pokemon TCG"
        />
        <CategoryLink href="/admin/filters?category=merch" isActive={selectedCategory === "merch"} label="Merch" />
      </div>

      <StatusMessage status={status} />

      <section className="mt-8">
        <h2 className="text-xl font-bold text-ink">Product types</h2>
        <AddFilterValueForm
          category={selectedCategory}
          kind="product_type"
          label="Product type"
          placeholder={selectedCategory === "pokemon_tcg" ? "Booster Box" : "T-Shirt"}
        />
        <FilterValueTable
          category={selectedCategory}
          emptyMessage="No product types have been added yet."
          filterValues={filterValues}
          kind="product_type"
        />
      </section>

      {selectedCategory === "pokemon_tcg" ? (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-ink">Pokemon sets</h2>
          <AddFilterValueForm category={selectedCategory} kind="pokemon_set" label="Pokemon set" placeholder="White Flare" />
          <FilterValueTable
            category={selectedCategory}
            emptyMessage="No Pokemon sets have been added yet."
            filterValues={filterValues}
            kind="pokemon_set"
          />
        </section>
      ) : null}
    </div>
  );
}
