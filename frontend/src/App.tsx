import { useEffect, useState, type FormEvent } from "react"
import ProductForm from "./ProductForm"
import * as api from "./api"
import type { PageMeta, Product, ProductInput } from "./api"

export default function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [meta, setMeta] = useState<PageMeta>({ page: 1, limit: 10, total: 0, pages: 0 })
  const [page, setPage] = useState(1)
  const [searchDraft, setSearchDraft] = useState("")
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<Product | null>(null)
  const [formVersion, setFormVersion] = useState(0)
  const [refresh, setRefresh] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    api
      .listProducts(page, search, controller.signal)
      .then((result) => {
        setProducts(result.data)
        setMeta(result.meta)
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setError(cause instanceof Error ? cause.message : "Error al cargar productos")
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [page, search, refresh])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    setSearch(searchDraft.trim())
  }

  async function save(input: ProductInput) {
    if (editing) {
      await api.updateProduct(editing.id, input)
      setMessage("Producto actualizado correctamente.")
    } else {
      await api.createProduct(input)
      setMessage("Producto creado correctamente.")
    }
    setEditing(null)
    setFormVersion((value) => value + 1)
    setPage(1)
    setRefresh((value) => value + 1)
  }

  async function remove(product: Product) {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return
    try {
      await api.deleteProduct(product.id)
      setMessage("Producto eliminado correctamente.")
      setError("")
      if (products.length === 1 && page > 1) setPage(page - 1)
      else setRefresh((value) => value + 1)
      if (editing?.id === product.id) setEditing(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar el producto.")
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">CL</span>
          <span>CRUD LAB</span>
        </div>
        <span className="header-note">Sistema de gestión de productos</span>
      </header>
      <main>
        <div className="page-intro">
          <div>
            <p className="eyebrow">INVENTARIO · PROYECTO EDUCATIVO</p>
            <h1>Productos</h1>
            <p>Registra, consulta y administra los productos de tu base de datos local.</p>
          </div>
          <div className="count-card">
            <strong>{meta.total}</strong>
            <span>{meta.total === 1 ? "producto registrado" : "productos registrados"}</span>
          </div>
        </div>
        {message && (
          <p className="alert alert-success" role="status">
            {message}
            <button type="button" onClick={() => setMessage("")} aria-label="Cerrar mensaje">
              ×
            </button>
          </p>
        )}
        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}
        <div className="content-grid">
          <section className="panel list-panel" aria-labelledby="list-title">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">LISTADO</p>
                <h2 id="list-title">Todos los productos</h2>
              </div>
            </div>
            <form className="search-form" onSubmit={submitSearch}>
              <label htmlFor="search">Buscar por nombre o SKU</label>
              <div className="search-row">
                <input
                  id="search"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Escribe para buscar"
                />
                <button className="button button-secondary" type="submit">
                  Buscar
                </button>
              </div>
            </form>
            {loading ? (
              <p className="empty-state" role="status">
                Cargando productos…
              </p>
            ) : products.length === 0 ? (
              <p className="empty-state">
                {search
                  ? "No se encontraron productos."
                  : "Aún no hay productos. Crea el primero con el formulario."}
              </p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>SKU</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <strong>{product.name}</strong>
                          {product.description && <small>{product.description}</small>}
                        </td>
                        <td>
                          <code>{product.sku}</code>
                        </td>
                        <td>{product.price}</td>
                        <td>
                          <span
                            className={
                              product.stock === 0 ? "stock-badge stock-empty" : "stock-badge"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              onClick={() => {
                                setEditing(product)
                                setMessage("")
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => void remove(product)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pagination">
              <span>
                Página {meta.page} de {Math.max(meta.pages, 1)}
              </span>
              <div>
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={page >= meta.pages || loading}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </section>
          <ProductForm
            key={editing?.id ?? `new-${formVersion}`}
            product={editing}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        </div>
      </main>
      <footer>CRUD LAB · React + Express + PostgreSQL</footer>
    </div>
  )
}
