-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('pokemon_tcg', 'merch');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('active', 'draft', 'sold_out', 'hidden');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "productType" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "stockQuantity" INTEGER NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'draft',
    "images" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_category_status_idx" ON "Product"("category", "status");

-- CreateIndex
CREATE INDEX "Product_featured_status_idx" ON "Product"("featured", "status");
