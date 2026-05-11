export type ProductCategory = "pokemon_tcg" | "merch";
export type ProductStatus = "active" | "draft" | "sold_out" | "hidden";

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
  createdAt: string;
  updatedAt: string;
};

export const products: Product[] = [
  {
    id: "prod-001",
    slug: "scarlet-violet-booster-box",
    name: "Scarlet & Violet Booster Box",
    description:
      "A sealed booster box for collectors and players looking to open a full display of Scarlet & Violet packs.",
    category: "pokemon_tcg",
    productType: "Booster Box",
    priceCents: 11999,
    stockQuantity: 6,
    status: "active",
    images: ["/product-placeholder.svg"],
    featured: true,
    createdAt: "2026-05-01T12:00:00.000Z",
    updatedAt: "2026-05-01T12:00:00.000Z"
  },
  {
    id: "prod-002",
    slug: "paldea-adventure-elite-trainer-box",
    name: "Paldea Adventure Elite Trainer Box",
    description:
      "A sealed elite trainer box with packs, sleeves, dice, and storage for a clean collector shelf display.",
    category: "pokemon_tcg",
    productType: "Elite Trainer Box",
    priceCents: 4999,
    stockQuantity: 12,
    status: "active",
    images: ["/product-placeholder.svg"],
    featured: true,
    createdAt: "2026-05-02T12:00:00.000Z",
    updatedAt: "2026-05-02T12:00:00.000Z"
  },
  {
    id: "prod-003",
    slug: "collector-booster-bundle",
    name: "Collector Booster Bundle",
    description:
      "A compact sealed bundle for quick openings, gifts, or adding a few packs to the collection.",
    category: "pokemon_tcg",
    productType: "Booster Bundle",
    priceCents: 2699,
    stockQuantity: 18,
    status: "active",
    images: ["/product-placeholder.svg"],
    featured: false,
    createdAt: "2026-05-03T12:00:00.000Z",
    updatedAt: "2026-05-03T12:00:00.000Z"
  },
  {
    id: "prod-004",
    slug: "limited-collection-box",
    name: "Limited Collection Box",
    description:
      "A sealed collection box with promo cards and packs. Kept in draft until inventory is confirmed.",
    category: "pokemon_tcg",
    productType: "Collection Box",
    priceCents: 3999,
    stockQuantity: 4,
    status: "draft",
    images: ["/product-placeholder.svg"],
    featured: false,
    createdAt: "2026-05-04T12:00:00.000Z",
    updatedAt: "2026-05-04T12:00:00.000Z"
  },
  {
    id: "prod-005",
    slug: "monkey-collects-logo-tee",
    name: "Monkey Collects Logo Tee",
    description:
      "A soft everyday tee for collectors, featuring a clean Monkey Collects front print.",
    category: "merch",
    productType: "T-Shirt",
    priceCents: 2499,
    stockQuantity: 24,
    status: "active",
    images: ["/product-placeholder.svg"],
    featured: true,
    createdAt: "2026-05-05T12:00:00.000Z",
    updatedAt: "2026-05-05T12:00:00.000Z"
  },
  {
    id: "prod-006",
    slug: "collector-playmat",
    name: "Collector Playmat",
    description:
      "A stitched-edge playmat for cracking packs, sorting cards, or protecting the desk.",
    category: "merch",
    productType: "Playmat",
    priceCents: 2999,
    stockQuantity: 15,
    status: "active",
    images: ["/product-placeholder.svg"],
    featured: false,
    createdAt: "2026-05-06T12:00:00.000Z",
    updatedAt: "2026-05-06T12:00:00.000Z"
  },
  {
    id: "prod-007",
    slug: "pin-pack",
    name: "Collector Pin Pack",
    description:
      "A small merch add-on with enamel collector pins. This sample is hidden from public storefront pages.",
    category: "merch",
    productType: "Pins",
    priceCents: 1299,
    stockQuantity: 0,
    status: "hidden",
    images: ["/product-placeholder.svg"],
    featured: false,
    createdAt: "2026-05-07T12:00:00.000Z",
    updatedAt: "2026-05-07T12:00:00.000Z"
  },
  {
    id: "prod-008",
    slug: "sold-out-card-stand",
    name: "Display Card Stand",
    description:
      "A display stand for favorite slabs or singles. Kept as sold out to test storefront filtering.",
    category: "merch",
    productType: "Display",
    priceCents: 999,
    stockQuantity: 0,
    status: "sold_out",
    images: ["/product-placeholder.svg"],
    featured: false,
    createdAt: "2026-05-08T12:00:00.000Z",
    updatedAt: "2026-05-08T12:00:00.000Z"
  }
];

export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(priceCents / 100);
}

export function getActiveProducts() {
  return products.filter((product) => product.status === "active");
}

export function getActiveProductsByCategory(category: ProductCategory) {
  return getActiveProducts().filter((product) => product.category === category);
}

export function getFeaturedProducts() {
  return getActiveProducts().filter((product) => product.featured);
}

export function getActiveProductBySlug(slug: string) {
  return getActiveProducts().find((product) => product.slug === slug);
}
