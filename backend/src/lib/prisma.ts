// =============================================================
// CLIENTE PRISMA - Instancia compartida en toda la aplicación
// =============================================================
// Patrón Singleton: una sola instancia de PrismaClient reutilizada
// en todos los archivos del proyecto.
//
// ¿Por qué Singleton?
// Crear múltiples instancias de PrismaClient agota las conexiones
// disponibles en PostgreSQL. Con este patrón, siempre hay UNA sola.
// =============================================================

import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// En desarrollo, guardamos la instancia en la variable global
// para que hot-reload no cree múltiples instancias
declare global {
  var prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("Falta DATABASE_URL en backend/.env")
}

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: ["query", "error", "warn"], // Muestra las queries SQL en consola (útil para aprender)
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

export default prisma
