require("dotenv/config")
const { randomUUID } = require("node:crypto")
const { Client } = require("pg")

const examples = [
  {
    name: "Cuaderno universitario",
    sku: "LAB-CUAD-001",
    description: "100 hojas",
    price: "12.50",
    stock: 20,
  },
  { name: "Bolígrafo azul", sku: "LAB-BOLI-001", description: null, price: "2.30", stock: 50 },
]

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL")
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    await client.query("BEGIN")
    for (const product of examples) {
      await client.query(
        `INSERT INTO products ("id", "name", "sku", "description", "price", "stock", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         ON CONFLICT ("sku") DO NOTHING`,
        [
          randomUUID(),
          product.name,
          product.sku,
          product.description,
          product.price,
          product.stock,
        ],
      )
    }
    await client.query("COMMIT")
    const result = await client.query("SELECT count(*)::int AS total FROM products")
    console.log(`Seed completado. Productos en la tabla: ${result.rows[0].total}`)
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error("Seed fallido:", error.code || error.name)
  process.exitCode = 1
})
