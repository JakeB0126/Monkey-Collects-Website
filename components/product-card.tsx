import Link from "next/link";
import { formatPrice, type Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0] ?? "/product-placeholder.svg";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
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
