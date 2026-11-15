// Comprueba la conexión real sin imprimir DATABASE_URL ni la contraseña.
require("dotenv/config")
const { Client } = require("pg")

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("Falta DATABASE_URL en backend/.env")

  const client = new Client({ connectionString: url, connectionTimeoutMillis: 3000 })
  try {
    await client.connect()
    const { rows } = await client.query(
      "SELECT current_user AS usuario, current_database() AS base, current_setting('server_version') AS version",
    )
    console.log("Conexión verificada:", rows[0])
  } finally {
    await client.end().catch(() => {})
  }
}

main().catch((error) => {
  console.error("Conexión fallida:", error.code || error.name)
  process.exitCode = 1
})
