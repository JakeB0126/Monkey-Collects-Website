import { getPrismaClient } from "@/lib/prisma";
import type { ProductCategory } from "@/lib/products";

export type ProductFilterKind = "product_type" | "pokemon_set";

export type ProductFilterValue = {
  id: string;
  kind: ProductFilterKind;
  category: ProductCategory;
  value: string;
  createdAt: Date;
  updatedAt: Date;
};

function orderByValue() {
  return {
    value: "asc" as const
  };
}

export async function getProductFilterValuesForAdmin() {
  const prisma = getPrismaClient();

  return prisma.productFilterValue.findMany({
    orderBy: [orderByValue(), { createdAt: "asc" as const }]
  }) satisfies Promise<ProductFilterValue[]>;
}

export async function getProductFilterValueOptions(category: ProductCategory) {
  const prisma = getPrismaClient();
  const values = await prisma.productFilterValue.findMany({
    where: {
      category
    },
    orderBy: orderByValue()
  });

  return {
    productTypes: values.filter((value) => value.kind === "product_type").map((value) => value.value),
    pokemonSets: values.filter((value) => value.kind === "pokemon_set").map((value) => value.value)
  };
}

export async function getAllProductFilterValueOptions() {
  const prisma = getPrismaClient();
  const values = await prisma.productFilterValue.findMany({
    orderBy: orderByValue()
  });

  return {
    productTypes: values.filter((value) => value.kind === "product_type").map((value) => value.value),
    pokemonSets: values.filter((value) => value.kind === "pokemon_set").map((value) => value.value)
  };
}
