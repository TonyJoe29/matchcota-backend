# Matchcota Backend

Backend escolar para una plataforma de adopcion de mascotas.

## Stack

- Node.js
- Express
- MySQL como base principal
- MongoDB opcional para crecer con logs/notificaciones
- JWT para autenticacion
- Roles: `admin`, `soporte`, `usuario`

## Instalacion

```bash
npm install
```

Crear la base de datos en MySQL:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Levantar servidor:

```bash
npm run dev
```

URL base:

```txt
http://localhost:3000
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
  config/        conexiones MySQL y MongoDB
  controllers/   logica HTTP
  middlewares/   auth, roles, errores y validaciones
  models/        consultas a base de datos
  routes/        endpoints por modulo
  validators/    reglas de entrada
  utils/         helpers compartidos
database/
  schema.sql
  seed.sql
```

## Modelos Principales

- `users`
- `roles`
- `pets`
- `adoption_requests`
- `alert_preferences`
- `support_incidents`
- `notifications`
- `species`
- `breeds`
- `sizes`
- `cities`

## Endpoints Minimos

```txt
GET    /

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

GET    /alerts/me
PUT    /alerts/me

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

1. `POST /auth/login` con usuario admin o usuario.
2. Copiar el `token`.
3. En rutas protegidas usar header `Authorization: Bearer TOKEN`.
4. Crear mascota con `POST /pets`.
5. Crear solicitud con `POST /adoptions`.
6. Ver solicitudes con `GET /adoptions/my-requests`.
7. Cambiar estatus como admin con `PATCH /adoptions/:id/status`.
