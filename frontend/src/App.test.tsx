// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import App from "./App"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("React conectado a la API y PostgreSQL de pruebas", () => {
  it("crea, busca, edita y elimina un producto desde la interfaz", async () => {
    const sku = `UI-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const originalFetch = globalThis.fetch
    const requestedUrls: string[] = []
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      requestedUrls.push(String(input))
      return originalFetch(input, init)
    })
    render(<App />)
    await waitFor(() => expect(screen.queryByText("Cargando productos…")).toBeNull())

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Producto UI" } })
    fireEvent.change(screen.getByLabelText("SKU"), { target: { value: sku } })
    fireEvent.change(screen.getByLabelText("Precio"), { target: { value: "7.80" } })
    fireEvent.change(screen.getByLabelText("Stock"), { target: { value: "3" } })
    fireEvent.click(screen.getByRole("button", { name: "Crear producto" }))

    await screen.findByText("Producto UI")
    fireEvent.change(screen.getByLabelText("Buscar por nombre o SKU"), { target: { value: sku } })
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }))
    await waitFor(() => expect(screen.getByText(sku)).toBeTruthy())

    fireEvent.click(screen.getByRole("button", { name: "Editar" }))
    fireEvent.change(screen.getByLabelText("Precio"), { target: { value: "9.10" } })
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }))
    await waitFor(() => expect(screen.getByText("9.10")).toBeTruthy())

    vi.spyOn(window, "confirm").mockReturnValue(true)
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }))
    await screen.findByText("No se encontraron productos.")
    expect(requestedUrls.length).toBeGreaterThan(0)
    expect(requestedUrls.every((url) => url.startsWith("http://localhost:3002/"))).toBe(true)
  })
})
