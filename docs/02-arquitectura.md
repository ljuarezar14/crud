# 02 · Arquitectura

La arquitectura tiene dos aplicaciones locales y una base de datos: `frontend` en el puerto 5173, `backend` en el 3001 y PostgreSQL en el 5432. La raíz contiene Zod, las herramientas compartidas de pruebas y sus comandos. Se mantienen pocas capas, cada una con una responsabilidad observable.

## Carpetas

| Ruta | Para qué existe |
| --- | --- |
| `backend/src/index.ts` | Carga `.env`, conecta Prisma y abre el puerto. Si la conexión falla, no anuncia la API como iniciada. |
| `backend/src/app.ts` | Construye Express: CORS, JSON, rutas, 404 general y manejador de errores. Se importa en pruebas sin abrir puerto. |
| `backend/src/routes/products.ts` | Asocia método y URL con cada controlador. |
| `backend/src/controllers/products.ts` | Extrae parámetros, valida con Zod y forma la respuesta JSON. Convierte `Decimal` a texto con dos decimales. |
| `backend/src/validation/products.ts` | Declara reglas para crear, actualizar, listar e identificar productos. |
| `backend/src/services/products.ts` | Hace consultas Prisma y aplica reglas de existencia y paginación. No hay capa repository porque sería un traslado de llamadas sin lógica nueva. |
| `backend/src/lib/prisma.ts` | Crea una instancia compartida del cliente con el adaptador PostgreSQL. |
| `backend/src/errors.ts` | Traduce errores de Zod, producto ausente y SKU duplicado a códigos HTTP. |
| `backend/prisma/schema.prisma` | Modelo de Prisma; genera el cliente en `src/generated/prisma`. |
| `backend/db/migrations` | SQL aplicado en orden a cada base. |
| `backend/scripts` | Arranque en desarrollo, comprobación de conexión, seed y runner de pruebas. |
| `frontend/src/api.ts` | Tipos Product y funciones `fetch` para la API. |
| `frontend/src/App.tsx` | Estado de búsqueda, página, mensajes y acciones del listado. |
| `frontend/src/ProductForm.tsx` | Estado local del formulario, validación inmediata y envío. |
| `frontend/src/styles.css` | Diseño adaptable a escritorio y móvil. |

## Flujo de una petición

```text
React (App/ProductForm)
  → fetch en api.ts
  → Express en app.ts
  → ruta de products.ts
  → controlador + validación Zod
  → servicio + Prisma
  → adaptador pg → PostgreSQL
  → controlador serializa JSON → React actualiza el estado
```

Por ejemplo, al crear un producto el formulario transforma `stock` a entero y envía JSON. El controlador valida de nuevo porque el navegador no es una frontera confiable. El servicio llama a `prisma.product.create`. PostgreSQL comprueba el SKU único y las restricciones `CHECK`. Si se repite el SKU, Prisma devuelve `P2002`, `errors.ts` responde 409 y el formulario muestra el mensaje.

## Estado, errores y límites

`App.tsx` conserva productos, búsqueda, página y estado de carga; `ProductForm.tsx` conserva los valores que el usuario está editando. El estado se vuelve a cargar después de crear, editar o eliminar. Un error de red produce un mensaje visible; un error de validación no modifica la base. `app.ts` devuelve 404 para URL no registrada, distinto del 404 de un producto inexistente.

El backend no incluye autenticación ni una capa repository: están fuera del alcance educativo actual. La eliminación es física. `GET /health` solo indica que Express responde; para verificar también PostgreSQL usa `GET /api/products` o `npm run db:check`.

## Comprueba tu comprensión

1. Sigue `GET /api/products?search=cuaderno` y señala dónde se lee `search` y dónde se convierte en SQL.
2. Explica por qué `app.ts` y `index.ts` son archivos distintos.
3. Ubica el cambio necesario para validar un nuevo campo sin duplicar la regla en cinco rutas.
