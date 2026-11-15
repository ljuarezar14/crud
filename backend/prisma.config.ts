// =============================================================
// PRISMA CONFIG - Configuración de conexión (Prisma 7+)
// =============================================================
// En Prisma 7, la URL de conexión ya NO va en schema.prisma.
// Este archivo centraliza la configuración de la base de datos.
//
// Prisma lee este archivo para:
//   - prisma generate  → generar el cliente TypeScript
//   - prisma migrate   → crear/actualizar tablas en PostgreSQL
//   - prisma studio    → abrir el explorador visual de datos
//
// La función env() lee de forma segura desde el archivo .env
// =============================================================

import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  // Ubicación del archivo de modelos
  schema: "prisma/schema.prisma",

  // Ubicación de las migraciones SQL generadas
  migrations: {
    path: "db/migrations",
  },

  // Conexión a la base de datos
  // env("DATABASE_URL") lee el valor del archivo .env de forma segura
  datasource: {
    url: env("DATABASE_URL"),
  },
})
