import { describe, expect, it, vi } from "vitest"
import request from "supertest"

vi.mock("../src/lib/prisma", () => ({
  default: {
    product: {
      findMany: vi.fn().mockRejectedValue(new Error("DB_DOWN")),
      count: vi.fn().mockRejectedValue(new Error("DB_DOWN")),
    },
    $transaction: vi.fn().mockRejectedValue(new Error("DB_DOWN")),
  },
}))

import app from "../src/app"

describe("API ante una falla de base de datos", () => {
  it("devuelve 500 sin filtrar detalles internos", async () => {
    const response = await request(app).get("/api/products")
    expect(response.status).toBe(500)
    expect(response.body.error.code).toBe("INTERNAL_ERROR")
    expect(JSON.stringify(response.body)).not.toContain("DB_DOWN")
  })
})
