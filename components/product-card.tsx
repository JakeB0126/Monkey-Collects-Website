import Link from "next/link";
import { formatPrice, type Product } from "@/lib/products";

type ProductCardProps = {
  product: ProductCardProduct;
};

export type ProductCardProduct = Pick<
  Product,
  "id" | "slug" | "name" | "description" | "productType" | "priceCents" | "stockQuantity" | "status" | "images"
>;

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0] ?? "/product-placeholder.svg";
  const isSoldOut = product.status === "sold_out" || product.stockQuantity <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-amber-200 bg-store-card shadow-sm transition hover:-translate-y-0.5 hover:border-store-gold hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-store-green"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={product.name}
          className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] ${
            isSoldOut ? "group-hover:brightness-75 group-hover:saturate-50 group-focus-visible:brightness-75 group-focus-visible:saturate-50" : ""
          }`}
        />
        {isSoldOut ? (
          <>
            <span className="absolute left-3 top-3 rounded-md bg-amber-50/95 px-2 py-1 text-xs font-bold uppercase text-ink shadow-sm">
              Sold out
            </span>
            <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition duration-300 group-hover:bg-ink/25 group-hover:opacity-100 group-focus-visible:bg-ink/25 group-focus-visible:opacity-100">
              <img
                src="/mascots/mascot-sold-out.png"
                alt=""
                className="h-32 w-32 object-contain drop-shadow-md sm:h-36 sm:w-36"
                aria-hidden="true"
              />
            </div>
          </>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-neutral-500">
          <span>{product.productType}</span>
          <span aria-hidden="true">/</span>
          <span>{product.stockQuantity} in stock</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-ink">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-600">{product.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-store-red">{formatPrice(product.priceCents)}</p>
          <span className="text-sm font-bold text-ink transition group-hover:text-store-red">View</span>
        </div>
      </div>
    </Link>
  );
}
