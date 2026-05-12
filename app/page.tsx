import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts } from "@/lib/products-db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 py-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-store-red">Sealed Pokemon and merch</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl">
            Monkey Collects
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-700">
            Browse sealed Pokemon TCG products and collector merch with clear stock, simple browsing, and checkout coming next.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/pokemon-tcg"
              className="rounded-md bg-store-red px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Shop Pokemon TCG
            </Link>
            <Link
              href="/merch"
              className="rounded-md border border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-neutral-100"
            >
              Shop Merch
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <img src="/product-placeholder.svg" alt="" className="aspect-[4/3] w-full object-cover" />
        </div>
      </section>

      <section className="py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-store-blue">Featured</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">Ready for the shelf</h2>
          </div>
          <Link href="/pokemon-tcg" className="hidden text-sm font-bold text-store-red hover:underline sm:inline">
            View products
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
