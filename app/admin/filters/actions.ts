"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrismaClient } from "@/lib/prisma";
import { productCategories, type ProductCategory } from "@/lib/products";
import type { ProductFilterKind } from "@/lib/product-filter-values";

const filterKinds: ProductFilterKind[] = ["product_type", "pokemon_set"];

function getString(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function getFilterListRedirect(category: ProductCategory, status: "saved" | "deleted" | "error"): never {
  redirect(`/admin/filters?category=${category}&status=${status}`);
}

function parseFilterValue(formData: FormData) {
  const kind = getString(formData, "kind") as ProductFilterKind;
  const category = getString(formData, "category") as ProductCategory;
  const value = getString(formData, "value");

  if (!filterKinds.includes(kind) || !productCategories.includes(category) || !value) {
    return null;
  }

  return {
    kind,
    category,
    value
  };
}

function revalidateFilterPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/filters");
  revalidatePath("/admin/products/new");
  revalidatePath("/pokemon-tcg");
  revalidatePath("/merch");
}

export async function createFilterValue(formData: FormData) {
  const data = parseFilterValue(formData);

  if (!data) {
    getFilterListRedirect("pokemon_tcg", "error");
  }

  const prisma = getPrismaClient();

  try {
    await prisma.productFilterValue.upsert({
      where: {
        kind_category_value: data
      },
      update: {},
      create: data
    });
  } catch {
    getFilterListRedirect(data.category, "error");
  }

  revalidateFilterPages();
  getFilterListRedirect(data.category, "saved");
}

export async function updateFilterValue(id: string, formData: FormData) {
  const data = parseFilterValue(formData);

  if (!data) {
    getFilterListRedirect("pokemon_tcg", "error");
  }

  const prisma = getPrismaClient();

  try {
    await prisma.productFilterValue.update({
      where: {
        id
      },
      data
    });
  } catch {
    getFilterListRedirect(data.category, "error");
  }

  revalidateFilterPages();
  getFilterListRedirect(data.category, "saved");
}

export async function deleteFilterValue(id: string, formData: FormData) {
  const category = getString(formData, "category") as ProductCategory;
  const redirectCategory = productCategories.includes(category) ? category : "pokemon_tcg";
  const prisma = getPrismaClient();

  try {
    await prisma.productFilterValue.delete({
      where: {
        id
      }
    });
  } catch {
    getFilterListRedirect(redirectCategory, "error");
  }

  revalidateFilterPages();
  getFilterListRedirect(redirectCategory, "deleted");
}
