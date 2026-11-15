import prisma from "../lib/prisma"
import { HttpError } from "../errors"
import type {
  CreateProductInput,
  ListProductsInput,
  UpdateProductInput,
} from "../validation/products"

export async function listProducts({ page, limit, search }: ListProductsInput) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {}
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])
  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } }
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) throw new HttpError(404, "PRODUCT_NOT_FOUND", "Producto no encontrado")
  return product
}

export function createProduct(input: CreateProductInput) {
  return prisma.product.create({ data: input })
}

export function updateProduct(id: string, input: UpdateProductInput) {
  return prisma.product.update({ where: { id }, data: input })
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } })
  return { id }
}
