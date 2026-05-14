-- AlterTable
ALTER TABLE "Product" ADD COLUMN "pokemonSet" TEXT;

-- CreateIndex
CREATE INDEX "Product_category_status_productType_idx" ON "Product"("category", "status", "productType");

-- CreateIndex
CREATE INDEX "Product_category_status_pokemonSet_idx" ON "Product"("category", "status", "pokemonSet");
