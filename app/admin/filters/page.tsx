import Link from "next/link";
import { createFilterValue, deleteFilterValue, updateFilterValue } from "@/app/admin/filters/actions";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { getProductFilterValuesForAdmin, type ProductFilterValue } from "@/lib/product-filter-values";
import { productCategories, type ProductCategory } from "@/lib/products";

export const dynamic = "force-dynamic";

type AdminFiltersPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

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

function CategorySelect({ defaultValue }: { defaultValue: ProductCategory }) {
  return (
    <select
      name="category"
      defaultValue={defaultValue}
      className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
    >
      {productCategories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
}

function FilterValueRow({ filterValue }: { filterValue: ProductFilterValue }) {
  return (
    <tr>
      <td className="px-4 py-4 text-neutral-700">{filterValue.kind === "product_type" ? "Product Type" : "Pokemon Set"}</td>
      <td className="px-4 py-4">
        <form action={updateFilterValue.bind(null, filterValue.id)} className="flex min-w-80 flex-wrap gap-2">
          <input type="hidden" name="kind" value={filterValue.kind} />
          <CategorySelect defaultValue={filterValue.category} />
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
          <button
            type="submit"
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-ink transition hover:bg-neutral-100"
          >
            Remove
          </button>
        </form>
      </td>
    </tr>
  );
}

function AddFilterValueForm({
  defaultKind,
  label
}: {
  defaultKind: "product_type" | "pokemon_set";
  label: string;
}) {
  return (
    <form action={createFilterValue} className="mt-4 flex flex-wrap gap-3 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <input type="hidden" name="kind" value={defaultKind} />
      <CategorySelect defaultValue="pokemon_tcg" />
      <input
        name="value"
        required
        placeholder={label}
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

export default async function AdminFiltersPage({ searchParams }: AdminFiltersPageProps) {
  const [{ status }, filterValues] = await Promise.all([searchParams, getProductFilterValuesForAdmin()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/admin" className="text-sm font-bold text-store-red transition hover:text-red-700">
        Back to dashboard
      </Link>
      <p className="mt-6 text-sm font-bold uppercase tracking-normal text-store-red">Admin</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Filter/category management</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Manage the product type and Pokemon set values used by product forms and storefront filter dropdowns.
      </p>
      <div className="mt-6">
        <AdminLogoutButton />
      </div>

      <StatusMessage status={status} />

      <section className="mt-8">
        <h2 className="text-xl font-bold text-ink">Add product type</h2>
        <AddFilterValueForm defaultKind="product_type" label="Booster Box" />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-ink">Add Pokemon set</h2>
        <AddFilterValueForm defaultKind="pokemon_set" label="White Flare" />
      </section>

      <div className="mt-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">
                Kind
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Category and value
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filterValues.map((filterValue) => (
              <FilterValueRow key={filterValue.id} filterValue={filterValue} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
