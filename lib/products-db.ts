import { prisma } from "@/lib/prisma";
import type { Product, ProductCategory } from "@/lib/products";

function sortProductsByNewestFirst() {
  return {
    createdAt: "desc" as const
  };
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: {
      featured: true,
      status: "active"
    },
    orderBy: sortProductsByNewestFirst()
  }) satisfies Promise<Product[]>;
}

export async function getActiveProductsByCategory(category: ProductCategory) {
  return prisma.product.findMany({
    where: {
      category,
      status: "active"
    },
    orderBy: sortProductsByNewestFirst()
  }) satisfies Promise<Product[]>;
}

export async function getActiveProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: {
      slug,
      status: "active"
    }
  }) satisfies Promise<Product | null>;
}

export async function getAllProductsForAdmin() {
  return prisma.product.findMany({
    orderBy: sortProductsByNewestFirst()
  }) satisfies Promise<Product[]>;
}
