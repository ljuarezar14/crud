const path = require("node:path")
const { randomUUID } = require("node:crypto")
const { spawn, spawnSync } = require("node:child_process")
const { prepareTestDatabase } = require("./prepare-test-db.cjs")

const root = path.resolve(__dirname, "..", "..")
const vitest = path.join(root, "node_modules", "vitest", "vitest.mjs")

function runVitest(file, env) {
  const result = spawnSync(process.execPath, [vitest, "run", file], {
    cwd: root,
    env,
    stdio: "inherit",
  })
  if (result.status !== 0) throw new Error(`Fallaron las pruebas de ${file}`)
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch("http://localhost:3002/health")
      if (response.ok) return
    } catch {
      /* Espera el arranque del proceso. */
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error("La API de pruebas no inició en el puerto 3002")
}

async function main() {
  const databaseUrl = await prepareTestDatabase()
  const testEnv = { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: "test" }
  const tsc = path.join(root, "backend", "node_modules", "typescript", "bin", "tsc")
  const build = spawnSync(process.execPath, [tsc], {
    cwd: path.join(root, "backend"),
    stdio: "inherit",
  })
  if (build.status !== 0) throw new Error("Falló la compilación del backend")
  runVitest("backend/tests/products.test.ts", testEnv)
  runVitest("backend/tests/database-failure.test.ts", testEnv)

  function startServer() {
    return spawn(process.execPath, [path.join(root, "backend", "dist", "index.js")], {
      cwd: path.join(root, "backend"),
      env: { ...testEnv, PORT: "3002", FRONTEND_URL: "http://localhost:5173" },
      stdio: "ignore",
    })
  }
  let server = startServer()
  try {
    await waitForServer()
    runVitest("frontend/src/App.test.tsx", { ...testEnv, VITE_API_URL: "http://localhost:3002" })
    const sku = `RESTART-${randomUUID().slice(0, 8)}`
    const created = await fetch("http://localhost:3002/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Persistencia", sku, price: "5.20", stock: 1 }),
    })
    if (created.status !== 201) throw new Error("No se pudo crear el producto de persistencia")
    const id = (await created.json()).data.id
    await new Promise((resolve) => {
      server.once("exit", resolve)
      server.kill()
    })
    server = startServer()
    await waitForServer()
    const read = await fetch(`http://localhost:3002/api/products/${id}`)
    if (!read.ok || (await read.json()).data.sku !== sku.toUpperCase()) {
      throw new Error("El producto no persistió tras reiniciar la API")
    }
    await fetch(`http://localhost:3002/api/products/${id}`, { method: "DELETE" })
    console.log("Persistencia tras reinicio de la API: verificada")
  } finally {
    server.kill()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
