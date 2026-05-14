import Link from "next/link";
import { FeaturedProductsCarousel } from "@/components/featured-products-carousel";
import { getFeaturedProducts } from "@/lib/products-db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const carouselProducts = featuredProducts.map(
    ({ id, slug, name, description, productType, priceCents, stockQuantity, status, images }) => ({
      id,
      slug,
      name,
      description,
      productType,
      priceCents,
      stockQuantity,
      status,
      images
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 py-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
        <div className="max-w-xl">
          <h1 className="font-display text-5xl font-black tracking-normal text-ink sm:text-6xl lg:text-7xl">
            Baby Monkey Collects
          </h1>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pokemon-tcg"
              className="rounded-md bg-store-red px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-red-700"
            >
              Shop Pokemon TCG
            </Link>
            <Link
              href="/merch"
              className="rounded-md border border-neutral-300 bg-white px-5 py-3 text-center text-sm font-bold text-ink transition hover:bg-neutral-100"
            >
              Shop Merch
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-amber-300 bg-store-card shadow-xl shadow-amber-950/10">
          <img
            src="/baby-monkey-collects-hero.png"
            alt="Baby Monkey Collects mascot in a cozy jungle collector studio with plush collectibles."
            className="aspect-[1707/921] w-full object-cover"
          />
        </div>
      </section>

      <section className="py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-black text-ink">Featured</h2>
          </div>
          <Link href="/pokemon-tcg" className="hidden text-sm font-bold text-store-red transition hover:text-red-800 sm:inline">
            View products
          </Link>
        </div>
        {carouselProducts.length > 0 ? (
          <FeaturedProductsCarousel products={carouselProducts} />
        ) : (
          <div className="mt-6 rounded-lg border border-amber-200 bg-store-card p-6 shadow-sm">
            <p className="text-base leading-7 text-neutral-700">
              Featured products will appear here as soon as inventory is marked active and featured.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
