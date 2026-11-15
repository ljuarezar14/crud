# 01 · Fundamentos

## Qué es un CRUD

CRUD reúne cuatro operaciones sobre datos persistentes: **Create** (crear), **Read** (leer), **Update** (actualizar) y **Delete** (eliminar). En este proyecto una fila de `products` representa un producto. La búsqueda y la paginación son variaciones de lectura. El mismo patrón sirve para estudiantes, clientes o reservas cambiando el modelo y sus reglas.

## Frontend y backend

El **frontend** es el código que ejecuta el navegador. Aquí React dibuja la tabla y los formularios, conserva el estado de la pantalla y llama a la API con `fetch`. El **backend** ejecuta Express en Node.js; valida solicitudes, decide qué operación hacer y accede a PostgreSQL. La contraseña de la base solo existe en el backend. El navegador recibe datos de productos, nunca `DATABASE_URL`.

## HTTP, API REST y JSON

**HTTP** es el protocolo de solicitud y respuesta. Una solicitud tiene método, URL, encabezados y, a veces, cuerpo. Una respuesta tiene código de estado, encabezados y cuerpo. `GET /api/products` pide datos; `POST /api/products` envía un JSON para crear. **REST** organiza operaciones alrededor de recursos identificados por URL; aquí el recurso es `products`. **JSON** es un formato de texto con objetos, arreglos, cadenas, números, booleanos y `null`. Un cuerpo de ejemplo es `{"name":"Cuaderno","sku":"C-1","price":"12.50","stock":3}`. El precio es una cadena porque JSON no tiene un tipo decimal exacto.

Los códigos ayudan a distinguir resultados: 200 significa operación correcta, 201 creación, 400 entrada inválida, 404 recurso inexistente, 409 conflicto por SKU y 500 error interno. El mensaje de error no publica la contraseña ni los detalles de PostgreSQL.

## Base de datos y SQL

Una **base de datos** guarda información más allá de la vida de un proceso. PostgreSQL organiza los productos en la tabla `products`. Las columnas describen atributos, la clave primaria `id` identifica una fila y el índice único de `sku` impide duplicados. **SQL** es el lenguaje para definir tablas y consultar filas. `SELECT * FROM products` lee; `INSERT`, `UPDATE` y `DELETE` cambian datos. Las restricciones de la base protegen la integridad incluso si otro programa no usa nuestra API.

## ORM y Prisma

Un **ORM** permite escribir consultas con objetos y funciones del lenguaje. `prisma.product.findMany()` se convierte en un `SELECT`; `prisma.product.create()` en un `INSERT`. Prisma genera tipos TypeScript a partir de `schema.prisma`, pero PostgreSQL sigue siendo quien almacena y restringe los datos. Las migraciones son archivos SQL versionados que cambian la estructura de forma reproducible. El seed agrega ejemplos para aprender y probar.

## TypeScript

TypeScript añade tipos al código JavaScript. Ayuda a detectar antes de ejecutar que un `id` UUID es una cadena o que `stock` es un número. El compilador `tsc` transforma `.ts` y `.tsx` en JavaScript; Node y el navegador ejecutan JavaScript. Los tipos no reemplazan la validación de solicitudes: cualquier cliente HTTP puede enviar datos incorrectos, por eso Zod valida en tiempo de ejecución.

## Comprueba tu comprensión

1. Describe qué parte del sistema conoce la contraseña de PostgreSQL.
2. Explica por qué un tipo TypeScript no basta para rechazar un precio negativo enviado por HTTP.
3. Reescribe el flujo de un `POST /api/products` usando las palabras HTTP, JSON, Zod, Prisma y PostgreSQL.
