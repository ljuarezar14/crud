# Preparación del entorno CRUD en Windows

Stack implementado: React, TypeScript y Vite en el frontend; Node.js, Express, Prisma y PostgreSQL en el backend. Para instalarlo desde una copia limpia, sigue el [README](README.md).

## Fase 1: diagnosticar

En PowerShell:

```powershell
node --version
npm --version
git --version
psql --version
pg_config --version
Get-Service *postgres*
pg_isready -h localhost -p 5432
```

Los comandos `--version` muestran qué ejecutables encuentra PowerShell. `Get-Service` indica si el servicio está en marcha; `pg_isready` comprueba si PostgreSQL escucha en el puerto 5432. Eso todavía no verifica las credenciales.

Comprobado en esta laptop el 15 de noviembre de 2026: Node.js 22.14.0, npm 10.9.2, Git 2.49.0.windows.1, PostgreSQL y `psql` 18.7. El servicio `postgresql-x64-18` estaba activo y `pg_isready` devolvió `accepting connections`. No faltan estas herramientas y no se instaló software del sistema.

Si alguna falta en otra máquina, descarga Node.js desde https://nodejs.org/, Git para Windows desde https://git-scm.com/download/win y PostgreSQL para Windows desde https://www.postgresql.org/download/windows/. Durante la instalación de PostgreSQL, conserva la contraseña que elijas para `postgres` y el puerto 5432. Abre una nueva ventana de PowerShell y repite los comandos de versión. Solicita autorización antes de instalar programas del sistema.

## Fase 2: crear usuario y base de datos si faltan

En esta laptop ya existen `crud_user` y `crud_lab`: una sesión real confirmó ambos. No repitas aquí los comandos de creación. Para una instalación nueva, abre una sesión de administrador:

```powershell
psql -h localhost -p 5432 -U postgres -d postgres -W
```

`-W` solicita la contraseña de forma interactiva. Dentro de `psql`:

```sql
CREATE ROLE crud_user LOGIN;
\password crud_user
CREATE DATABASE crud_lab OWNER crud_user;
CREATE DATABASE crud_lab_test OWNER crud_user;
\q
```

`CREATE ROLE` crea una identidad separada para el proyecto. `\password` pide su contraseña sin ponerla en el comando ni en el historial de PowerShell. `OWNER` le da control sobre su base. `crud_lab_test` aísla las pruebas automatizadas; el runner también puede crearla si `crud_user` tiene permiso `CREATEDB`. Si ya existen el rol o las bases, PostgreSQL indicará que están duplicados.

## Fase 3: configurar Prisma y el secreto local

Desde `D:\crud\backend`, copia la plantilla y edita únicamente el archivo local:

```powershell
Copy-Item .env.example .env
notepad .env
```

Sustituye `TU_PASSWORD_AQUI` en `DATABASE_URL` por la contraseña de `crud_user`. La forma es `postgresql://crud_user:CONTRASEÑA@localhost:5432/crud_lab?schema=public`. Si contiene caracteres reservados de URL como `@`, `:`, `/`, `#` o `%`, codifícalos como `%40`, `%3A`, `%2F`, `%23` y `%25` respectivamente. No compartas `.env`, capturas de su contenido ni la URL completa. `backend/.gitignore` excluye `.env`; la plantilla `.env.example` no contiene secretos.

`backend/prisma/schema.prisma` define los modelos. En Prisma 7, `backend/prisma.config.ts` lee `DATABASE_URL` del entorno. Así, el esquema y las migraciones pueden compartirse sin publicar credenciales.

## Fase 4: comprobar la conexión

En PowerShell:

```powershell
Set-Location D:\crud\backend
npm run db:check
$env:JITI_FS_CACHE = 'false'
npm exec -- prisma validate
npm exec -- prisma migrate status
```

`db:check` abre una conexión con `.env` y ejecuta SQL que devuelve usuario, base y versión del servidor; oculta la contraseña y, ante un fallo, muestra solo el código de error. `prisma validate` comprueba configuración y esquema. `prisma migrate status` consulta la base y compara migraciones, sin aplicarlas.

Para comprobar también el acceso interactivo con `psql`, ejecuta `psql -h localhost -p 5432 -U crud_user -d crud_lab -W -c "SELECT current_user, current_database();"`. `-W` pide la contraseña sin incluirla en el comando.

Resultado observado: `db:check` devolvió `crud_user`, `crud_lab` y PostgreSQL `18.7`; `psql` confirmó el mismo usuario y base con permisos `CREATE` en la base y el esquema `public`; Prisma indicó esquema válido y dos migraciones aplicadas, sin cambios pendientes. La conexión quedó verificada. `JITI_FS_CACHE=false` evita un error de permisos de caché en este entorno.

## Cómo se conectan las piezas

El navegador ejecuta React y llama por HTTP a Express. Express procesa la solicitud y usa Prisma para consultar PostgreSQL. La respuesta regresa al frontend. La contraseña de la base permanece en el backend; el navegador no la necesita.

## Arrancar el backend durante el desarrollo

```powershell
Set-Location D:\crud\backend
npm run dev
```

El proyecto usa TypeScript 7.0.2. `ts-node-dev` 2.0.0 produjo el error `Cannot read properties of undefined (reading 'fileExists')` al intentar ejecutarlo. El comando `dev` ahora hace una primera compilación con `tsc`, deja el compilador observando cambios y ejecuta `node --watch` sobre `dist/index.js`. Cuando editas un archivo de `src`, TypeScript actualiza `dist` y Node reinicia el servidor. `Ctrl+C` detiene el proceso de desarrollo.

`npm run build` verifica los tipos y genera JavaScript en `dist`. `GET http://localhost:3001/health` comprueba que Express responde; `GET http://localhost:3001/api/products` también prueba una consulta a PostgreSQL mediante el adaptador de Prisma. Se verificaron ambos endpoints el 15 de noviembre de 2026: `/health` devolvió `ok` y `/api/products` devolvió los productos del seed.
