-- La tabla anterior tenía cero productos al preparar esta migración.
DROP TABLE "products";

CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "products_name_nonempty" CHECK (length(btrim("name")) > 0),
    CONSTRAINT "products_sku_nonempty" CHECK (length(btrim("sku")) > 0),
    CONSTRAINT "products_price_positive" CHECK ("price" > 0),
    CONSTRAINT "products_stock_nonnegative" CHECK ("stock" >= 0)
);

CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
