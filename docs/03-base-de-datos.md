# 03 · Base de datos

## Modelo Product

| Campo | PostgreSQL | Regla y propósito |
| --- | --- | --- |
| `id` | `UUID` | Clave primaria. Prisma genera el UUID al crear. |
| `name` | `TEXT` | Obligatorio y no vacío tras quitar espacios. Nombre visible. |
| `sku` | `TEXT` | Obligatorio, no vacío y único. La API lo normaliza a mayúsculas. |
| `description` | `TEXT` nullable | Texto opcional; `null` indica ausencia. |
| `price` | `DECIMAL(12,2)` | Positivo y con dos decimales; evita aproximaciones binarias de `float`. |
| `stock` | `INTEGER` | Cantidad disponible entre 0 y 2147483647. |
| `createdAt` | `TIMESTAMP(3)` | Fecha de creación; valor inicial `CURRENT_TIMESTAMP`. |
| `updatedAt` | `TIMESTAMP(3)` | Prisma la actualiza al modificar la fila. |

## SQL de creación

La migración real está en `backend/db/migrations/20261115140000_product_uuid_decimal/migration.sql`. Su creación de tabla es:

```sql
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
```

La migración anterior creó una tabla de práctica con ID entero y precio `DOUBLE PRECISION`. La segunda la reemplaza. Al prepararla se comprobó que había cero filas; no la reutilices sobre una instalación antigua que ya contenga datos sin planear una transformación. `backend/prisma/migrations` conserva el historial previo, mientras que Prisma usa `backend/db/migrations`, configurado en `prisma.config.ts`. La copia de la primera migración es idéntica a la original.

## Prisma y SQL equivalente

```ts
await prisma.product.create({ data: { name: "Cuaderno", sku: "C-1", price: "12.50", stock: 3 } })
await prisma.product.findMany({ where: { sku: { contains: "C-", mode: "insensitive" } } })
await prisma.product.update({ where: { id }, data: { stock: 4 } })
await prisma.product.delete({ where: { id } })
```

Las mismas ideas en SQL, con parámetros para valores externos:

```sql
INSERT INTO products ("id", "name", "sku", "price", "stock", "updatedAt")
VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP);
SELECT * FROM products WHERE "sku" ILIKE $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3;
UPDATE products SET "stock" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2;
DELETE FROM products WHERE "id" = $1;
```

Prisma genera un UUID para `id` y actualiza `updatedAt` en sus llamadas. En SQL directo debes proporcionar esos valores. En el seed, `$1`, `$2`, etc. son parámetros: los datos no se concatenan con el texto SQL. El seed usa `ON CONFLICT ("sku") DO NOTHING` para ser idempotente.

## Migraciones y comprobación

En `backend`, define `$env:JITI_FS_CACHE = 'false'` si la caché de Prisma no es escribible. Ejecuta `npm exec -- prisma migrate status` para ver el estado, `npm exec -- prisma migrate deploy` para aplicar migraciones y `npm exec -- prisma generate` para regenerar tipos. Nunca edites una migración que ya se aplicó; crea otra. `npm run db:seed` añade ejemplos. `npm run db:check` confirma usuario, base y versión con una consulta real.

Las pruebas usan `crud_lab_test`, con la misma secuencia de migraciones. El runner comprueba que está en esa base antes de borrar filas. PostgreSQL conserva los productos de `crud_lab` aunque detengas Node, porque los datos viven en la base y no en memoria.

## Comprueba tu comprensión

1. Explica qué protege `UNIQUE` y qué protege `CHECK ("stock" >= 0)`.
2. Convierte `prisma.product.findUnique({ where: { id } })` a un `SELECT` parametrizado.
3. Repite el seed dos veces y comprueba que el total no crece.
