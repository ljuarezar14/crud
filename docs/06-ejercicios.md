# 06 · Ejercicios para reconstruir el CRUD

Trabaja en una copia del proyecto o en una rama propia. Después de cada cambio ejecuta `npm run typecheck`, `npm run lint` y `npm test` desde la raíz. Evita cambiar la base `crud_lab_test` manualmente mientras se ejecutan pruebas.

## Nivel 1 · Comprender el recorrido

1. Abre `frontend/src/ProductForm.tsx`, `frontend/src/api.ts`, `backend/src/routes/products.ts`, `backend/src/controllers/products.ts` y `backend/src/services/products.ts`. Dibuja el recorrido de un clic en **Crear producto**. Anota el valor y tipo de `price` en cada paso.
2. Cambia el texto del estado vacío en `App.tsx`; comprueba en Vite que cambió y restaura el texto. Esto enseña el ciclo editar → compilar → observar.
3. Usa Postman para crear un producto. Consulta la misma fila en `psql` con `SELECT "name", "sku", "price" FROM products;`.

## Nivel 2 · Validación y errores

4. Añade una prueba para nombre compuesto solo de espacios. Antes de ejecutarla, predice si Zod devolverá 400.
5. Envía un `PATCH` sin campos. Localiza la regla que produce 400 y explica por qué no tiene sentido una actualización vacía.
6. Simula un SKU duplicado desde el formulario. Sigue `P2002 → errors.ts → respuesta 409 → mensaje en ProductForm`.

## Nivel 3 · Modificar el dominio

7. Agrega un campo opcional `category` a Product. Crea una **nueva** migración, regenera Prisma, modifica validación, controlador, formulario y pruebas. No edites migraciones ya aplicadas.
8. Agrega un filtro de stock bajo al listado. Decide el parámetro HTTP, la validación Zod y la condición Prisma. Mantén la paginación.
9. Agrega ordenamiento por precio ascendente o descendente. Permite solo valores conocidos para evitar parámetros arbitrarios.

## Nivel 4 · Trasladar el patrón

10. Diseña una entidad `Student` con matrícula única. Escribe primero el esquema y las restricciones, luego enumera las rutas, respuestas y pruebas. Compara la matrícula con el SKU.
11. Diseña `Reservation` con fecha de inicio y fin. Define una regla que impida fin anterior al inicio y decide si se valida también en SQL.

## Reconstrucción sin IA

1. Crea una carpeta vacía para un proyecto nuevo; escribe en papel el diagrama `React → HTTP → Express → Prisma → PostgreSQL`.
2. Implementa solo la tabla y una migración. Confirma con `psql` que las columnas y restricciones existen.
3. Implementa `GET /api/products` sin interfaz. Pruébalo con Postman y escribe un caso automatizado.
4. Implementa `POST` con Zod y un caso inválido. Añade `GET /:id`, `PATCH` y `DELETE` uno por uno, con pruebas positivas y negativas.
5. Crea un componente React que solo liste. Después agrega formulario, búsqueda, edición, eliminación y mensajes de error.
6. Escribe un README que otra persona pueda ejecutar desde una copia limpia. Compara tu resultado con este proyecto solo al terminar cada paso.

## Preguntas de autoevaluación

- ¿Por qué el frontend no debe conocer `DATABASE_URL`?
- ¿Qué diferencia hay entre validar un SKU en Zod y tener un índice `UNIQUE` en PostgreSQL?
- ¿Por qué el precio viaja como cadena JSON aunque se guarda como `DECIMAL(12,2)`?
- ¿Qué parte cambiarías primero si el CRUD fuera de estudiantes en lugar de productos?
- ¿Qué información aporta una prueba con PostgreSQL que no aporta un mock?
