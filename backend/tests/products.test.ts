import { randomUUID } from "node:crypto"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import request from "supertest"
import app from "../src/app"
import prisma from "../src/lib/prisma"

const input = (sku = `TEST-${randomUUID().slice(0, 8)}`) => ({
  name: "Producto de prueba",
  sku,
  description: null,
  price: "12.50",
  stock: 4,
})

beforeAll(async () => {
  const result = await prisma.$queryRawUnsafe<Array<{ database: string }>>(
    "SELECT current_database() AS database",
  )
  if (result[0]?.database !== "crud_lab_test")
    throw new Error("Las pruebas requieren crud_lab_test")
})
beforeEach(async () => {
  await prisma.product.deleteMany()
})
afterAll(async () => {
  await prisma.product.deleteMany()
  await prisma.$disconnect()
})

describe("API de productos con PostgreSQL aislado", () => {
  it("crea un producto válido y conserva el precio decimal", async () => {
    const response = await request(app).post("/api/products").send(input("test-uno"))
    expect(response.status).toBe(201)
    expect(response.body.data.sku).toBe("TEST-UNO")
    expect(response.body.data.price).toBe("12.50")
    expect(response.body.data.id).toMatch(/^[0-9a-f-]{36}$/)
  })

  it("rechaza un producto sin nombre", async () => {
    const { name: _name, ...body } = input()
    const response = await request(app).post("/api/products").send(body)
    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe("VALIDATION_ERROR")
  })

  it("rechaza un precio negativo", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({ ...input(), price: "-1.00" })
    expect(response.status).toBe(400)
  })

  it("rechaza stock negativo", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({ ...input(), stock: -1 })
    expect(response.status).toBe(400)
  })

  it("rechaza stock fuera del rango INTEGER de PostgreSQL", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({ ...input(), stock: 2147483648 })
    expect(response.status).toBe(400)
  })

  it("rechaza un SKU duplicado", async () => {
    await request(app).post("/api/products").send(input("DUP-1"))
    const response = await request(app).post("/api/products").send(input("dup-1"))
    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe("SKU_DUPLICATE")
  })

  it("lista, busca y pagina productos", async () => {
    await request(app).post("/api/products").send(input("BUSCA-1"))
    await request(app).post("/api/products").send(input("OTRO-2"))
    const list = await request(app).get("/api/products?limit=1&page=1")
    expect(list.status).toBe(200)
    expect(list.body.data).toHaveLength(1)
    expect(list.body.meta.total).toBe(2)
    const search = await request(app).get("/api/products?search=busca")
    expect(search.body.meta.total).toBe(1)
    expect(search.body.data[0].sku).toBe("BUSCA-1")
  })

  it("consulta un producto existente", async () => {
    const created = await request(app).post("/api/products").send(input())
    const response = await request(app).get(`/api/products/${created.body.data.id}`)
    expect(response.status).toBe(200)
    expect(response.body.data.id).toBe(created.body.data.id)
  })

  it("responde 404 para un producto inexistente", async () => {
    const response = await request(app).get("/api/products/00000000-0000-4000-8000-000000000000")
    expect(response.status).toBe(404)
  })

  it("rechaza un ID que no es UUID", async () => {
    const response = await request(app).get("/api/products/123")
    expect(response.status).toBe(400)
  })

  it("actualiza un producto", async () => {
    const created = await request(app).post("/api/products").send(input())
    const response = await request(app)
      .patch(`/api/products/${created.body.data.id}`)
      .send({ price: "9.75", stock: 8 })
    expect(response.status).toBe(200)
    expect(response.body.data.price).toBe("9.75")
    expect(response.body.data.stock).toBe(8)
  })

  it("elimina un producto y deja de listarlo", async () => {
    const created = await request(app).post("/api/products").send(input())
    const id = created.body.data.id
    expect((await request(app).delete(`/api/products/${id}`)).status).toBe(200)
    expect((await request(app).get(`/api/products/${id}`)).status).toBe(404)
    expect((await request(app).get("/api/products")).body.meta.total).toBe(0)
  })

  it("persiste el registro tras reconectar el cliente", async () => {
    const created = await request(app).post("/api/products").send(input())
    await prisma.$disconnect()
    await prisma.$connect()
    const found = await prisma.product.findUnique({ where: { id: created.body.data.id } })
    expect(found?.sku).toBe(created.body.data.sku)
  })
})
