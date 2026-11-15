const path = require("node:path")
const { existsSync } = require("node:fs")
const { spawnSync } = require("node:child_process")
const { Client } = require("pg")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })

async function prepareTestDatabase() {
  if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL")
  const url = new URL(process.env.DATABASE_URL)
  if (!["localhost", "127.0.0.1"].includes(url.hostname) || url.pathname !== "/crud_lab") {
    throw new Error("La preparación de pruebas solo acepta crud_lab en PostgreSQL local")
  }
  const testUrl = new URL(url)
  testUrl.pathname = "/crud_lab_test"
  const adminUrl = new URL(url)
  adminUrl.pathname = "/postgres"
  const client = new Client({ connectionString: adminUrl.toString() })
  await client.connect()
  try {
    const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      "crud_lab_test",
    ])
    if (existing.rowCount === 0) {
      await client.query("CREATE DATABASE crud_lab_test OWNER crud_user")
      console.log("Base de pruebas crud_lab_test creada")
    }
  } finally {
    await client.end()
  }

  const prismaCli = path.join(__dirname, "..", "node_modules", "prisma", "build", "index.js")
  const result = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: testUrl.toString(), JITI_FS_CACHE: "false" },
    stdio: "inherit",
  })
  if (result.status !== 0) throw new Error("Falló la migración de crud_lab_test")
  if (!existsSync(path.join(__dirname, "..", "src", "generated", "prisma", "client.ts"))) {
    const generated = spawnSync(process.execPath, [prismaCli, "generate"], {
      cwd: path.join(__dirname, ".."),
      env: { ...process.env, JITI_FS_CACHE: "false" },
      stdio: "inherit",
    })
    if (generated.status !== 0) throw new Error("Falló la generación del cliente Prisma")
  }
  return testUrl.toString()
}

module.exports = { prepareTestDatabase }

if (require.main === module) {
  prepareTestDatabase().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
