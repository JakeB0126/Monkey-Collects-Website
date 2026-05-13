import { notFound } from "next/navigation";
import { updateProduct } from "@/app/admin/products/actions";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { ProductForm } from "@/components/admin/product-form";
import { getProductForAdminById } from "@/lib/products-db";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getProductForAdminById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-normal text-store-red">Admin</p>
      <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">Edit product</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Update product details, stock, visibility, and featured placement.
      </p>
      <div className="mt-6">
        <AdminLogoutButton />
      </div>
      <ProductForm action={updateProduct.bind(null, product.id)} product={product} submitLabel="Save product" />
    </div>
  );
}
