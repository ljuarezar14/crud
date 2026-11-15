import type { ErrorRequestHandler } from "express"
import { ZodError } from "zod"

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "Datos inválidos", details: error.issues },
    })
    return
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({ error: { code: error.code, message: error.message } })
    return
  }

  const prismaCode =
    typeof error === "object" && error !== null && "code" in error ? String(error.code) : undefined
  if (prismaCode === "P2002") {
    response.status(409).json({ error: { code: "SKU_DUPLICATE", message: "El SKU ya existe" } })
    return
  }
  if (prismaCode === "P2025") {
    response
      .status(404)
      .json({ error: { code: "PRODUCT_NOT_FOUND", message: "Producto no encontrado" } })
    return
  }

  console.error("Error interno:", error)
  response
    .status(500)
    .json({ error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" } })
}
