# Ecommerce Backend - Pre-Entrega 1

Backend de un ecommerce con CRUD de usuarios, autenticación y autorización usando JWT, Passport y bcrypt.

## Tecnologías

- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **Passport** (Local + JWT)
- **bcrypt** (hasheo de contraseñas)
- **JWT** (JSON Web Tokens)

## Instalación

```bash
npm install
```

## Requisitos

- **Node.js** v18+
- **MongoDB** corriendo localmente en `mongodb://127.0.0.1:27017`

### Instalar MongoDB localmente

1. Descargar MongoDB Community Server desde [mongodb.com](https://www.mongodb.com/try/download/community)
2. Instalar y asegurarse de que el servicio `mongod` esté corriendo

## Configuración

Crear un archivo `.env` en la raíz del proyecto (ya incluido):

```env
PORT=8080
MONGO_URL=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=s3cr3tK3yC0d3rH0us3_2026
COOKIE_NAME=coderCookieToken
```

## Ejecución

```bash
npm start
```

El servidor se levanta en `http://localhost:8080`

## Endpoints

### Sessions (`/api/sessions`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/sessions/register` | Registrar usuario | No |
| POST | `/api/sessions/login` | Iniciar sesión (genera JWT en cookie) | No |
| GET | `/api/sessions/current` | Obtener usuario logueado | JWT |
| POST | `/api/sessions/logout` | Cerrar sesión | No |

### Users (`/api/users`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/users` | Listar usuarios | JWT |
| GET | `/api/users/:uid` | Obtener usuario por ID | JWT |
| PUT | `/api/users/:uid` | Actualizar usuario | JWT |
| DELETE | `/api/users/:uid` | Eliminar usuario | JWT |

### Products (`/api/products`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/products` | Listar productos | No |
| GET | `/api/products/:pid` | Obtener producto por ID | No |
| POST | `/api/products` | Crear producto | JWT |
| PUT | `/api/products/:pid` | Actualizar producto | JWT |
| DELETE | `/api/products/:pid` | Eliminar producto | JWT |

### Carts (`/api/carts`)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/carts` | Crear carrito | No |
| GET | `/api/carts/:cid` | Obtener carrito | No |
| POST | `/api/carts/:cid/product/:pid` | Agregar producto al carrito | JWT |
| DELETE | `/api/carts/:cid/product/:pid` | Eliminar producto del carrito | JWT |
| DELETE | `/api/carts/:cid` | Vaciar carrito | JWT |

## Ejemplo de uso

### Registrar usuario

```bash
POST /api/sessions/register
Content-Type: application/json

{
  "first_name": "Lucas",
  "last_name": "Pérez",
  "email": "lucas@mail.com",
  "age": 25,
  "password": "abc123"
}
```

### Login

```bash
POST /api/sessions/login
Content-Type: application/json

{
  "email": "lucas@mail.com",
  "password": "abc123"
}
```

### Obtener usuario actual

```bash
GET /api/sessions/current
# La cookie JWT se envía automáticamente
```

## Estructura del proyecto

```
src/
├── config/
│   ├── config.js               # Variables de entorno
│   └── passport.config.js      # Estrategias de Passport
├── dao/
│   └── models/
│       ├── user.model.js        # Modelo User
│       ├── cart.model.js         # Modelo Cart
│       └── product.model.js     # Modelo Product
├── routes/
│   ├── sessions.router.js       # Auth (register, login, current)
│   ├── users.router.js          # CRUD de usuarios
│   ├── products.router.js       # CRUD de productos
│   └── carts.router.js          # CRUD de carritos
├── middlewares/
│   └── auth.js                  # Middleware de autorización
├── utils/
│   └── utils.js                 # Hasheo, JWT, cookie extractor
└── app.js                       # Entry point
```
