-- CreateEnum
CREATE TYPE "ProductFilterKind" AS ENUM ('product_type', 'pokemon_set');

-- CreateTable
CREATE TABLE "ProductFilterValue" (
    "id" TEXT NOT NULL,
    "kind" "ProductFilterKind" NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFilterValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductFilterValue_kind_category_value_key" ON "ProductFilterValue"("kind", "category", "value");

-- CreateIndex
CREATE INDEX "ProductFilterValue_kind_category_idx" ON "ProductFilterValue"("kind", "category");

-- Backfill current product values so existing storefront filters keep working.
INSERT INTO "ProductFilterValue" ("id", "kind", "category", "value", "createdAt", "updatedAt")
SELECT
  'pfv_' || md5('product_type:' || "category"::text || ':' || trim("productType")),
  'product_type'::"ProductFilterKind",
  "category",
  trim("productType"),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Product"
WHERE trim("productType") <> ''
GROUP BY "category", trim("productType")
ON CONFLICT ("kind", "category", "value") DO NOTHING;

INSERT INTO "ProductFilterValue" ("id", "kind", "category", "value", "createdAt", "updatedAt")
SELECT
  'pfv_' || md5('pokemon_set:' || "category"::text || ':' || trim("pokemonSet")),
  'pokemon_set'::"ProductFilterKind",
  "category",
  trim("pokemonSet"),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Product"
WHERE "pokemonSet" IS NOT NULL AND trim("pokemonSet") <> ''
GROUP BY "category", trim("pokemonSet")
ON CONFLICT ("kind", "category", "value") DO NOTHING;
