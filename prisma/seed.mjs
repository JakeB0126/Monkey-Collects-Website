import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed products.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL
  })
});

const products = [
  {
    id: "prod_scarlet_violet_booster_box",
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
    createdAt: new Date("2026-05-01T12:00:00.000Z"),
    updatedAt: new Date("2026-05-01T12:00:00.000Z")
  },
  {
    id: "prod_paldea_adventure_etb",
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
    createdAt: new Date("2026-05-02T12:00:00.000Z"),
    updatedAt: new Date("2026-05-02T12:00:00.000Z")
  },
  {
    id: "prod_collector_booster_bundle",
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
    createdAt: new Date("2026-05-03T12:00:00.000Z"),
    updatedAt: new Date("2026-05-03T12:00:00.000Z")
  },
  {
    id: "prod_sold_out_overlay_demo",
    slug: "sold-out-overlay-demo",
    name: "Sold Out Overlay Demo Product",
    description:
      "A storefront-only demo product with zero stock so the sold-out card overlay can be reviewed safely.",
    category: "pokemon_tcg",
    productType: "Demo Product",
    priceCents: 1999,
    stockQuantity: 0,
    status: "active",
    images: ["/product-placeholder.svg"],
    featured: false,
    createdAt: new Date("2026-05-03T18:00:00.000Z"),
    updatedAt: new Date("2026-05-03T18:00:00.000Z")
  },
  {
    id: "prod_limited_collection_box",
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
    createdAt: new Date("2026-05-04T12:00:00.000Z"),
    updatedAt: new Date("2026-05-04T12:00:00.000Z")
  },
  {
    id: "prod_monkey_collects_logo_tee",
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
    createdAt: new Date("2026-05-05T12:00:00.000Z"),
    updatedAt: new Date("2026-05-05T12:00:00.000Z")
  },
  {
    id: "prod_collector_playmat",
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
    createdAt: new Date("2026-05-06T12:00:00.000Z"),
    updatedAt: new Date("2026-05-06T12:00:00.000Z")
  },
  {
    id: "prod_collector_pin_pack",
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
    createdAt: new Date("2026-05-07T12:00:00.000Z"),
    updatedAt: new Date("2026-05-07T12:00:00.000Z")
  },
  {
    id: "prod_display_card_stand",
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
    createdAt: new Date("2026-05-08T12:00:00.000Z"),
    updatedAt: new Date("2026-05-08T12:00:00.000Z")
  }
];

for (const product of products) {
  const { id, slug, createdAt, ...productData } = product;

  await prisma.product.upsert({
    where: { slug },
    update: productData,
    create: {
      id,
      slug,
      createdAt,
      ...productData
    }
  });
}

await prisma.$disconnect();

console.log(`Seeded ${products.length} products.`);
