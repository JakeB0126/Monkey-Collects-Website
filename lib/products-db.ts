import { getPrismaClient } from "@/lib/prisma";
import { getProductFilterValueOptions } from "@/lib/product-filter-values";
import type { Product, ProductCategory } from "@/lib/products";

export type ProductAvailabilityFilter = "all" | "in_stock" | "out_of_stock";
export type ProductSortOption = "featured" | "newest" | "price_asc" | "price_desc";

export type ProductListFilters = {
  productTypes?: string[];
  availability?: ProductAvailabilityFilter;
  minPriceCents?: number;
  maxPriceCents?: number;
  pokemonSets?: string[];
  sort?: ProductSortOption;
};

type ActiveProductFilterProduct = {
  productType: string;
  pokemonSet: string | null;
  priceCents: number;
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

export async function getFeaturedProducts(): Promise<Product[]> {
  const prisma = getPrismaClient();

  const products: Product[] = await prisma.product.findMany({
    where: {
      featured: true,
      status: "active"
    },
    orderBy: sortProductsByNewestFirst()
  });

  return products;
}

export async function getActiveProductsByCategory(
  category: ProductCategory,
  filters: ProductListFilters = {}
): Promise<Product[]> {
  const prisma = getPrismaClient();

  const products: Product[] = await prisma.product.findMany({
    where: {
      category,
      status: "active",
      ...(filters.productTypes?.length ? { productType: { in: filters.productTypes } } : {}),
      ...(filters.pokemonSets?.length ? { pokemonSet: { in: filters.pokemonSets } } : {}),
      ...(filters.availability === "in_stock" ? { stockQuantity: { gt: 0 } } : {}),
      ...(filters.availability === "out_of_stock" ? { stockQuantity: { lte: 0 } } : {}),
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
  });

  return products;
}

export async function getActiveProductFilterOptions(category: ProductCategory) {
  const prisma = getPrismaClient();
  const [products, managedOptions]: [ActiveProductFilterProduct[], Awaited<ReturnType<typeof getProductFilterValueOptions>>] =
    await Promise.all([
    prisma.product.findMany({
      where: {
        category,
        status: "active"
      },
      select: {
        productType: true,
        pokemonSet: true,
        priceCents: true
      }
    }),
      getProductFilterValueOptions(category)
    ]);
  const activeProductTypes = new Set(products.map((product) => product.productType));
  const activePokemonSets = new Set(products.map((product) => product.pokemonSet).filter(Boolean));

  return {
    productTypes: managedOptions.productTypes.filter((productType) => activeProductTypes.has(productType)),
    pokemonSets: managedOptions.pokemonSets.filter((pokemonSet) => activePokemonSets.has(pokemonSet)),
    minPriceCents: products.length > 0 ? Math.min(...products.map((product) => product.priceCents)) : 0,
    maxPriceCents: products.length > 0 ? Math.max(...products.map((product) => product.priceCents)) : 0
  };
}

export async function getActiveProductBySlug(slug: string): Promise<Product | null> {
  const prisma = getPrismaClient();

  const product: Product | null = await prisma.product.findFirst({
    where: {
      slug,
      status: "active"
    }
  });

  return product;
}

export async function getRelatedActiveProducts(product: Product, limit = 4): Promise<Product[]> {
  const prisma = getPrismaClient();
  const candidates: Product[] = await prisma.product.findMany({
    where: {
      id: {
        not: product.id
      },
      category: product.category,
      status: "active"
    },
    orderBy: getProductListOrderBy("featured"),
    take: 12
  });

  return candidates
    .sort((firstProduct, secondProduct) => {
      const firstScore =
        (firstProduct.pokemonSet && firstProduct.pokemonSet === product.pokemonSet ? 2 : 0) +
        (firstProduct.productType === product.productType ? 1 : 0);
      const secondScore =
        (secondProduct.pokemonSet && secondProduct.pokemonSet === product.pokemonSet ? 2 : 0) +
        (secondProduct.productType === product.productType ? 1 : 0);

      return secondScore - firstScore;
    })
    .slice(0, limit) satisfies Product[];
}

export async function getAllProductsForAdmin(): Promise<Product[]> {
  const prisma = getPrismaClient();

  const products: Product[] = await prisma.product.findMany({
    orderBy: sortProductsByNewestFirst()
  });

  return products;
}

export async function getProductForAdminById(id: string): Promise<Product | null> {
  const prisma = getPrismaClient();

  const product: Product | null = await prisma.product.findUnique({
    where: {
      id
    }
  });

  return product;
}
