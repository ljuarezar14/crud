# 05 · Pruebas

## Estrategia

Las pruebas HTTP usan Vitest y Supertest sobre `app.ts`. Supertest llama a Express sin abrir un puerto, pero las consultas Prisma sí llegan a `crud_lab_test`, una base PostgreSQL distinta de `crud_lab`. `backend/tests/products.test.ts` comprueba reglas y operaciones reales. `backend/tests/database-failure.test.ts` sustituye Prisma por un doble que falla para verificar el código 500 y que la respuesta no publique detalles internos. Ese caso no simula una caída física del servicio PostgreSQL.

`frontend/src/App.test.tsx` usa Testing Library y jsdom para llenar el formulario y pulsar botones. Durante esa prueba hay una API Express real en el puerto 3002, conectada a `crud_lab_test`; por tanto verifica `React → fetch → Express → Prisma → PostgreSQL`. jsdom simula el DOM, no es una inspección visual en un navegador real. El runner crea además un producto, detiene el proceso Node, lo inicia de nuevo y recupera el producto por HTTP: esa es la comprobación de persistencia tras reinicio.

## Ejecutar

Desde la raíz, con PostgreSQL activo y `backend/.env` configurado:

```powershell
npm run typecheck
npm run lint
npm run format:check
npm test
npm --prefix backend run build
npm --prefix frontend run build
```

`npm test` prepara `crud_lab_test` si falta, aplica migraciones, genera el cliente y compila el backend. Verifica que `backend/.env` apunte a `crud_lab` en localhost antes de hacer cambios; las pruebas limpian filas solo de `crud_lab_test`. Si el usuario no tiene permiso `CREATEDB`, crea la base de pruebas con el administrador siguiendo el README.

## Casos y resultados ejecutados

Ejecución local del 15 de noviembre de 2026:

| Caso | Tipo | Resultado |
| --- | --- | --- |
| Crear producto válido y conservar `"12.50"` | HTTP + PostgreSQL | Pasó |
| Rechazar producto sin nombre | HTTP | Pasó, 400 |
| Rechazar precio negativo | HTTP | Pasó, 400 |
| Rechazar stock negativo | HTTP | Pasó, 400 |
| Rechazar stock fuera de `INTEGER` | HTTP | Pasó, 400 |
| Rechazar SKU duplicado | HTTP + índice único | Pasó, 409 |
| Listar, buscar y paginar | HTTP + PostgreSQL | Pasó |
| Consultar producto existente | HTTP + PostgreSQL | Pasó, 200 |
| Consultar producto inexistente | HTTP | Pasó, 404 |
| Rechazar UUID inválido | HTTP | Pasó, 400 |
| Actualizar producto | HTTP + PostgreSQL | Pasó |
| Eliminar y comprobar que desapareció | HTTP + PostgreSQL | Pasó |
| Reconectar Prisma y leer el registro | PostgreSQL | Pasó |
| Responder a falla simulada de base sin filtrar detalles | HTTP + doble de Prisma | Pasó, 500 |
| Crear, buscar, editar y eliminar desde React | jsdom + API + PostgreSQL | Pasó |
| Leer el producto tras reiniciar el proceso API | HTTP + PostgreSQL | Pasó |

Vitest informó **15 pruebas aprobadas** en tres archivos; la comprobación adicional de reinicio también pasó. `typecheck` de ambos proyectos, ESLint y Prettier `format:check` pasaron. La compilación del frontend y backend también se ejecutó sin errores.

La auditoría npm del mismo día informó **0 avisos** en las dependencias de ejecución del backend y **0** en frontend. La raíz conservó **7 avisos moderados** en dependencias transitivas de `typescript-eslint`/`minimatch`, usadas para lint. La actualización automática no ofreció una corrección compatible; no se aplicó `--force`.

## Cómo interpretar un fallo

Un fallo en `prepare-test-db.cjs` indica un problema de conexión, credenciales o permiso para crear `crud_lab_test`; no ejecutes pruebas destructivas apuntando a otra base. Un 400 inesperado apunta a Zod o al JSON enviado. Un 409 apunta al índice único de SKU. Un 500 inesperado requiere revisar la consola del backend; la API muestra al cliente un mensaje genérico. Un fallo de la prueba React puede venir de Vite/jsdom, de la API en 3002 o de PostgreSQL: lee el primer error, no solo el resumen final.

## Comprueba tu comprensión

1. Agrega una prueba que envíe `stock: 1.5` y espere 400.
2. Agrega una prueba que actualice un SKU al SKU de otro producto y espere 409.
3. Explica qué demuestra la prueba de reinicio que no demuestra una prueba con datos en memoria.
