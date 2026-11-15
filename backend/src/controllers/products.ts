import type { RequestHandler } from "express"
import {
  createProductSchema,
  listProductsSchema,
  productIdSchema,
  updateProductSchema,
} from "../validation/products"
import * as service from "../services/products"
import type { Product } from "../generated/prisma/client"

function toResponse(product: Product) {
  return { ...product, price: product.price.toFixed(2) }
}

export const list: RequestHandler = async (request, response) => {
  const query = listProductsSchema.parse(request.query)
  const { items, meta } = await service.listProducts(query)
  response.json({ data: items.map(toResponse), meta })
}

export const get: RequestHandler = async (request, response) => {
  const id = productIdSchema.parse(request.params.id)
  response.json({ data: toResponse(await service.getProduct(id)) })
}

export const create: RequestHandler = async (request, response) => {
  const input = createProductSchema.parse(request.body as unknown)
  response.status(201).json({ data: toResponse(await service.createProduct(input)) })
}

export const update: RequestHandler = async (request, response) => {
  const id = productIdSchema.parse(request.params.id)
  const input = updateProductSchema.parse(request.body as unknown)
  response.json({ data: toResponse(await service.updateProduct(id, input)) })
}

export const remove: RequestHandler = async (request, response) => {
  const id = productIdSchema.parse(request.params.id)
  response.json({ data: await service.deleteProduct(id) })
}
