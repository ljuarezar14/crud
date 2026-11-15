import { z } from "zod"

const price = z
  .string()
  .regex(/^(?:0|[1-9]\d{0,9})\.\d{2}$/, "Usa un precio como 12.50")
  .refine((value) => value !== "0.00", "El precio debe ser positivo")

export const createProductSchema = z.strictObject({
  name: z.string().trim().min(1).max(120),
  sku: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/)
    .transform((value) => value.toUpperCase()),
  description: z.string().trim().max(1000).nullable().optional(),
  price,
  stock: z.number().int().min(0).max(2147483647),
})

export const updateProductSchema = createProductSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Indica al menos un campo")

export const productIdSchema = z.uuid()

export const listProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(120).optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ListProductsInput = z.infer<typeof listProductsSchema>
