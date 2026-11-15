# CRUD Lab: gestión de productos

Proyecto educativo Full Stack para crear, consultar, buscar, actualizar y eliminar productos. React muestra la interfaz; Express recibe HTTP; Prisma consulta PostgreSQL. El precio viaja como **cadena decimal** (`"12.50"`) para evitar errores de precisión de JavaScript.

## Requisitos previos

- Windows con PowerShell, Node.js 22 LTS compatible, npm y PostgreSQL local con `psql`.
- Un usuario `crud_user` y una base `crud_lab` en PostgreSQL. La [guía del entorno](ENTORNO.md) explica cómo crearlos sin publicar contraseñas.
- Puerto 5432 para PostgreSQL, 3001 para la API y 5173 para Vite. Las pruebas usan 3002 y una base separada llamada `crud_lab_test`.

## Instalación desde una copia limpia

Abre PowerShell en la raíz del proyecto y ejecuta:

```powershell
npm ci
Set-Location backend
npm ci
Copy-Item .env.example .env
notepad .env
$env:JITI_FS_CACHE = 'false'
npm exec -- prisma migrate deploy
npm exec -- prisma generate
npm run db:seed
npm run db:check
Set-Location ..\frontend
npm ci
Set-Location ..
```

Pon la contraseña de `crud_user` solo en `backend/.env`. No incluyas el archivo en Git ni compartas la URL completa. El `backend/.env.example` muestra las variables `DATABASE_URL`, `PORT`, `NODE_ENV` y `FRONTEND_URL`. `frontend/.env.example` permite cambiar `VITE_API_URL`; sin archivo `.env`, el frontend usa `http://localhost:3001`. La variable `JITI_FS_CACHE=false` evita que Prisma intente escribir caché dentro de `node_modules` en entornos con esa carpeta protegida.

`npm ci` instala dependencias según los archivos `package-lock.json`. La raíz contiene Zod y herramientas de pruebas compartidas; `backend` contiene Express y Prisma; `frontend` contiene React y Vite. `prisma migrate deploy` aplica las migraciones versionadas de `backend/db/migrations`; `prisma generate` genera el cliente en `backend/src/generated/prisma`; el seed agrega dos productos sin duplicarlos si se repite.

## Ejecución

En una terminal:

```powershell
Set-Location backend
npm run dev
```

En otra terminal:

```powershell
Set-Location frontend
npm run dev
```

Abre `http://localhost:5173`. La API responde en `http://localhost:3001/api/products`. `Ctrl+C` detiene cada servidor.

## Comprobaciones

Desde la raíz:

```powershell
npm run typecheck
npm run lint
npm run format:check
npm test
npm --prefix backend run build
npm --prefix frontend run build
```

`npm test` crea `crud_lab_test` si falta, aplica allí las migraciones y ejecuta pruebas HTTP, de error de base, de React con API real y de persistencia tras reiniciar la API. El runner solo acepta una `DATABASE_URL` de `crud_lab` en `localhost` o `127.0.0.1`; **borra registros de la base de pruebas**, nunca de `crud_lab`. Si `crud_user` no puede crear bases, crea `crud_lab_test` como administrador y asigna su propiedad a `crud_user` (consulta [ENTORNO.md](ENTORNO.md)).

`npm run format` aplica Prettier al código escrito a mano; `npm run format:check` solo comprueba el formato. Los archivos generados por Prisma se excluyen.

## Estructura y guía de estudio

| Ruta | Responsabilidad |
| --- | --- |
| `backend/prisma/schema.prisma` | Modelo y tipos de datos |
| `backend/db/migrations` | SQL reproducible de las dos migraciones |
| `backend/src/validation` | Reglas Zod de entrada |
| `backend/src/routes` y `controllers` | Rutas HTTP y respuestas JSON |
| `backend/src/services` y `lib/prisma.ts` | Consultas a PostgreSQL |
| `frontend/src/api.ts` | Fetch y tipos de respuesta |
| `frontend/src/App.tsx` y `ProductForm.tsx` | Estado, tabla y formularios |
| `backend/tests` y `frontend/src/App.test.tsx` | Pruebas automatizadas |

Lee en orden: [fundamentos](docs/01-fundamentos.md), [arquitectura](docs/02-arquitectura.md), [base de datos](docs/03-base-de-datos.md), [API REST](docs/04-api-rest.md), [pruebas](docs/05-pruebas.md) y [ejercicios](docs/06-ejercicios.md).

## Errores frecuentes

| Síntoma | Comprobación y solución |
| --- | --- |
| `ECONNREFUSED` o `P1001` | Comprueba `Get-Service *postgres*` y `pg_isready -h localhost -p 5432`. |
| Error de contraseña | Revisa `backend/.env` sin mostrarlo en pantalla ni subirlo a Git. Si la contraseña contiene `@`, `:`, `/`, `#` o `%`, codifica esos caracteres en la URL. |
| Falta la tabla `products` | En `backend`, ejecuta `npm exec -- prisma migrate deploy`. |
| Falta el cliente Prisma | En `backend`, ejecuta `npm exec -- prisma generate`. |
| Caché de Prisma con `EPERM` | En PowerShell, define `$env:JITI_FS_CACHE = 'false'` y repite el comando. |
| El frontend no conecta | Inicia el backend, comprueba `http://localhost:3001/health` y usa `http://localhost:5173` para abrir Vite. |
| Puerto ocupado | Cierra el servidor anterior con `Ctrl+C` antes de arrancar otro. |

El directorio antiguo `backend/prisma/migrations` se conserva como historial previo; Prisma utiliza `backend/db/migrations`. No edites migraciones ya aplicadas.
