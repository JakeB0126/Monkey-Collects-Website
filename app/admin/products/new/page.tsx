import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/app/admin/products/actions";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Admin</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Create product</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Add a product row for the storefront. Products only appear publicly when status is active.
      </p>
      <ProductForm action={createProduct} submitLabel="Create product" />
    </div>
  );
}
