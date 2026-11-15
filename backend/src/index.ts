import "dotenv/config"
import app from "./app"
import prisma from "./lib/prisma"

const port = Number(process.env.PORT ?? 3001)

async function start(): Promise<void> {
  await prisma.$connect()
  app.listen(port, () => {
    console.log(`API disponible en http://localhost:${port}`)
  })
}

start().catch((error: unknown) => {
  console.error("No se pudo iniciar la API:", error instanceof Error ? error.message : error)
  process.exitCode = 1
})
