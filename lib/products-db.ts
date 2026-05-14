import { getPrismaClient } from "@/lib/prisma";
import type { Product, ProductCategory } from "@/lib/products";

export type ProductAvailabilityFilter = "all" | "in_stock" | "sold_out";
export type ProductSortOption = "featured" | "newest" | "price_asc" | "price_desc";

export type ProductListFilters = {
  productType?: string;
  availability?: ProductAvailabilityFilter;
  minPriceCents?: number;
  maxPriceCents?: number;
  pokemonSet?: string;
  sort?: ProductSortOption;
};

function sortProductsByNewestFirst() {
  return {
    createdAt: "desc" as const
  };
}

function getProductListOrderBy(sort: ProductSortOption = "featured") {
  if (sort === "price_asc") {
    return [{ priceCents: "asc" as const }, sortProductsByNewestFirst()];
  }

  if (sort === "price_desc") {
    return [{ priceCents: "desc" as const }, sortProductsByNewestFirst()];
  }

  if (sort === "newest") {
    return [sortProductsByNewestFirst()];
  }

  return [{ featured: "desc" as const }, sortProductsByNewestFirst()];
}

function isNonEmptyString(value: string | null): value is string {
  return Boolean(value);
}

export async function getFeaturedProducts() {
  const prisma = getPrismaClient();

  return prisma.product.findMany({
    where: {
      featured: true,
      status: "active"
    },
    orderBy: sortProductsByNewestFirst()
  }) satisfies Promise<Product[]>;
}

export async function getActiveProductsByCategory(category: ProductCategory, filters: ProductListFilters = {}) {
  const prisma = getPrismaClient();

  return prisma.product.findMany({
    where: {
      category,
      status: "active",
      ...(filters.productType ? { productType: filters.productType } : {}),
      ...(filters.pokemonSet ? { pokemonSet: filters.pokemonSet } : {}),
      ...(filters.availability === "in_stock" ? { stockQuantity: { gt: 0 } } : {}),
      ...(filters.availability === "sold_out" ? { stockQuantity: { lte: 0 } } : {}),
      ...(filters.minPriceCents !== undefined || filters.maxPriceCents !== undefined
        ? {
            priceCents: {
              ...(filters.minPriceCents !== undefined ? { gte: filters.minPriceCents } : {}),
              ...(filters.maxPriceCents !== undefined ? { lte: filters.maxPriceCents } : {})
            }
          }
        : {})
    },
    orderBy: getProductListOrderBy(filters.sort)
  }) satisfies Promise<Product[]>;
}

export async function getActiveProductFilterOptions(category: ProductCategory) {
  const prisma = getPrismaClient();
  const products = await prisma.product.findMany({
    where: {
      category,
      status: "active"
    },
    select: {
      productType: true,
      pokemonSet: true,
      priceCents: true
    }
  });

  return {
    productTypes: [...new Set(products.map((product) => product.productType).filter(Boolean))].sort(),
    pokemonSets: [...new Set(products.map((product) => product.pokemonSet).filter(isNonEmptyString))].sort(),
    minPriceCents: products.length > 0 ? Math.min(...products.map((product) => product.priceCents)) : 0,
    maxPriceCents: products.length > 0 ? Math.max(...products.map((product) => product.priceCents)) : 0
  };
}

export async function getActiveProductBySlug(slug: string) {
  const prisma = getPrismaClient();

  return prisma.product.findFirst({
    where: {
      slug,
      status: "active"
    }
  }) satisfies Promise<Product | null>;
}

export async function getAllProductsForAdmin() {
  const prisma = getPrismaClient();

  return prisma.product.findMany({
    orderBy: sortProductsByNewestFirst()
  }) satisfies Promise<Product[]>;
}

export async function getProductForAdminById(id: string) {
  const prisma = getPrismaClient();

  return prisma.product.findUnique({
    where: {
      id
    }
  }) satisfies Promise<Product | null>;
}
