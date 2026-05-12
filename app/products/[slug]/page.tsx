import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { toCartProductSnapshot } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { getActiveProductBySlug } from "@/lib/products-db";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const image = product.images[0] ?? "/product-placeholder.svg";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <img src={image} alt={product.name} className="aspect-[4/3] w-full object-cover" />
        </div>
        <section>
          <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">{product.productType}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink">{product.name}</h1>
          <p className="mt-4 text-lg font-bold text-store-red">{formatPrice(product.priceCents)}</p>
          <p className="mt-5 text-base leading-8 text-neutral-700">{product.description}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-md bg-green-50 px-3 py-2 font-semibold text-store-green">
              {product.stockQuantity} in stock
            </span>
            <span className="rounded-md bg-neutral-100 px-3 py-2 font-semibold text-neutral-700">
              Status: {product.status}
            </span>
          </div>
          <AddToCartButton product={toCartProductSnapshot(product)} />
        </section>
      </div>
    </div>
  );
}
