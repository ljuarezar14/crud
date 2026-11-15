import { useState, type FormEvent } from "react"
import type { Product, ProductInput } from "./api"

type Props = {
  product: Product | null
  onSave: (input: ProductInput) => Promise<void>
  onCancel: () => void
}

export default function ProductForm({ product, onSave, onCancel }: Props) {
  const [name, setName] = useState(product?.name ?? "")
  const [sku, setSku] = useState(product?.sku ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [price, setPrice] = useState(product?.price ?? "")
  const [stock, setStock] = useState(String(product?.stock ?? 0))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedPrice = price.trim()
    if (!name.trim() || !sku.trim()) {
      setError("Nombre y SKU son obligatorios.")
      return
    }
    if (!/^(?:0|[1-9]\d{0,9})\.\d{2}$/.test(normalizedPrice) || normalizedPrice === "0.00") {
      setError("Escribe un precio positivo con dos decimales, por ejemplo 12.50.")
      return
    }
    if (!Number.isSafeInteger(Number(stock)) || Number(stock) < 0 || Number(stock) > 2147483647) {
      setError("El stock debe ser un entero entre 0 y 2147483647.")
      return
    }

    setSaving(true)
    setError("")
    try {
      await onSave({
        name: name.trim(),
        sku: sku.trim(),
        description: description.trim() || null,
        price: normalizedPrice,
        stock: Number(stock),
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el producto.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="panel form-panel" aria-labelledby="form-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{product ? "EDITAR REGISTRO" : "NUEVO REGISTRO"}</p>
          <h2 id="form-title">{product ? "Editar producto" : "Agregar producto"}</h2>
        </div>
      </div>
      <form onSubmit={submit} className="product-form">
        <label>
          Nombre
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            required
          />
        </label>
        <label>
          SKU
          <input
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            maxLength={64}
            required
            placeholder="EJEMPLO-001"
          />
        </label>
        <label>
          Descripción
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Opcional"
          />
        </label>
        <div className="form-row">
          <label>
            Precio
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="decimal"
              required
              placeholder="12.50"
            />
          </label>
          <label>
            Stock
            <input
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              type="number"
              min="0"
              max="2147483647"
              step="1"
              required
            />
          </label>
        </div>
        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
          </button>
          {product && (
            <button className="button button-secondary" type="button" onClick={onCancel}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
