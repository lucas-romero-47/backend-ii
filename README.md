# Ecommerce Backend - Entrega Final

Backend completo de un ecommerce con patrón Repository, DAOs, DTOs, Mailing y un sistema de Autorización basado en roles (Admin/User).

## Características principales

- **Patrón Repository y DAOs**: Capas abstraídas para separar la lógica de negocio de la lógica de persistencia.
- **DTOs**: Transferencia segura de datos de usuario (se evita enviar información sensible como la contraseña).
- **Mailing**: Envío de correos electrónicos mediante la API HTTP de **Resend** (sin SDKs externos) para tickets de compra y recuperación de contraseña.
- **Sistema de Compra**: Modelo `Ticket` que valida stock en tiempo real, descuenta productos, maneja compras parciales y envía confirmación por email.
- **Recuperación de Contraseña**: Generación de JWT temporal (1h) para el restablecimiento seguro de la contraseña.
- **Autorización por Roles**: Middleware que verifica permisos (ej. solo el admin crea productos, solo el user agrega al carrito).

## Tecnologías

- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **Passport** (Local + JWT)
- **bcrypt** (hasheo de contraseñas)
- **Resend** (envío de emails transaccionales)

## Instalación

```bash
npm install
```

## Requisitos

- **Node.js** v18+
- **MongoDB** corriendo localmente en `mongodb://127.0.0.1:27017`

## Configuración (.env)

Renombrar el archivo `.env.example` a `.env` y configurar las variables:

```env
PORT=8080
MONGO_URL=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=s3cr3tK3yC0d3rH0us3_2026
COOKIE_NAME=coderCookieToken
RESEND_API_KEY=tu_api_key_de_resend
MAIL_FROM=onboarding@resend.dev
BASE_URL=http://localhost:8080
```

## Ejecución

```bash
npm start
```

El servidor se levanta en `http://localhost:8080`

## Endpoints Principales

### Auth & Sessions (`/api/sessions`)
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/register` | Registrar usuario | No |
| POST | `/login` | Iniciar sesión (genera JWT) | No |
| GET | `/current` | Obtener DTO del usuario logueado | JWT |
| POST | `/forgot-password` | Envía email con enlace de recuperación | No |
| POST | `/reset-password` | Restablece contraseña (requiere token JWT) | No |
| POST | `/logout` | Cerrar sesión | No |

### Productos (`/api/products`)
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/` | Listar productos (con paginación/filtros) | No |
| POST | `/` | Crear producto | Admin |
| PUT | `/:pid` | Actualizar producto | Admin |
| DELETE | `/:pid` | Eliminar producto | Admin |

### Carritos & Compras (`/api/carts`)
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/` | Crear carrito vacío | No |
| POST | `/:cid/product/:pid` | Agregar producto al carrito | User |
| POST | `/:cid/purchase` | Finalizar compra, generar ticket y enviar email | User |

## Estructura de la Arquitectura

```
src/
├── config/              # Variables de entorno y config de Passport
├── dao/                 # Data Access Objects para interacción con MongoDB
│   └── models/          # Modelos de Mongoose (User, Product, Cart, Ticket)
├── dto/                 # Data Transfer Objects (UserDTO)
├── middlewares/         # Middleware centralizado de auth y autorización (passportCall)
├── repositories/        # Lógica de negocio (Product, User, Cart, Ticket)
├── routes/              # Controladores de rutas
├── services/            # Servicios externos (MailService)
└── utils/               # Utilidades de encriptación y JWT
```
