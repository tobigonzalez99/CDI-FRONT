> **Copia de respaldo.** El original vive en la raíz del workspace (`../CLAUDE.md`,
> fuera de todo repositorio) y es la fuente de verdad. Este archivo está espejado en
> los dos repositorios para que el contexto compartido quede respaldado en GitHub.
> Al editar el original, volver a copiarlo en ambos lados.

# Club Deportivo Independencia (CDI) — Workspace

Workspace local con **dos proyectos independientes** (serán dos repositorios Git/GitHub separados).
Esta carpeta raíz NO es un repositorio: solo agrupa ambos proyectos y el contexto compartido.

```
CDI/
├── CLAUDE.md                                   ← este archivo (contexto compartido)
├── CDI.code-workspace                          ← workspace multi-root de VS Code
├── Historias_de_Usuario_Club_de_Futbol.pdf     ← requerimientos funcionales (HU-01 a HU-09)
├── cdi-backend/    NestJS 12 + TypeORM 1 + PostgreSQL  (puerto 4000)
└── cdi-frontend/   Next.js 16 + React 19 + shadcn/ui   (puerto 3000)
```

## Reglas de trabajo

- **Git/GitHub:** cada proyecto es su propio repositorio, ya vinculado y en rama `main`:
  `cdi-frontend` → [CDI-FRONT](https://github.com/tobigonzalez99/CDI-FRONT) ·
  `cdi-backend` → [CDI-BACK](https://github.com/tobigonzalez99/CDI-BACK).
  Registrar el avance a medida que se completa: un commit por cambio terminado,
  mensaje en español con prefijo convencional (`feat:`, `fix:`, `docs:`…), y recién
  después de que pasen lint, chequeo de tipos y build. Nunca commitear secretos
  (`.env.local` está ignorado, `.env.example` sí se versiona) ni hacer `git init` en
  esta carpeta raíz, que no es un repositorio.
- El código vive solo en local (fuera de OneDrive), con GitHub como respaldo. No
  sincronizar con otros servicios en la nube.
- Antes de cambiar un endpoint o un DTO en el backend, revisar el tipo equivalente en `cdi-frontend/src/types/` (y viceversa). Si el contrato cambia, actualizar ambos lados en la misma tarea.
- Idioma del dominio: español (socio, cuota, vigencia). Código de infraestructura: inglés.

## Contrato API (fuente de verdad: `cdi-frontend/src/types/*.ts`)

| Tema | Acuerdo |
|---|---|
| Base URL | `http://localhost:4000/api/v1` (`NEXT_PUBLIC_API_URL` en el frontend) |
| Swagger | `http://localhost:4000/api/docs` (solo fuera de producción) |
| Auth | `POST /auth/login` con `{ dni, password }`. El JWT viaja en **cookie httpOnly** (`cdi_access_token`); la respuesta es `{ user: AuthUser, expiresAt }`. CORS con `credentials: true` → el frontend usa `withCredentials`. |
| Primer ingreso | `AuthUser.mustChangePassword === true` → frontend redirige a `/cambiar-password`; backend bloquea el resto de endpoints (código `PASSWORD_CHANGE_REQUIRED`). |
| Cambio de clave | Forzado (HU-03): `{ newPassword, confirmPassword }`. Voluntario (HU-05): agrega `currentPassword`. Política: 8–72 caracteres, al menos una letra y un número. |
| Roles | `ADMIN` \| `SOCIO` |
| Socio | `nombre` y `apellido` separados; `dni` string (7–8 dígitos); fechas `YYYY-MM-DD`; `vigencia: { desde, hasta }` inclusive. |
| Estado socio | `ALTA` \| `BAJA` (administrativo, persistido). Además soft delete (`deletedAt`). |
| Estado cuota | `AL_DIA` \| `PENDIENTE` — **calculado** por el backend comparando la vigencia con la fecha actual en `America/Argentina/Buenos_Aires`. No se persiste. |
| Tipos de socio | Entidad configurable (`TipoSocio`), no enum. El alta de socio recibe `tipoSocioId`. |
| Alta de socio | `multipart/form-data` (campo archivo `foto`, vigencia como `vigencia[desde]`/`vigencia[hasta]`). Respuesta `{ socio, passwordInicial }` (la clave se muestra una única vez). |
| Paginación | Query `page`, `pageSize` (máx. 100). Respuesta `{ data, total, page, pageSize, totalPages }`. |
| Errores | `{ status, code, message, fieldErrors? }` — `fieldErrors: Record<campo, string[]>` (claves con notación de puntos: `vigencia.hasta`) para mapear a React Hook Form. **Todas** las respuestas de error usan esta forma. |

### Endpoints de autenticación (implementados)

| Método | Ruta | Acceso | Devuelve |
|---|---|---|---|
| POST | `/auth/login` | público | `{ user, expiresAt }` + cookie `cdi_access_token` |
| POST | `/auth/logout` | autenticado | `204`, borra la cookie |
| GET | `/auth/me` | autenticado (vale con clave pendiente) | `{ user, expiresAt }` |
| POST | `/auth/change-initial-password` | autenticado (vale con clave pendiente) | HU-03: `{ newPassword, confirmPassword }` → sesión nueva |
| POST | `/auth/change-password` | autenticado | HU-05: agrega `currentPassword` → sesión nueva |

El frontend debe usar `withCredentials: true` en todas las llamadas. Tras cambiar la contraseña
se emite un token nuevo, así que conviene refrescar la sesión con la respuesta recibida.

### Endpoints de socios y tipos de socio (implementados)

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| POST | `/socios` | ADMIN | HU-08. JSON o `multipart/form-data`. Devuelve `{ socio, passwordInicial }` |
| GET | `/socios` | ADMIN | Paginado: `page`, `pageSize`, `search`, `estado`, `estadoCuota`, `tipoSocioId`, `sortBy`, `sortOrder` |
| GET | `/socios/:id` | ADMIN | |
| PATCH | `/socios/:id` | ADMIN | HU-08/HU-09. Todo opcional; una foto nueva reemplaza la anterior |
| PATCH | `/socios/:id/baja` · `/alta` | ADMIN | Cambia `estado`; reversible |
| DELETE | `/socios/:id` | ADMIN | Baja lógica (`deletedAt`), `204` |
| GET | `/perfil/me` | SOCIO | HU-04. Ficha propia + `estadoCuota` |
| GET · POST | `/tipos-socio` | ADMIN | HU-09. `?soloActivos=true` para el selector del alta |
| GET · PATCH | `/tipos-socio/:id` | ADMIN | Desactivar saca el tipo de las altas nuevas sin tocar a sus socios |

**Subida de la foto:** campo `foto` (jpg, png o webp; máx. 5 MB por defecto).
En `multipart/form-data` la vigencia va **serializada como JSON** en un solo campo —
`vigencia={"desde":"2026-09-16","hasta":"2026-10-16"}` — porque multer no reconstruye
objetos anidados. En `application/json` va como objeto normal.

`fotoUrl` llega siempre como URL absoluta (`PUBLIC_URL` + `/uploads/...`);
en la base se guarda solo la ruta relativa.

> `passwordInicial` se devuelve **una única vez**, al crear el socio. No hay forma de
> volver a consultarla: el admin tiene que copiarla y entregarla en ese momento.

### Códigos de error

`VALIDATION_ERROR`, `BAD_REQUEST`, `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`, `PASSWORD_CHANGE_REQUIRED`,
`WEAK_PASSWORD`, `SESSION_EXPIRED`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`,
`PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, `INTERNAL_ERROR`.

Qué debe hacer el frontend: `SESSION_EXPIRED`/`UNAUTHORIZED` → mandar a `/login`;
`PASSWORD_CHANGE_REQUIRED` → mandar a `/cambiar-password`; `VALIDATION_ERROR` → pintar `fieldErrors` en el formulario.

> Las respuestas exitosas **no** van envueltas (nada de `{ data: ... }`): el cuerpo es
> directamente el recurso, tal como lo declaran los tipos del frontend.

## Datos iniciales (`npm run seed` en cdi-backend)

**Cuenta de administración:** "Club Deportivo Independencia" — usuario con rol `ADMIN`
y **sin ficha de socio** (administra el sistema, no paga cuota). Accede a todo:
crear, editar y dar de baja socios, y configurar tipos de socio.
Credenciales de desarrollo en `.env` (`SEED_ADMIN_*`): DNI `20000001`, clave `CdiAdmin2026`.

**Categorías de socio iniciales:**

| Categoría | Descripción | Cuota |
|---|---|---|
| Socio Activo | Socio activo, con beneficios exclusivos. | $20.000 |
| Socio Protector | Mitad de precio y algunos beneficios. | $10.000 |

> ⚠️ **Provisional:** los montos y los datos del administrador son placeholders para
> desarrollo y testing, pendientes de confirmar con el club. Para sumar categorías,
> agregarlas a `src/database/seeds/seed-data.ts`: la semilla es idempotente y solo
> crea las que falten, sin pisar lo que se haya editado desde el panel.

## Modelo de datos (backend)

- `usuarios`: identidad + credenciales (`dni` único, `nombre`, `apellido`, `password_hash`, `rol`, `must_change_password`, `last_login_at`).
- `socios`: ficha de membresía 1:1 con `usuarios` (`numero_socio` serial, domicilio, localidad, email, teléfono, fecha de nacimiento, `foto_url`, `tipo_socio_id`, `estado`, `vigencia_desde`, `vigencia_hasta`, `deleted_at`). DNI/nombre/apellido se leen del usuario (una sola fuente de verdad).
- `tipos_socio`: `nombre` único, `descripcion`, `monto_cuota`, `activo`.

## Comandos rápidos

Backend (`cdi-backend/`): `npm run start:dev`, `npm test`, `npm run lint`, `npm run migration:generate -- src/database/migrations/<Nombre>`, `npm run migration:run`.
Frontend (`cdi-frontend/`): `npm run dev`, `npm run lint`, `npm run build`.
