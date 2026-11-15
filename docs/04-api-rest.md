# 04 · API REST

URL base: `http://localhost:3001`. Envía `Content-Type: application/json` para POST y PATCH. Las respuestas exitosas usan `{ "data": ... }`; el listado añade `meta`. Los errores usan `{ "error": { "code": "...", "message": "..." } }`; los errores 400 incluyen `details` de Zod.

| Método y ruta | Entrada | Éxito | Errores principales |
| --- | --- | --- | --- |
| `POST /api/products` | JSON de producto | 201 | 400, 409, 500 |
| `GET /api/products` | `page`, `limit`, `search` opcionales | 200 | 400, 500 |
| `GET /api/products/:id` | UUID en la URL | 200 | 400, 404, 500 |
| `PATCH /api/products/:id` | UUID y al menos un campo JSON | 200 | 400, 404, 409, 500 |
| `DELETE /api/products/:id` | UUID en la URL | 200 | 400, 404, 500 |

## Crear

En Postman: método `POST`, URL `http://localhost:3001/api/products`, pestaña Body → raw → JSON:

```json
{
  "name": "Cuaderno",
  "sku": "CUAD-001",
  "description": "100 hojas",
  "price": "12.50",
  "stock": 20
}
```

`name`, `sku`, `price` y `stock` son obligatorios. `description` admite texto, `null` o ausencia. `price` es una **cadena** positiva con exactamente dos decimales; `stock` es un entero no negativo. `sku` admite letras, números, `_` y `-`, y se guarda en mayúsculas. Una respuesta 201 tiene esta forma (UUID y fechas cambian):

```json
{
  "data": {
    "id": "9dd8d03f-2a41-4123-bde3-c20336751813",
    "name": "Cuaderno",
    "sku": "CUAD-001",
    "description": "100 hojas",
    "price": "12.50",
    "stock": 20,
    "createdAt": "2026-11-15T12:00:00.000Z",
    "updatedAt": "2026-11-15T12:00:00.000Z"
  }
}
```

Repetir el mismo SKU devuelve 409 con `code: "SKU_DUPLICATE"`. Enviar `"price":"-1.00"` o quitar el nombre devuelve 400 con `code: "VALIDATION_ERROR"`.

## Listar y buscar

En Postman usa `GET http://localhost:3001/api/products?page=1&limit=10&search=cuad`. `search` busca sin distinguir mayúsculas en nombre o SKU. `page` empieza en 1 y `limit` va de 1 a 100. Si omites ambos, se usa página 1 y límite 10. Ejemplo abreviado:

```json
{
  "data": [{ "id": "9dd8d03f-2a41-4123-bde3-c20336751813", "name": "Cuaderno", "sku": "CUAD-001", "description": "100 hojas", "price": "12.50", "stock": 20, "createdAt": "2026-11-15T12:00:00.000Z", "updatedAt": "2026-11-15T12:00:00.000Z" }],
  "meta": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
}
```

## Consultar, actualizar y eliminar

Sustituye `:id` por el UUID recibido al crear. `GET /api/products/:id` devuelve el objeto bajo `data`. `PATCH /api/products/:id` acepta cualquier subconjunto no vacío de los campos de creación, por ejemplo `{ "price": "13.25", "stock": 18 }`, y devuelve el producto actualizado. `DELETE /api/products/:id` elimina físicamente y responde `{ "data": { "id": "..." } }`. Después, GET del mismo ID devuelve 404 `PRODUCT_NOT_FOUND`.

Un ID mal formado devuelve 400. Una URL no registrada devuelve 404 `ROUTE_NOT_FOUND`. Ante una falla interna o de PostgreSQL durante una petición, la API devuelve 500 `INTERNAL_ERROR` sin publicar detalles de conexión.

## Comprueba tu comprensión

1. Envía en Postman un precio como número `12.5` y observa la validación; después envíalo como cadena `"12.50"`.
2. Crea un producto, consulta su UUID, actualiza solo `stock` y vuelve a consultarlo.
3. Busca por una parte del SKU en minúsculas y comprueba `meta.total`.
