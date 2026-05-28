"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ProductFormState, type ProductFormValues } from "@/lib/admin-product-form";
import { getPrismaClient } from "@/lib/prisma";
import { productCategories, productStatuses, type ProductCategory, type ProductStatus } from "@/lib/products";

type ProductFormData = {
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  productType: string;
  pokemonSet: string | null;
  priceCents: number;
  stockQuantity: number;
  status: ProductStatus;
  featured: boolean;
  images: string[];
};

function getSubmittedValues(formData: FormData): ProductFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    productType: String(formData.get("productType") ?? ""),
    pokemonSet: String(formData.get("pokemonSet") ?? ""),
    priceCents: String(formData.get("priceCents") ?? ""),
    stockQuantity: String(formData.get("stockQuantity") ?? ""),
    status: String(formData.get("status") ?? ""),
    featured: formData.get("featured") === "on",
    images: String(formData.get("images") ?? "")
  };
}

function getRequiredString(
  values: ProductFormValues,
  field: keyof ProductFormValues,
  fieldErrors: ProductFormState["fieldErrors"]
) {
  const value = values[field];

  if (typeof value !== "string" || value.trim() === "") {
    fieldErrors[field] = "This field is required.";
    return "";
  }

  return value.trim();
}

function getNonNegativeInteger(
  values: ProductFormValues,
  field: "priceCents" | "stockQuantity",
  fieldErrors: ProductFormState["fieldErrors"]
) {
  const rawValue = getRequiredString(values, field, fieldErrors);
  const value = Number(rawValue);

  if (rawValue && (!Number.isInteger(value) || value < 0)) {
    fieldErrors[field] = "Enter a non-negative whole number.";
  }

  return value;
}

function getImageUrls(values: ProductFormValues, fieldErrors: ProductFormState["fieldErrors"]) {
  const images = getRequiredString(values, "images", fieldErrors)
    .split(/\r?\n/)
    .map((image) => image.trim())
    .filter(Boolean);

  if (images.length === 0) {
    fieldErrors.images = "Add at least one image URL.";
  }

  const invalidImage = images.find((image) => {
    if (image.startsWith("/")) {
      return false;
    }

    try {
      const url = new URL(image);
      return url.protocol !== "http:" && url.protocol !== "https:";
    } catch {
      return true;
    }
  });

  if (invalidImage) {
    fieldErrors.images = "Use one image URL per line. URLs must start with http://, https://, or /.";
  }

  return images;
}

function getProductFormData(formData: FormData): { data?: ProductFormData; state: ProductFormState } {
  const values = getSubmittedValues(formData);
  const fieldErrors: ProductFormState["fieldErrors"] = {};
  const category = getRequiredString(values, "category", fieldErrors);
  const status = getRequiredString(values, "status", fieldErrors);

  if (category && !productCategories.includes(category as ProductCategory)) {
    fieldErrors.category = "Choose a valid category.";
  }

  if (status && !productStatuses.includes(status as ProductStatus)) {
    fieldErrors.status = "Choose a valid status.";
  }

  const data = {
    name: getRequiredString(values, "name", fieldErrors),
    slug: getRequiredString(values, "slug", fieldErrors),
    description: values.description.trim(),
    category: category as ProductCategory,
    productType: values.productType.trim(),
    pokemonSet: category === "pokemon_tcg" ? values.pokemonSet.trim() || null : null,
    priceCents: getNonNegativeInteger(values, "priceCents", fieldErrors),
    stockQuantity: getNonNegativeInteger(values, "stockQuantity", fieldErrors),
    status: status as ProductStatus,
    featured: values.featured,
    images: getImageUrls(values, fieldErrors)
  };

  const state = {
    values,
    fieldErrors
  };

  if (Object.keys(fieldErrors).length > 0) {
    return { state };
  }

  return { data, state };
}

function getDuplicateSlugState(state: ProductFormState): ProductFormState {
  return {
    ...state,
    fieldErrors: {
      ...state.fieldErrors,
      slug: "This slug is already used by another product."
    }
  };
}

function getDatabaseErrorState(state: ProductFormState): ProductFormState {
  return {
    ...state,
    formError: "The product could not be saved. Check the database connection and try again."
  };
}

function revalidateProductPages() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/pokemon-tcg");
  revalidatePath("/merch");
  revalidatePath("/products/[slug]", "page");
}

export async function createProduct(
  _previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const { data: productData, state } = getProductFormData(formData);

  if (!productData) {
    return state;
  }

  const prisma = getPrismaClient();
  const existingProduct = await prisma.product.findUnique({
    where: {
      slug: productData.slug
    }
  });

  if (existingProduct) {
    return getDuplicateSlugState(state);
  }

  try {
    await prisma.product.create({
      data: productData
    });
  } catch {
    return getDatabaseErrorState(state);
  }

  revalidateProductPages();
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const { data: productData, state } = getProductFormData(formData);

  if (!productData) {
    return state;
  }

  const prisma = getPrismaClient();
  const existingProduct = await prisma.product.findFirst({
    where: {
      slug: productData.slug,
      NOT: {
        id
      }
    }
  });

  if (existingProduct) {
    return getDuplicateSlugState(state);
  }

  try {
    await prisma.product.update({
      where: {
        id
      },
      data: productData
    });
  } catch {
    return getDatabaseErrorState(state);
  }

  revalidateProductPages();
  redirect("/admin/products");
}

export async function hideProduct(id: string) {
  const prisma = getPrismaClient();

  await prisma.product.update({
    where: {
      id
    },
    data: {
      status: "hidden"
    }
  });

  revalidateProductPages();
  redirect("/admin/products");
}
