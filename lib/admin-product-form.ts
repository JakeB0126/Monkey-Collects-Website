export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  category: string;
  productType: string;
  pokemonSet: string;
  priceCents: string;
  stockQuantity: string;
  status: string;
  featured: boolean;
  images: string;
};

export type ProductFormState = {
  values: ProductFormValues;
  fieldErrors: Partial<Record<keyof ProductFormValues, string>>;
  formError?: string;
};

export const emptyProductFormState: ProductFormState = {
  values: {
    name: "",
    slug: "",
    description: "",
    category: "pokemon_tcg",
    productType: "",
    pokemonSet: "",
    priceCents: "0",
    stockQuantity: "0",
    status: "draft",
    featured: false,
    images: "/product-placeholder.svg"
  },
  fieldErrors: {}
};
