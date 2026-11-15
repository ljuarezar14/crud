export type Product = {
  id: string
  name: string
  sku: string
  description: string | null
  price: string
  stock: number
  createdAt: string
  updatedAt: string
}

export type ProductInput = Pick<Product, "name" | "sku" | "description" | "price" | "stock">

export type PageMeta = { page: number; limit: number; total: number; pages: number }

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    })
  } catch {
    throw new Error("No se pudo conectar con la API. Comprueba que el backend esté iniciado.")
  }

  const body: unknown = await response.json()
  if (!response.ok) {
    const error = body as { error?: { message?: string } }
    throw new Error(error.error?.message ?? `Error HTTP ${response.status}`)
  }
  return body as T
}

export function listProducts(page: number, search: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(page), limit: "10" })
  if (search) params.set("search", search)
  return request<{ data: Product[]; meta: PageMeta }>(`/api/products?${params}`, { signal })
}

export function createProduct(input: ProductInput) {
  return request<{ data: Product }>("/api/products", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateProduct(id: string, input: ProductInput) {
  return request<{ data: Product }>(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

export function deleteProduct(id: string) {
  return request<{ data: { id: string } }>(`/api/products/${id}`, { method: "DELETE" })
}
