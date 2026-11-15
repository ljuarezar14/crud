import express from "express"
import cors from "cors"
import productsRouter from "./routes/products"
import { errorHandler } from "./errors"

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }))
app.use(express.json())

app.get("/health", (_request, response) => {
  response.json({ status: "ok" })
})
app.use("/api/products", productsRouter)
app.use((_request, response) => {
  response.status(404).json({ error: { code: "ROUTE_NOT_FOUND", message: "Ruta no encontrada" } })
})
app.use(errorHandler)

export default app
