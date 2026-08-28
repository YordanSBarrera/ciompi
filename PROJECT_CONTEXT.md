# Contexto del Proyecto: CIOMPI

Aplicación web para la gestión de cobranzas y financiamiento de vehículos.
Gestion de clientes, empresas, vehículos, financiamientos, cuotas y operaciones.

## Lenguajes

| Lenguaje                 | Uso                                                         |
| ------------------------ | ----------------------------------------------------------- |
| **TypeScript**           | Todo el código de la aplicación (`app/`, `lib/`, `models/`) |
| **JavaScript (Node.js)** | Scripts de migración y utilidades (`scripts/`)              |
| **MongoDB**              | base de datos NoSQL                                         |
| **HTML / CSS**           | Generado por React y Material UI                            |

---

## Framework y Librerías Principales (Frontend)

| Tecnología            | Versión | Descripción                                                                                                    |
| --------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| **Next.js**           | 15.5.3  | Framework React con App Router y API Routes (backend integrado). Se usa `next dev --turbopack` para desarrollo |
| **React**             | 19.1.0  | Librería de UI para componentes interactivos                                                                   |
| **Material UI (MUI)** | 7.3.2   | Sistema de diseño: componentes (`@mui/material`) e iconos (`@mui/icons-material`)                              |
| **Emotion**           | 11.x    | Motor de estilos de MUI (`@emotion/react`, `@emotion/styled`)                                                  |
| **date-fns**          | 4.1.0   | Utilidades de manejo de fechas                                                                                 |
| **Geist (next/font)** | —       | Fuente tipográfica cargada optimizada vía Next.js                                                              |

### Arquitectura Frontend

- **App Router** de Next.js (`app/`), estructurado por módulos de negocio: `clientes`, `empresas`, `vehiculos`, `financiamiento`, `operaciones`, `usuario`, `datosGenerales`.
- **Componentes propios** en `app/components/` (formularios, listas, tablas, modales, menús).
- **Hooks personalizados** en `app/hook/` (`useAuth`, `useVehiculos`, `useEmpresas`, `useEliminar*`).
- **Tema personalizado** de MUI en `lib/ProviderTheme.tsx` y `lib/StilosUI.tsx` con paleta de colores propia (`lib/color.ts`).
- **Enrutado centralizado** en `lib/rutas.ts` y módulos de navegación en `lib/modules.ts`.
- Alias de importación `@/*` configurado en `tsconfig.json`.

---

## Backend / API

| Tecnología             | Descripción                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js API Routes** | Rutas REST en `app/api/**/route.ts` (auth, clientes, empresas, vehículos, financiamiento, pagos-cuotas, operaciones, reports, stats, test, debug) |
| **REST / JSON**        | Las API devuelven respuestas JSON; el cliente (React) consume con `fetch`                                                                         |

Endpoints principales:

- `api/auth/login`, `api/auth/verify`, `api/auth/me`
- `api/clientes`, `api/empresas`, `api/vehiculos`, `api/usuarios`, `api/financiamiento`
- `api/pagos-cuotas`, `api/operaciones/*`
- `api/reports/*` (vencimientos, estado de cuenta, financiamientos/pagos atrasados, clientes, financiaciones)
- `api/stats`, `api/test`, `api/debug`, `api/fix-pagocuotas-index`

---

## Autenticación y Seguridad

| Tecnología       | Descripción |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **jsonwebtoken** | 9.0.2       | Generación y verificación de tokens JWT (expiración 24h, clave `JWT_SECRET`)                                                                            |
| **bcryptjs**     | 3.0.2       | Hashing y comparación de contraseñas (salt de 10 rondas)                                                                                                |
| **next-auth**    | 4.24.11     | Declarado como dependencia y tipos extendidos en `types/next-auth.d.ts`, pero **la autenticación efectiva usa JWT propio** con `localStorage` (cliente) |

Variables de entorno (`.env`):

- `MONGO_URI` — cadena de conexión a MongoDB (por defecto `mongodb://localhost:27017/ciompi`)
- `JWT_SECRET` — clave secreta para firmar tokens JWT

El modelo `Usuario` elimina el campo `password` al serializar (transform `toJSON`) y soporta roles (`Administrativo`, `Usuario`) y estados (activo/inactivo).

---

### Modelos (`models/`)

- `Cliente` — datos del cliente y campos de soft delete
- `Empresa` — empresas asociadas
- `Vehiculo` — inventario de vehículos (Modelo, Marca, Matricula, Padrón, etc.)
- `Financiamiento` — financiamientos con cálculo de cuotas, intereses, saldos, progreso y estado
- `PagoCuota` — pagos de cuotas con métodos de pago
- `Usuario` — usuarios del sistema con autenticación

### Patrones de diseño de datos

- **Soft Delete**: todos los modelos incluyen campos `eliminado`, `fechaEliminacion`, `usuarioEliminacion`
- **Auditoría**: campos `usuarioCreacion`, `usuarioModificacion`, `usuarioRegistro` y timestamps automáticos (`timestamps: true`)
- **Índices**: creados sobre referencias y campos de consulta frecuente (cliente, empresa, vehículo, estado, fechas)
- **Virtuals**: virtuales calculados como `progresoFinanciamiento`, `estaAlDia`
- **Referencias**: relaciones vía `Schema.Types.ObjectId` con `ref`

Conexión: `db/dbConnection.ts` gestiona una conexión única reutilizable (`connectDB()`).

---

## Herramientas de Desarrollo y Calidad

| Herramienta    | Versión | Uso                                                                                     |
| -------------- | ------- | --------------------------------------------------------------------------------------- |
| **TypeScript** | ^5      | Compilación tipada estricta (`strict: true`, target ES2017, moduleResolution "bundler") |
| **pnpm**       | 10.18.3 | Gestor de paquetes (monorepo lockfile `pnpm-lock.yaml`, `pnpm-workspace.yaml`)          |
| **Prettier**   | 3.6.2   | Formateo de código (config en `.prettierrc`)                                            |
| **Node.js**    | —       | Runtime y scripts                                                                       |
| **Turbopack**  | —       | Bundler de desarrollo y build de Next.js                                                |

---

## Resumen del Stack

```
Frontend:  Next.js 15 (App Router + Turbopack) · React 19 · Material UI 7 · Emotion · date-fns
Backend:   Next.js API Routes (REST/JSON)
Datos:     MongoDB · Mongoose 8 · Driver mongodb 7
Auth:      JWT (jsonwebtoken) · bcryptjs
Tooling:   TypeScript 5 · pnpm 10 · Prettier 3
Deploy:    pm2 / scripts Windows (bat) + start.js
```

## Reglas de Arquitectura

- NUNCA usar `any` en TypeScript. Tipar todo.

---
