import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { toCartProductSnapshot } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { getActiveProductBySlug, getRelatedActiveProducts } from "@/lib/products-db";

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
  const relatedProducts = await getRelatedActiveProducts(product);

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
          <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-700 shadow-sm">
            Availability and price are checked again on the server before Stripe Checkout starts.
          </div>
          <AddToCartButton product={toCartProductSnapshot(product)} />
        </section>
      </div>
      {relatedProducts.length > 0 ? (
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-store-red">More to collect</p>
              <h2 className="mt-2 font-display text-3xl font-black text-ink">Related Items</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
