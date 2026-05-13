"use client";

import { useRef } from "react";
import { ProductCard, type ProductCardProduct } from "@/components/product-card";

type FeaturedProductsCarouselProps = {
  products: ProductCardProduct[];
};

export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);

  function scrollProducts(direction: "previous" | "next") {
    scrollerRef.current?.scrollBy({
      left: direction === "next" ? 360 : -360,
      behavior: "smooth"
    });
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollProducts("previous")}
          aria-label="Scroll featured products left"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-amber-300 bg-store-card text-ink shadow-sm transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-green"
        >
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollProducts("next")}
          aria-label="Scroll featured products right"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-amber-300 bg-store-card text-ink shadow-sm transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-green"
        >
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 4.5 13 10l-5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <ul
        ref={scrollerRef}
        className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        {products.map((product) => (
          <li key={product.id} className="w-[78vw] shrink-0 snap-start sm:w-[20rem] lg:w-[22rem]">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}
