export type ProductCategory = "pokemon_tcg" | "merch";
export type ProductStatus = "active" | "draft" | "sold_out" | "hidden";

export const productCategories: ProductCategory[] = ["pokemon_tcg", "merch"];
export const productStatuses: ProductStatus[] = ["active", "draft", "sold_out", "hidden"];

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  productType: string;
  priceCents: number;
  stockQuantity: number;
  status: ProductStatus;
  images: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(priceCents / 100);
}
