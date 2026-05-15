import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/app/admin/products/actions";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { getAllProductFilterValueOptions } from "@/lib/product-filter-values";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const filterOptions = await getAllProductFilterValueOptions();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Admin</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Create product</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Add a product row for the storefront. Products only appear publicly when status is active.
      </p>
      <div className="mt-6">
        <AdminLogoutButton />
      </div>
      <ProductForm action={createProduct} filterOptions={filterOptions} submitLabel="Create product" />
    </div>
  );
}
