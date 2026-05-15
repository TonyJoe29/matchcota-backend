# Matchcota Backend

Backend escolar para una plataforma de adopcion de mascotas.

## Stack

- Node.js
- Express
- SQLite
- JWT para autenticacion
- Roles: `admin`, `soporte`, `usuario`

## Instalacion

```bash
npm install
```

Si no existe `.env`, crea uno desde el ejemplo:

```bash
copy .env.example .env
```

## Base De Datos

Este proyecto usa SQLite. Eso significa que la base de datos es un archivo local:

```txt
database/matchcota.sqlite
```

Para crear la base por primera vez:

```bash
npm run db:init
```

Para borrar y recrear la base desde cero:

```bash
npm run db:reset
```

Los scripts usan:

```txt
database/schema.sql
database/seed.sql
```

## Levantar Servidor

```bash
npm run dev
```

URL base:

```txt
http://localhost:3000
```

Frontend integrado:

```txt
http://localhost:3000/frontend/home.html
```

Prueba rapida:

```txt
GET http://localhost:3000/
```

## Usuarios De Prueba

```txt
Admin:
email: admin@matchcota.test
password: Admin123!

Usuario:
email: adis06@gmail.com
password: Usuario123!
```

## Estructura

```txt
src/
  config/        conexion SQLite
  controllers/   logica HTTP
  middlewares/   auth, roles, errores y validaciones
  models/        consultas a base de datos
  routes/        endpoints por modulo
  validators/    reglas de entrada
  utils/         helpers compartidos
database/
  schema.sql
  seed.sql
  matchcota.sqlite
frontend/
  paginas HTML conectadas a la API
postman/
  Matchcota Backend.postman_collection.json
```

## Endpoints Principales

```txt
POST   /auth/register
POST   /auth/login
GET    /auth/me

GET    /users/profile
PUT    /users/profile
GET    /users/alerts
PUT    /users/alerts

GET    /pets
GET    /pets/:id
POST   /pets
PUT    /pets/:id
DELETE /pets/:id

POST   /adoptions
GET    /adoptions/my-requests
GET    /adoptions
GET    /adoptions/:id
PATCH  /adoptions/:id/status

POST   /support/incidents
GET    /support/incidents
PATCH  /support/incidents/:id/status

GET    /admin/stats
GET    /admin/users
PATCH  /admin/users/:id/role
PATCH  /admin/users/:id/status

GET    /catalogs/species
GET    /catalogs/breeds
GET    /catalogs/sizes
GET    /catalogs/cities
```

## Flujo MVP En Postman

1. `POST /auth/login` con usuario normal.
2. Copiar el `token`.
3. Usar header `Authorization: Bearer TOKEN`.
4. Crear mascota con `POST /pets`.
5. Crear solicitud con `POST /adoptions`.
6. Ver solicitudes con `GET /adoptions/my-requests`.
7. Iniciar sesion como admin.
8. Cambiar estatus con `PATCH /adoptions/:id/status`.
