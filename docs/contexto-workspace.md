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
| Cambio de clave | Forzado (HU-03): `{ newPassword, confirmPassword }`. Voluntario (HU-05): agrega `currentPassword`. Política: 8–72 caracteres, al menos una letra y un número. **Máximo 2 cambios voluntarios cada 30 días** (`PASSWORD_CHANGE_LIMIT`, 429); el forzado no cuenta. |
| Roles | `ADMIN` \| `SOCIO` \| `TIENDA` (opera solo la tienda: no ve socios ni cuotas) |
| Socio | `nombre` y `apellido` separados y **siempre en MAYÚSCULA** (el backend los normaliza al guardar, se escriban como se escriban; pedido del cliente, 2026-11-03); `dni` string (7–8 dígitos); fechas `YYYY-MM-DD`; `vigencia: { desde, hasta }` inclusive. |
| Estado socio | `ALTA` \| `BAJA` (administrativo, persistido). Además soft delete (`deletedAt`). |
| Carnet QR | `socios.codigoQr` (aleatorio, único, nulo hasta generarlo) y `carnetUrl` (`SITIO_URL/carnet/<codigo>`), que arma el backend. El escaneo es público |
| Estado cuota | `AL_DIA` \| `PENDIENTE` — **calculado** por el backend comparando la vigencia con la fecha actual en `America/Argentina/Buenos_Aires`. No se persiste. Una **categoría sin cuota** (`montoCuota: null`, como Juvenil y Campeón) está **siempre `AL_DIA`**: su vigencia no se mira. |
| Tipos de socio | Entidad configurable (`TipoSocio`), no enum. El alta de socio recibe `tipoSocioId`. |
| Alta de socio | JSON o `multipart/form-data` (archivo `foto` opcional; `vigencia` y `pago`, si van, serializados como JSON). Lleva `vigencia` **o** `pago`, nunca los dos. Respuesta `{ socio, passwordInicial, correoBienvenidaEnviado }` (la clave se muestra una única vez). |
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
| POST | `/auth/forgot-password` | **público** | `{ email }` → `204` **siempre**. Si es de un socio activo, le llega el enlace. Máx. 3 por minuto y por IP |
| POST | `/auth/password-link/validate` | **público** | `{ token }` → `{ tipo: 'BIENVENIDA' \| 'RECUPERACION', nombre }`, o `400 INVALID_TOKEN` |
| POST | `/auth/reset-password` | **público** | `{ token, newPassword, confirmPassword }` → `{ user, expiresAt }` + cookie: **deja la sesión iniciada** |

El frontend debe usar `withCredentials: true` en todas las llamadas. Tras cambiar la contraseña
se emite un token nuevo, así que conviene refrescar la sesión con la respuesta recibida.

### Elegir la contraseña por correo: bienvenida y recuperación (implementado)

Los dos correos llevan el mismo tipo de enlace: `SITIO_URL/elegir-password?token=<token>`.
La página lee el `token`, lo valida con `password-link/validate` (para saludar con el nombre
y saber qué texto mostrar) y manda la clave elegida a `reset-password`.

| Correo | Cuándo sale | Vigencia del enlace |
|---|---|---|
| **Bienvenida** | Al crear un socio: alta manual del panel, aprobación de una solicitud y, más adelante, el alta automática por pago. Lleva su DNI (el usuario de ingreso) | 7 días |
| **Recuperación** | Desde "¿Olvidaste tu contraseña?" (`forgot-password`) | 1 hora |

- **El correo nunca lleva la contraseña**, solo el enlace: un correo queda guardado para
  siempre, y una clave escrita ahí es una clave expuesta. La `passwordInicial` sigue
  volviendo en la respuesta del alta, para quien no tenga acceso a su correo.
- **`correoBienvenidaEnviado`** en la respuesta del alta (`POST /socios` y
  `/solicitudes/:id/aprobar`) dice si el correo salió. Si es `false`, el admin tiene que
  entregar la clave inicial. Que falle el correo **no** deshace el alta.
- **Un solo uso.** Usarlo lo borra, pedir uno nuevo anula los anteriores, y **cualquier
  cambio de contraseña anula los pendientes**. Por ejemplo, el de bienvenida de alguien
  que ya entró con la clave inicial.
- **En la base se guarda solo el hash** del token (SHA-256): quien lea la tabla no puede
  armar un enlace que funcione. El token tiene 256 bits.
- **`forgot-password` no delata nada.** Responde `204` exista o no el correo, y no espera el
  envío, así que tampoco tarda distinto. Si se pide de nuevo antes de 2 minutos para la
  misma cuenta, no reenvía.
- **No cuenta como cambio voluntario.** Perder la clave, o recibir la primera, no es
  decidir cambiarla: no consume los 2 cambios por mes.
- Un socio dado de baja después de recibir el enlace no puede usarlo (`403 ACCOUNT_DISABLED`).
- **El admin no tiene correo**, así que no puede recuperar su clave por este camino.

> El `token` viaja en la URL. Para que no se filtre a otros sitios, la página
> `/elegir-password` tiene que sacarlo de la barra de direcciones apenas lo lee
> (`history.replaceState`) y usar `Referrer-Policy: no-referrer`.

### Endpoints de socios y tipos de socio (implementados)

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| POST | `/socios` | ADMIN | HU-08. JSON o `multipart/form-data`. Con `vigencia` (ya venía pagando) **o** con `pago` (paga ahora en el club). Devuelve `{ socio, passwordInicial }` |
| GET | `/socios` | ADMIN | Paginado: `page`, `pageSize`, `search`, `estado`, `estadoCuota`, `tipoSocioId`, `sortBy`, `sortOrder` |
| GET | `/socios/:id` | ADMIN | |
| PATCH | `/socios/:id` | ADMIN | HU-08/HU-09. Todo opcional y vale mandar un solo campo; `vigencia` acepta un solo extremo (el otro se conserva). Una foto nueva reemplaza la anterior |
| PATCH | `/socios/:id/baja` · `/alta` | ADMIN | Cambia `estado`; reversible |
| DELETE | `/socios/:id` | ADMIN | Baja lógica (`deletedAt`), `204` |
| POST | `/socios/generar-qr` | ADMIN | Genera el código del carnet de los socios activos que **todavía no lo tengan**. Saltea a los que ya tienen |
| POST | `/socios/:id/resetear-password` | ADMIN | Genera una clave nueva y devuelve `{ socio, passwordInicial }` **una única vez**. Deja al socio obligado a cambiarla; no le consume sus 2 cambios por mes |
| GET | `/perfil/me` | SOCIO | HU-04. Ficha propia + `estadoCuota` |
| PATCH | `/perfil/me` | SOCIO | Edita **solo** teléfono, domicilio, localidad y foto |
| GET · POST | `/tipos-socio` | ADMIN | HU-09. `?soloActivos=true` para el selector del alta |
| GET · PATCH | `/tipos-socio/:id` | ADMIN | Desactivar saca el tipo de las altas nuevas sin tocar a sus socios |

**Alta manual: dos casos.** Lleva una de las dos cosas, nunca ambas:

- **`vigencia`**: para cargar a alguien que ya venía pagando, como los socios actuales
  del club. No registra ningún cobro.
- **`pago`**: `{ cuentaId, medioPago, meses?, comprobante?, observaciones? }`, para quien
  paga en el club al darse de alta. El socio y el cobro se crean **en la misma
  transacción**. La vigencia arranca hoy y dura los meses pagados (1 por defecto, hasta
  24). El **monto lo calcula el backend**: la cuota de la categoría por los meses. El
  `medioPago` es uno de los manuales; `MERCADO_PAGO` se rechaza.

Se hace en una sola operación porque por separado sale mal de las dos formas. Si se da
el alta con un mes de vigencia y después se registra el cobro, el período del cobro
arranca al día siguiente del vencimiento y el socio queda con un mes de más. Si se da
el alta sin registrar el cobro, la plata no figura en Cobranzas.

Sin ninguna de las dos responde `fieldErrors.vigencia`; con las dos, también. **Salvo en
una categoría sin cuota** (Juvenil, Campeón): ahí no se manda ni `vigencia` ni `pago`.
El socio está siempre al día, y el backend guarda como vigencia la fecha de hoy solo
porque la columna la exige. Una categoría sin cuota no se puede cobrar
(`fieldErrors["pago.meses"]`). La **foto es
opcional**: si no la trae, el socio la sube después desde su perfil.

**Editar un socio:** si no cambia la foto, mandar `application/json` — es mucho más
simple que armar un multipart. Todos los campos son opcionales y se puede enviar uno
solo (`{ "localidad": "Villa María" }`). En `vigencia` alcanza con el extremo que se
quiere mover: `{ "vigencia": { "hasta": "2026-12-01" } }` conserva el `desde` guardado
y es el caso habitual cuando hay que corregir un vencimiento. El rango resultante se
valida contra lo que ya está en la ficha, así que un `hasta` anterior al `desde`
vuelve como `fieldErrors["vigencia.hasta"]`.

**Reseteo de contraseña.** La clave nueva se devuelve una vez y no queda consultable,
igual que en el alta. El socio queda con `mustChangePassword: true`, así que elige una
propia en su próximo ingreso (HU-03), y el reseteo se asienta como cambio **no
voluntario**: perder la clave no es lo mismo que decidir cambiarla, así que no le consume
ninguno de los dos cambios que puede hacer cada 30 días.

> ⚠️ **Implementado y verificado, pero a propósito NO conectado al panel.** Decisión del
> 2026-10-29: el camino para el socio que olvida su clave es la **recuperación por correo**
> (`/auth/forgot-password`, implementada). Este endpoint queda como la salida para quien
> no tenga acceso a su correo. **No sumarlo a la interfaz del panel sin que lo pida el
> cliente.**

**Cambiar el DNI cambia el usuario de ingreso:** es el dato con el que el socio entra
al sitio. Tras un cambio, el DNI viejo deja de servir para iniciar sesión.

**La foto del carnet la cambia solo el socio**, desde `PATCH /perfil/me`. Decisión del
cliente del 2026-10-29: aunque `PATCH /socios/:id` la acepta en multipart y funciona, el
panel del administrador **no** la expone. No agregarla sin que la pida.

**Subida de la foto:** campo `foto` (jpg, png o webp; máx. 5 MB por defecto).
En `multipart/form-data` la vigencia va **serializada como JSON** en un solo campo —
`vigencia={"desde":"2026-09-16","hasta":"2026-10-16"}` — porque multer no reconstruye
objetos anidados. En `application/json` va como objeto normal.

`fotoUrl` llega siempre como URL absoluta (`PUBLIC_URL` + `/uploads/...`);
en la base se guarda solo la ruta relativa.

> `passwordInicial` se devuelve **una única vez**, al crear el socio. No hay forma de
> volver a consultarla. Si `correoBienvenidaEnviado` es `true`, el socio elige la suya con
> el enlace del correo. Si es `false`, el admin tiene que copiarla y entregarla en ese
> momento.

### Carnet digital y QR (backend implementado)

Cada socio tiene un carnet con un QR que, escaneado con la cámara de cualquier
celular, abre una página del sitio y dice si le corresponde el descuento en la
entrada. El carnet se descarga como imagen desde el panel para mandarlo por WhatsApp.

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| POST | `/socios/generar-qr` | ADMIN | Asigna el código a los socios activos que no lo tengan. Devuelve `{ generados, yaTenian, total }` |
| GET | `/carnet/:codigo` | **público** | Lo que se consulta al escanear. `404` si el código no existe. Límite: 60 por minuto y por IP |

**Lo que lleva el QR es un enlace, no datos.** Si el QR guardara "este socio está al
día", quedaría congelado el día que se genera. Lo que lleva es
`SITIO_URL/carnet/<codigoQr>`: quien escanea abre esa página y el estado se resuelve
en ese momento, así que un pago de hace cinco minutos ya se ve. El enlace exacto lo
arma el backend y viaja en `carnetUrl`; el frontend solo lo dibuja, para que los dos
lados no puedan discrepar en el formato.

**El código es aleatorio de 128 bits y no se deriva del DNI ni del número de socio.**
Si fuera derivado, cualquiera podría fabricarse el carnet de un socio al día. Es único
(`socios.codigo_qr`) y **nulo hasta que se genera**.

**El botón alcanza a todos los socios de alta, de cualquier categoría** (Juvenil y
Campeón incluidos).

**Una vez generado no cambia, y el botón saltea a los que ya tienen.** No es una
optimización: el carnet ya está repartido por WhatsApp y guardado en el teléfono del
socio. Regenerarlo lo dejaría sin servir sin que nadie se entere hasta la puerta de la
cancha. Por eso el botón se aprieta de nuevo después de cada alta y solo alcanza a los
nuevos. **No agregar un "regenerar código"** sin que el cliente lo pida.

**Qué devuelve el escaneo** (`CarnetResponse`): `numeroSocio`, `nombre`, `apellido`,
`tipoSocio` (el nombre de la categoría), `fotoUrl`, `alDia` y `situacion`.
Deliberadamente **sin** DNI, correo, domicilio, teléfono, importes ni fechas de
vigencia: la página la ve cualquiera que escanee, y nada de eso hace falta en la puerta.

`situacion` toma `AL_DIA`, `CUOTA_VENCIDA` o `DADO_DE_BAJA`. `alDia` es lo único que
decide el descuento; `situacion` existe porque en la puerta los dos motivos para cobrar
precio normal no son lo mismo (una cuota vencida se paga ahí, una baja se resuelve con
la administración).

> ⚠️ **El carnet mira `estado` además de la vigencia, y eso no es opcional.**
> `calcularEstadoCuota` solo compara fechas: un socio dado de baja con la cuota paga
> hasta diciembre da `AL_DIA`. En el panel no molesta —el estado se muestra al lado—,
> pero en el control de acceso sería darle el descuento a alguien que ya no es socio.
> Por eso el carnet usa `calcularSituacionCarnet`, que mira las dos cosas. Un socio
> eliminado (baja lógica) directamente responde `404`.

**El control real contra un carnet prestado es la foto, no el secreto del código.**
Como el código es fijo, una captura de pantalla sirve siempre. Lo que distingue al
titular es la cara en la pantalla de quien cobra: por eso `fotoUrl` no es decorativa.
Es el mismo criterio de cualquier carnet físico.

**La foto se puede volcar en un canvas.** El carnet se descarga como imagen, y para
eso el navegador tiene que dejar dibujar la foto del socio adentro. `/uploads/` se
monta **después** de `enableCors` justamente por eso: así las fotos salen con
`Access-Control-Allow-Origin` y no "contaminan" el canvas. El frontend tiene que
cargarlas con `crossOrigin="anonymous"`, y el origen desde el que se abre el panel
tiene que estar en `CORS_ORIGINS` (si se prueba por la IP de red, agregarla ahí).

> `SITIO_URL` (variable de entorno nueva) es la base del enlace y apunta al **sitio**,
> no a la API. Con el valor por defecto (`http://localhost:3000`) el QR **no se puede
> escanear desde un celular**: para probarlo hay que poner la IP de red de la máquina
> (ej. `http://192.168.0.10:3000`) y en producción el dominio del club.

### Solicitudes de alta — "Hacete socio" con pago (implementado)

Una persona se postula desde el sitio público **y paga el primer mes con Mercado Pago**.
Cuando Mercado Pago aprueba el pago, **el socio se crea solo** y le llega el correo de
bienvenida. No hace falta que intervenga el admin. La tabla guarda **solo solicitudes
pendientes**: el alta (automática o a mano) crea el socio y borra la solicitud; un pago
rechazado o vencido, o un rechazo del admin, borra los datos y la foto.

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| GET | `/tipos-socio/disponibles` | **público** | Categorías activas **que pagan cuota**, con su `montoCuota`, para el selector del formulario. Las sin cuota (Juvenil, Campeón) no aparecen: las asigna el club desde el panel |
| POST | `/solicitudes` | **público** | `multipart/form-data` → **`201 { id, initPoint }`**: el front hace `window.location = initPoint`. Máx. 3 envíos por minuto y por IP |
| GET | `/solicitudes` | ADMIN | Paginado, más antiguas primero. Cada una trae `estado`, `venceEn` y `motivoRevision` |
| GET | `/solicitudes/pendientes/total` | ADMIN | `{ pendientes: n }`: solo las que esperan algo del admin (en revisión, o anteriores al pago online). Las que se están pagando no cuentan |
| GET | `/solicitudes/:id` | ADMIN | |
| POST | `/solicitudes/:id/aprobar` | ADMIN | "Dar de alta" **a mano** (pagó en el club, o una en revisión). Corta su cobro online y devuelve `{ socio, passwordInicial, correoBienvenidaEnviado }`. Cuerpo opcional: `tipoSocioId`, `vigencia` |
| DELETE | `/solicitudes/:id` | ADMIN | "Rechazar solicitud". Corta su cobro online y borra datos y foto, `204` |

**Campos del formulario — todos obligatorios menos `comentario`:** `nombre`, `apellido`,
`dni`, `email`, `domicilio`, `localidad`, `telefono`, `fechaNacimiento`, `tipoSocioId`
y `foto` (archivo). El importe es la cuota de la categoría elegida (1 mes) y lo fija el
backend al crear el cobro. Aprobar a mano sin cuerpo usa la categoría solicitada y una
vigencia de un mes desde hoy.

**`estado` de una solicitud:**

| Estado | Qué significa |
|---|---|
| `PENDIENTE_PAGO` con `venceEn` | La persona está pagando. Si no paga, a los 30 minutos vence con su cobro y se borra |
| `PENDIENTE_PAGO` sin `venceEn` | Anterior al pago online: no vence, la resuelve el admin a mano |
| `REQUIERE_REVISION` | **Se pagó, pero el alta no se pudo hacer sola** (el DNI o el correo se ocuparon entre medio). La resuelve el admin; `motivoRevision` dice por qué |

**Cómo se da el alta.** Al aprobarse el pago, en **una sola transacción**: se crean el
usuario y la ficha (con la foto y la categoría de la solicitud, aunque esa categoría se
haya desactivado después), se registra el pago (cuenta Mercado Pago, comprobante
`MP-<id>`), la vigencia arranca hoy por un mes, y se borra la solicitud. Después del
commit sale el correo de bienvenida con el enlace para elegir la contraseña. La página
de vuelta recibe `APROBADO` recién cuando el socio ya existe.

- **Reemplazo.** Si alguien abandonó el pago y vuelve a enviar el formulario con el
  mismo DNI **y** el mismo correo, su solicitud sin pagar se reemplaza: el cobro viejo
  deja de poder pagarse y se borran los datos y la foto viejos. Si coincide uno solo de
  los dos, es un `409`, como siempre: nadie pisa la solicitud de otro sabiendo solo su
  DNI.
- **Rechazo = no queda ningún dato** (decisión del cliente). Un pago rechazado borra la
  solicitud y la foto en el momento y corta la validez del cobro, así no se puede
  pagar después. A diferencia de la cuota, no se puede reintentar con otra tarjeta en el
  mismo checkout: hay que completar el formulario de nuevo.
- **Rechazar o "Dar de alta" a mano corta primero el cobro online**, para que no se
  pueda pagar algo que ya se resolvió.
- **`EN_REVISION` en la página de vuelta** queda para lo extraordinario: un pago que entra
  en el mismo instante en que la solicitud se rechaza o se da de alta a mano, un importe
  que no coincide, o una identidad que se ocupó entre medio. La plata nunca se pierde:
  el cobro queda registrado con su `mp_payment_id` para que lo resuelva el admin.
- Si Mercado Pago no está configurado, `POST /solicitudes` responde
  `503 PAYMENT_GATEWAY_ERROR` **sin guardar nada**. Lo mismo si la categoría no tiene
  cuota (`fieldErrors.tipoSocioId`).

### Datos únicos por persona

| Único | Por qué |
|---|---|
| `id` (UUID) | Identificador interno |
| `dni` | Identifica legalmente a la persona; además es el usuario de ingreso |
| `email` | Canal de contacto y futura recuperación de contraseña: con dos iguales no se sabría a quién corresponde cada aviso |
| `numeroSocio` | Número de carnet |

**Pueden repetirse:** nombre, apellido, domicilio, localidad, fecha de nacimiento y
**teléfono** — una familia comparte el fijo, y un padre puede dejar su celular en la
ficha de sus hijos menores; exigirlo único bloquearía altas legítimas.

El DNI y el email se validan contra los socios registrados **y** contra las demás
solicitudes pendientes, y el conflicto llega en `fieldErrors` indicando cuál de los dos
casos es. **Y al revés:** el alta manual (`POST /socios`) y la edición del DNI o del
correo de un socio chocan con las solicitudes pendientes (`409`, "esta persona ya se
postuló desde el sitio"). Sin eso, esa solicitud ya no se podría aprobar y, con el
pago online, alguien que pagó se quedaría sin cuenta. Un socio dado de baja lógicamente **sigue ocupando** su DNI y su correo
(igual que el índice único de la base): para reincorporarlo hay que restaurar su ficha,
no crear otra.

### Solicitudes de baja — el socio se da de baja (implementado)

El socio pide la baja desde su propia sección del sitio y la **resuelve el
administrador**, con el mismo circuito que el alta. Igual que en las altas, la
tabla guarda **solo pedidos pendientes**: aprobar o rechazar lo borra.

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| POST | `/solicitudes-baja` | SOCIO | Pide su baja. Cuerpo opcional: `motivo` (máx. 500). No da de baja nada todavía |
| GET | `/solicitudes-baja/mia` | SOCIO | `{ pendiente, solicitadaEn, motivo }` — qué mostrar en su sección |
| DELETE | `/solicitudes-baja/mia` | SOCIO | Da marcha atrás mientras siga pendiente, `204` |
| GET | `/solicitudes-baja` | ADMIN | Paginado, más antiguos primero. Cada pedido trae la ficha completa del socio |
| GET | `/solicitudes-baja/pendientes/total` | ADMIN | `{ pendientes: n }` para el indicador del panel |
| GET | `/solicitudes-baja/:id` | ADMIN | |
| POST | `/solicitudes-baja/:id/aprobar` | ADMIN | "Dar de baja". Pasa el socio a `BAJA` y borra el pedido. Devuelve el `Socio` |
| DELETE | `/solicitudes-baja/:id` | ADMIN | "Rechazar la baja". Borra el pedido; el socio sigue `ALTA`, `204` |

**La baja no borra nada.** Es solo `socios.estado` pasando a `BAJA`: ficha, pagos e
historial quedan intactos. Se revierte desde el panel con `PATCH /socios/:id/alta`, y
los dados de baja se listan con `GET /socios?estado=BAJA`. No confundirla con el borrado
lógico (`DELETE /socios/:id`, que setea `deletedAt`): son dos cosas distintas.

> ⚠️ **Un socio en `BAJA` no puede iniciar sesión**: `puedeOperar()` exige `estado === ALTA`,
> así que el login responde `403 ACCOUNT_DISABLED`. Por eso la pantalla de "pedir la baja"
> solo la ve un socio activo, y para volver tiene que pedirle al club que lo reactive.

Un socio no puede tener dos pedidos pendientes (índice único por `socio_id`): el segundo
envío responde `409 CONFLICT`, lo que cubre el doble click. Si el socio tiene baja lógica,
su pedido desaparece del listado del admin.

### Cobranza de cuotas (implementado)

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| POST | `/pagos` | ADMIN | Registra el cobro **y extiende la vigencia** en una transacción |
| GET | `/pagos` | ADMIN | Filtros: `socioId`, `cuentaId`, `medioPago`, `desde`, `hasta`, `anulacion`, `devolucion` (`pendientes` | `todas`) |
| GET | `/pagos/devoluciones/pendientes/total` | ADMIN | `{ pendientes: n }`: devoluciones y contracargos sin revisar, para el indicador del panel |
| PATCH | `/pagos/:id/revisar-devolucion` | ADMIN | La marca como vista: sale del indicador. Devuelve el `Pago`. `409` si el pago no tiene devolución |
| GET | `/pagos/resumen` | ADMIN | Ingresos por mes, acumulado y desglose por medio y por cuenta |
| GET | `/pagos/:id` | ADMIN | |
| PATCH | `/pagos/:id/anular` | ADMIN | Motivo obligatorio. Devuelve `requiereRevisarVigencia` |
| GET | `/pagos/socio/:socioId` | ADMIN | Historial de un socio + `totalCobrado` y `pagosVigentes` |
| GET | `/pagos/mios` | SOCIO | Su historial de pagos. **Acepta los mismos filtros que `/pagos`**, incluido `anulacion` |
| GET | `/cuentas` | ADMIN | Las dos cuentas del club, con `usoSistema`. **No hay alta**: son fijas y las crea la semilla |
| GET · PATCH | `/cuentas/:id` | ADMIN | Solo `nombre` e `identificador` (CBU o alias). El tipo y la activación no se tocan: de ellos depende qué medio va a cada cuenta |

**Período que cubre un pago.** Si la cuota sigue vigente, arranca el día siguiente al
vencimiento (pagar por adelantado suma, no pisa lo ya pago); si ya venció, arranca hoy
(el club no cobra retroactivo). Dura `meses` (1 por defecto, hasta 24). La vigencia del
socio **nunca se acorta**: un pago viejo cargado tarde no empeora su situación.

**Reglas del registro contable:**

- Un pago **no se edita ni se borra**: se anula con motivo, y queda con quién lo anuló
  y cuándo. Sigue consultable con `?anulacion=anulados`.
- Los **totales se calculan** sobre los pagos vigentes; no hay ningún acumulado guardado
  que pueda desfasarse.
- Montos en `numeric`, nunca en punto flotante.
- Queda asentado **quién registró** cada cobro. Los del panel, el admin que los cargó.
  Los cobros online (`origen: MERCADO_PAGO`) los registra el sistema al confirmarlos
  Mercado Pago, así que no tienen usuario: en `registradoPor` llega el texto
  `"Pago online (Mercado Pago)"`. La base exige que todo cobro del panel tenga usuario.
- Anular **no revierte la vigencia**: puede estar sostenida por otros pagos y adivinar
  cuál corresponde llevaría a errores silenciosos. La respuesta avisa con
  `requiereRevisarVigencia` y el admin la ajusta desde la ficha del socio.
- No se aceptan cobros con fecha futura ni montos menores o iguales a cero.
- **A un socio de una categoría sin cuota no se le registran cobros** (`VALIDATION_ERROR` en
  `socioId`): no tiene nada que pagar.

**Dos cuentas y tres medios** (decisión del cliente, 2026-10-30). El club recibe plata
solo en dos lugares, que son fijos (no hay alta de cuentas), y cada medio de pago va a
uno solo:

| Medio | Etiqueta | Quién lo carga | Cuenta |
|---|---|---|---|
| `EFECTIVO` | Efectivo | El admin, cuando se cobra en el club | **Efectivo** |
| `TRANSFERENCIA` | Transferencia | El admin, cuando el socio transfiere al alias o CVU de la cuenta de Mercado Pago del club | **Mercado Pago** |
| `MERCADO_PAGO` | Mercado Pago (online) | **Solo el sistema**, al confirmar Mercado Pago un pago hecho desde el sitio (tarjeta o dinero en cuenta) | **Mercado Pago** |

**La cuenta digital es la de Mercado Pago del club** (decisión del 2026-10-30, que
reemplaza a la de Banco Provincia del mismo día). La pasarela solo puede acreditar en
una cuenta de Mercado Pago, la dueña de las credenciales, así que toda la plata de la
cuota que no es efectivo entra ahí.

- **No hay "billetera virtual".** Un pago con tarjeta dentro de Mercado Pago entra por el
  cobro online (`MERCADO_PAGO`). Lo que se paga por Mercado Pago y carga el admin es
  una transferencia. La migración `DosCuentas` reclasificó como transferencia los
  cobros de prueba que lo usaban.
- **El backend controla que el medio vaya a su cuenta.** `POST /pagos` y el `pago` del
  alta manual responden `VALIDATION_ERROR` en `cuentaId` / `pago.cuentaId` si no
  coinciden. Con dos cuentas, un efectivo asentado en Mercado Pago descuadra la caja
  contra el resumen.
- **`MERCADO_PAGO` se rechaza en los cobros manuales** (`VALIDATION_ERROR` en `medioPago`):
  el formulario del panel ofrece solo efectivo y transferencia.
- **Las cuentas se reconocen por `usoSistema`** (`EFECTIVO` | `MERCADO_PAGO`), que viene en
  `GET /cuentas`. Así el panel elige la cuenta según el medio, y el sistema encuentra
  la de Mercado Pago aunque el club las renombre. Las crea `npm run seed`. El alias o
  CVU real se carga desde el panel, en `identificador`.

> **`anulacion` en `/pagos/mios`:** por defecto los listados excluyen los pagos anulados.
> El perfil del socio llama a `/pagos/mios?anulacion=todos` a propósito, para que pueda
> ver que un cobro suyo fue dado de baja y por qué. Sin eso no podría distinguir
> "no me lo registraron" de "me lo registraron y lo anularon". **No quitar ese filtro
> del endpoint por parecer sin uso.**

### Pago de la cuota con Mercado Pago (backend implementado)

El socio paga su cuota desde el perfil con **Checkout Pro**: el sitio lo manda a
Mercado Pago, paga ahí y vuelve. Elige cuántos meses paga (1 a 12) y el **importe lo
calcula siempre el backend**: la cuota de su categoría por los meses.

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| GET | `/pagos/mercadopago/cotizacion?meses=N` | SOCIO | `{ meses, montoMensual, total }` |
| POST | `/pagos/mercadopago/cuota` | SOCIO | `{ meses }` → `{ initPoint, meses, total }`. El front compara `total` con lo que mostró y hace `window.location = initPoint` |
| GET | `/pagos/mercadopago/estado/:referencia` | **público** | `{ estado, tipo }`, para la página de vuelta. `404` si no existe. Máx. 30 por minuto y por IP |
| POST | `/webhooks/mercadopago` | Mercado Pago | Avisos de pago. No lo llama el sitio |

`estado`: `PENDIENTE` | `APROBADO` | `RECHAZADO` | `EN_REVISION`. `tipo`: `CUOTA` | `ALTA`
(el alta con pago está en "Solicitudes de alta").

**Cómo viaja un pago.** Cada intento queda en `cobros_online` con una `referencia`
aleatoria de 128 bits. Esa referencia va a Mercado Pago como `external_reference`, y
las `back_urls` vuelven a `SITIO_URL/pagos/resultado?ref=<referencia>`. La página usa
solo `ref` e ignora los parámetros que agrega Mercado Pago, que cualquiera puede escribir
a mano.

**Nunca se le cree al aviso.** Ante un webhook o una consulta de estado, el backend
**pide el pago a Mercado Pago** con nuestras credenciales y controla que el importe y la
moneda coincidan con lo cotizado. Recién ahí registra el `Pago` (`medio` y `origen`
`MERCADO_PAGO`, comprobante `MP-<id del pago>`, cuenta Mercado Pago) y extiende la
vigencia, **en una sola transacción**. Después sale el correo "Recibimos tu pago". Si el
importe no coincide, el cobro queda `EN_REVISION` y no se registra nada.

- **Idempotente.** Mercado Pago avisa varias veces del mismo pago y la página de vuelta
  también consulta: el comprobante `MP-<id>` asegura que se registre una sola vez, y el
  cobro se bloquea mientras se procesa.
- **El estado no depende del webhook.** Si el cobro figura `PENDIENTE`, la consulta de
  estado le pregunta a Mercado Pago antes de responder. Además, **cada minuto** un control
  revisa los cobros pendientes de las últimas 24 horas: un pago aprobado queda
  registrado aunque el socio no vuelva al sitio y el aviso no llegue. En desarrollo,
  sin túnel, todo funciona igual.
- Un cobro vencido se da por rechazado **solo si Mercado Pago confirmó** que no tiene
  pago: si no respondió, puede haber uno aprobado que todavía no vimos.
- **Apretar "Pagar" dos veces no crea dos cobros:** si hay uno abierto por los mismos
  meses e importe, se devuelve ese.
- **Cada cobro se puede pagar 30 minutos.** Uno que vence sin pagarse se informa como
  `RECHAZADO`.
- **`binary_mode`**: aprobado o rechazado en el momento. **Sin efectivo** (se excluyen
  `ticket` y `atm`) y **en un solo pago** (sin cuotas de tarjeta).
- Un rechazo no pisa un cobro ya aprobado: con la misma preferencia se puede reintentar
  con otra tarjeta.
- Si Mercado Pago no está configurado o no responde al crear el cobro:
  `503 PAYMENT_GATEWAY_ERROR`, y no queda nada a medias.

**Variables de entorno.** `MP_ACCESS_TOKEN` (credenciales), `MP_WEBHOOK_SECRET` (valida la
firma `x-signature` de los avisos) y `MP_WEBHOOK_URL` (base pública https para los avisos:
el túnel en desarrollo, la API en producción). Sin `MP_WEBHOOK_URL` no hay avisos y el
estado se resuelve al volver. `auto_return` (que Mercado Pago vuelva solo al sitio) se
pide solo cuando `SITIO_URL` es https. **Mercado Pago rechaza `auto_return` hacia
`localhost`** (`invalid_auto_return`, comprobado el 2026-11-02): en desarrollo el socio vuelve
con "Volver al sitio", y si no vuelve, el control de cada minuto registra el pago igual.

### Débito automático de la cuota (backend implementado)

El socio activa desde su perfil que **Mercado Pago le cobre la cuota todos los meses**.
Cada cobro mensual se registra solo como un pago de un mes, que extiende la vigencia,
y le llega el correo "Recibimos tu pago".

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| GET | `/pagos/mercadopago/debito` | SOCIO | `{ estado, monto, initPoint }`. `estado`: `SIN_DEBITO` \| `PENDIENTE` \| `ACTIVO` \| `PAUSADO`. `initPoint` solo si está `PENDIENTE`, para retomarlo |
| POST | `/pagos/mercadopago/debito` | SOCIO | Activar → `{ initPoint, monto }`. El front hace `window.location = initPoint`. Si ya tiene uno pendiente por la misma cuota devuelve ese; si lo tiene activo, `409` |
| DELETE | `/pagos/mercadopago/debito` | SOCIO | Cancelar. `204`; `404` si no tiene. Si Mercado Pago no confirma, `503 PAYMENT_GATEWAY_ERROR` y **no** se da por cancelado |

**Un plan de Mercado Pago por socio** (`/preapproval_plan`). El socio entra con su
cuenta de Mercado Pago, elige la tarjeta y autoriza. Se eligió así porque una
suscripción suelta (`/preapproval`) exige el correo exacto de la cuenta de Mercado
Pago del pagador, que suele no ser el que tiene en el club, y Mercado Pago la rechaza si
no coincide con una cuenta real (comprobado el 2026-11-03).

| Estado | Qué significa |
|---|---|
| `PENDIENTE` | El plan está creado, pero el socio todavía no se suscribió en Mercado Pago |
| `ACTIVO` | Autorizó la suscripción: Mercado Pago cobra cada mes |
| `PAUSADO` | Lo pausó desde Mercado Pago: no cobra hasta que lo reanude |
| `CANCELADO` | Terminado (no aparece en la API: es `SIN_DEBITO`). Para volver se activa uno nuevo |

- **Cada cobro mensual aprobado es un `Pago`** de un mes (medio y origen `MERCADO_PAGO`,
  comprobante `MP-<id>`, cuenta Mercado Pago), con el importe que cobró Mercado Pago.
  Es idempotente, igual que los pagos de cuota. Los rechazados no se registran: Mercado
  Pago reintenta, y si no logra cobrar, la cuota vence como cualquier otra y salen los
  avisos.
- **Un control cada dos minutos** sincroniza los débitos con Mercado Pago (suscripción
  autorizada, pausas, cancelaciones y cobros nuevos), así no depende de los avisos.
  También se atienden los avisos `subscription_preapproval` y
  `subscription_authorized_payment`.
- **Un socio dado de baja** (`BAJA` o borrado lógico) **pierde el débito**: el control se
  lo cancela en Mercado Pago para que no le sigan cobrando. Antes se registran los
  cobros que ya se hubieran hecho.
- **Si el socio lo cancela desde su cuenta de Mercado Pago**, el control lo ve y queda
  cancelado acá también.
- **A lo sumo un débito vigente por socio** (índice único parcial). Una categoría sin
  cuota no puede activarlo (`VALIDATION_ERROR` en `debito`).
- **Pagar a mano sigue valiendo.** Un socio con débito puede pagar meses por adelantado
  desde el perfil o en el club: la vigencia se suma.
- **Si cambia la cuota de la categoría, el débito se actualiza solo** (decisión del
  cliente, 2026-11-03). El control de cada dos minutos le cambia el monto a la
  suscripción en Mercado Pago, sin que el socio tenga que volver a autorizarla, y lo
  mismo si al socio lo pasan a otra categoría. El cobro siguiente ya sale con el
  importe nuevo. Si lo pasan a una **categoría sin cuota**, el débito se cancela. Uno
  `PENDIENTE` se reemplaza al apretar "Activar"; si se suscribe con el plan viejo, el
  control le corrige el monto apenas lo asocia.
- **Avisos por correo** (pedido del cliente, 2026-11-03), para que nadie se entere de un
  problema con el débito recién cuando le vence la cuota:

  | Correo | Cuándo |
  |---|---|
  | "No pudimos cobrar tu cuota con débito automático" | Mercado Pago rechazó un cobro mensual. **Uno por cobro**, aunque Mercado Pago lo reintente (se asienta en `avisos_enviados` como `DEBITO_RECHAZADO`, con la fecha del cobro). Solo rechazos de la última semana: al ponerlo en marcha no salen avisos viejos |
  | "Se canceló tu débito automático" | Lo canceló Mercado Pago (desde la cuenta del socio, o después de varios cobros fallidos), o el socio pasó a una categoría sin cuota. **No sale** si lo canceló el socio desde el sitio, que ya lo sabe, ni si se lo dio de baja |
  | "Tu cuota de socio se renueva en N días" | Reemplaza al aviso "por vencer" para quien tiene el débito `ACTIVO`: le dice que no tiene que hacer nada. Un "pagala" lo llevaría a pagar dos veces |

  En el panel no hay indicador de débitos con problemas (decisión del cliente: solo los
  correos).
- **Vuelta desde Mercado Pago:** al perfil (`SITIO_URL/perfil`) cuando el sitio es https.
  Mercado Pago rechaza una vuelta a `localhost` (`back_url` inválida, comprobado el
  2026-11-03), así que en desarrollo el socio termina en su lista de suscripciones de
  Mercado Pago y vuelve al sitio a mano. Como el estado lo actualiza el control, en
  menos de dos minutos su perfil lo muestra `ACTIVO`.

### Devoluciones y contracargos (backend implementado)

La plata de un cobro online puede volver al pagador de dos formas: el club la
**devuelve desde su cuenta de Mercado Pago**, o el pagador **desconoce el pago ante su
tarjeta** y el banco lo revierte (contracargo). El sistema no inicia ninguna de las dos:
las **detecta** y las asienta en el `Pago` (decisiones del cliente, 2026-11-03). Desde
el panel no se devuelve plata.

| Caso | En Mercado Pago | Qué hace el sistema |
|---|---|---|
| `DEVOLUCION` | El pago pasa a `refunded` | **Anula el pago** ("Devuelto desde Mercado Pago") y, si es el último, le quita al socio el período que cubría |
| `CONTRACARGO` | El pago pasa a `charged_back` | Igual que una devolución total |
| `DEVOLUCION_PARCIAL` | Sigue `approved`, con un importe devuelto | **Solo lo informa**: el pago sigue vigente. Qué meses dejó de cubrir lo decide el admin |

- **La vigencia se resta solo si ese pago es el último**: si es el que marca hasta
  cuándo está al día el socio, la vigencia vuelve al día anterior a donde arrancaba el
  pago. Si después hubo otros pagos, no se toca: adivinar cuál la sostiene llevaría a
  errores. `devolucion.vigenciaRevertida` dice cuál de los dos pasó: si es `false`, la
  vigencia hay que revisarla desde la ficha del socio.
- **Indicador en el panel.** Cada devolución entra sin revisar y cuenta en
  `GET /pagos/devoluciones/pendientes/total`. El admin las ve en
  `GET /pagos?devolucion=pendientes&anulacion=todos`; hace falta `anulacion=todos`
  porque una devolución total queda anulada, y los listados excluyen los anulados por
  defecto. Las marca vistas con `PATCH /pagos/:id/revisar-devolucion`. Si una parcial se
  completa después, vuelve a contar.
- **Cada `Pago` trae `devolucion`**: `null`, o `{ tipo, montoDevuelto, detectadaEn,
  vigenciaRevertida, revisadaEn }`. Llega también al historial del socio, que así ve
  por qué se le anuló un cobro.
- **Vale para los tres cobros online:** cuota, alta y débito automático. Un pago
  devuelto antes de registrarse cuenta como no pagado.
- **Una devolución de un pago que el admin ya había anulado** se asienta igual para
  que la vea, pero no lo vuelve a anular ni toca la vigencia: eso ya lo decidió el admin.
- **Cómo se detecta.** Por el aviso de Mercado Pago (webhook) y, sin depender de él, con
  un **control de cada hora** que repasa los pagos que cambiaron en los últimos 3 días.
  Ese control también registra un pago aprobado que se le haya escapado al de cada
  minuto. Para correrlo en el momento: `npm run mp:revisar`. Es idempotente.
- **Al socio dado de alta por un pago que después se devuelve no se lo da de baja
  solo.** Queda con la cuota vencida y el admin lo ve en el indicador.

### Tienda online — catálogo (tarea 1, backend implementado)

Tienda del club (camisetas, indumentaria urbana, vasos, mates), **integrada** a este
sistema. El plan completo, por tareas, está en el documento "CDI — Plan de demo y
hoja de ruta", pestaña Tienda. La tarea 1 es el catálogo; pedidos, dashboard,
arrepentimiento y pasarela vienen después.

- **Esquema propio:** las tablas viven en el esquema `tienda` de la misma base. Se
  ven, se respaldan y se pueden permisar aparte, sin perder transacciones ni claves
  foráneas con `usuarios`. Una base separada no sumaba seguridad real y rompía eso.
- **Sitio aparte en un subdominio** (`tienda.<dominio>`, decisión del 2026-11-04): el
  mismo proyecto Next, con un middleware por host, y la misma API. La cookie de
  sesión (host-only, `SameSite=Lax`) sirve tal cual. `TIENDA_URL` es la base de los
  enlaces de la tienda: se arman como `TIENDA_URL` + ruta relativa, sin repetir
  `/tienda` (en desarrollo vale `http://localhost:3000/tienda`).

**Decisiones del cliente (2026-11-04):**
- Compra cualquiera, sin cuenta. El socio que inicia sesión ve su descuento.
- Cada producto es lo que muestra su foto: **solo se elige el talle**, sin colores
  ni personalización.
- Solo se vende con stock, solo online, con retiro en el club.
- Descuento de socio por categoría (Activo y Campeón), configurable, **solo con la
  cuota al día**.
- Botón de arrepentimiento: avisa al admin, que revisa el caso y devuelve desde
  Mercado Pago, como en las cuotas.
- La facturación y la cuenta de Mercado Pago se definen con la pasarela.

#### Endpoints públicos

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| GET | `/tienda/categorias` | **público** | Las activas, en el orden del menú |
| GET | `/tienda/productos` | **público** | Paginado. Filtros: `categoria` (slug), `talle` (con stock), `precioMin`, `precioMax`, `buscar`, `destacados=true`. `orden`: `relevancia` (por defecto) \| `nuevos` \| `precio-asc` \| `precio-desc`. **Lo agotado va siempre al final** |
| GET | `/tienda/talles` | **público** | `string[]` para el filtro del catálogo: los talles distintos que hoy se pueden comprar (activos, con stock, de productos y categorías activos). Cada producto usa los suyos (letras, números o a medida). Orden: letras por talle (XS, S, M…), números de menor a mayor y el resto alfabético |
| GET | `/tienda/productos/:slug` | **público** | Ficha: descripción, fotos y talles en orden. `404` si no existe o está inactivo |
| GET | `/tienda/configuracion` | **público** | `{ retiroLugar, retiroDireccion, retiroHorarios }`. Vacíos hasta que el club los cargue |
| GET | `/tienda/mi-descuento` | SOCIO | `{ porcentaje, motivo, categoria }`. `motivo`: `APLICA` \| `CATEGORIA_SIN_DESCUENTO` \| `CUOTA_VENCIDA` \| `SOCIO_DE_BAJA` |

- **La tienda pública nunca muestra el stock exacto**, solo `disponibilidad`:
  `DISPONIBLE`, `ULTIMAS_UNIDADES` (stock menor o igual al umbral configurable, 3 por
  defecto) o `SIN_STOCK`. El número lo ve el panel.
- **`precioSocio` en cada producto es una referencia** para quien no inició sesión:
  el precio con el **mayor** descuento entre las categorías activas, con su
  `descuentoSocio`. Es `null` si ninguna tiene descuento. El precio de cada socio
  sale de `/tienda/mi-descuento`, redondeado al centavo (medio centavo hacia arriba).
  **El precio de un pedido lo calcula siempre la API.**
- `nuevo`: el producto se cargó en los últimos 30 días. `tieneTalles: false` (vaso,
  mate): una sola variante, con `talle: null`, y se compra sin elegir.
- `descripcion` es **Markdown, nunca HTML**.

#### Endpoints del panel (`ADMIN` y `TIENDA`)

| Método | Ruta | Notas |
|---|---|---|
| GET · POST | `/tienda/admin/categorias` | Todas, también las inactivas. Alta con `nombre`, `slug?` y `orden?` |
| PATCH | `/tienda/admin/categorias/:id` | No hay baja: `activa: false` la saca con sus productos |
| GET | `/tienda/admin/productos` | Paginado, con el stock exacto. Filtros: `buscar`, `categoriaId`, `activo`, `stockBajo=true` |
| GET | `/tienda/admin/productos/:id` | |
| POST | `/tienda/admin/productos` | Con `variantes`: con talles, una fila por talle; sin talles, una sola fila sin `talle`. El stock inicial queda en el historial |
| PATCH | `/tienda/admin/productos/:id` | Datos del producto. No hay baja: `activo: false` lo oculta. **El slug no cambia al renombrar** |
| POST | `/tienda/admin/productos/:id/talles` | Agrega un talle. A un producto sin talles **lo convierte**: su stock, historial y ventas pasan a ese primer talle. Si es uno oculto (se eliminó y tenía ventas), vuelve con su stock e historial |
| PATCH | `/tienda/admin/variantes/:id` | Renombra, reordena o desactiva un talle |
| DELETE | `/tienda/admin/variantes/:id` | Elimina un talle. Sin ventas se borra con su historial; con ventas queda oculto (`activa: false`). Un producto no puede quedarse sin talles |
| POST | `/tienda/admin/variantes/:id/stock` | `{ cantidad, motivo: INGRESO \| AJUSTE, observaciones? }`. Se **suma** al stock |
| GET | `/tienda/admin/productos/:id/movimientos` | Historial de stock, paginado |
| POST | `/tienda/admin/productos/:id/imagenes` | `multipart`, campo `imagenes`. Se agregan al final |
| PUT | `/tienda/admin/productos/:id/imagenes/orden` | `{ ids }`: todas las fotos, en el orden nuevo. La primera es la de la grilla |
| DELETE | `/tienda/admin/imagenes/:id` | Borra el archivo |
| GET · PATCH | `/tienda/admin/configuracion` | `retiroLugar`, `retiroDireccion`, `retiroHorarios`, `umbralUltimasUnidades` |

Las respuestas de producto del panel traen el producto entero (`ProductoAdmin`), así
el front refresca la pantalla con lo que vuelve.

**Operadores de tienda** (solo `ADMIN`): `GET · POST /tienda/admin/operadores`,
`PATCH /tienda/admin/operadores/:id` (`{ activo }`) y
`POST /tienda/admin/operadores/:id/resetear-password`. Se entra con el DNI. La
contraseña inicial se devuelve una vez y hay que cambiarla en el primer ingreso.
**Desactivar a un operador le corta la sesión en el próximo request.** Un DNI que ya
tiene usuario (por ejemplo, un socio) responde `409`.

**El descuento por categoría** se configura en `PATCH /tipos-socio/:id` con
`descuentoTienda` (0 a 100), solo el `ADMIN`. Viene en cada `TipoSocio`.

**Reglas del catálogo:**
- **El stock solo cambia con un movimiento**, que queda con cantidad, stock resultante,
  motivo y quién lo cargó. No se edita ni se borra: un error se corrige con un ajuste
  contrario. Se suma en la base en una sola sentencia, con la condición de no quedar
  negativo, así un ingreso del panel no pisa una venta simultánea.
- **Los talles son texto libre:** letras, números ("38", "38,5", también como número en
  JSON) o a medida ("10 AÑOS"). Al agregar o renombrar uno, si el producto tiene todos
  letras o todos números, `orden` se recalcula solo: cargar el 38 después del 40 lo deja
  primero. Con talles a medida se respeta el orden en que se cargaron.
- **Talles en mayúscula y sin repetir** ("m" y "M" son el mismo). Un producto es con
  talles o sin talles: no se mezclan, pero uno sin talles se puede convertir agregándole
  el primero (decisión del cliente, 2026-11-05). Al revés no.
- **Casi nada se borra:** categorías y productos se desactivan, porque los pedidos
  apuntan a ellos. Un talle sí se puede eliminar: si nunca se vendió desaparece, y si
  se vendió queda oculto (el cliente todavía no definió qué talles va a haber, 2026-11-05).
- **Fotos re-codificadas:** jpg, png o webp, hasta 8 MB, al menos 600 px de lado y
  hasta 10 por producto. sharp las abre de verdad (un archivo disfrazado se
  rechaza), las endereza, les borra los metadatos (GPS, cámara) y las guarda en WebP
  con 1600 px como máximo, en `uploads/productos`.
- **El panel no muestra datos de los socios a un operador.** Los endpoints de socios,
  cuotas y cobros siguen siendo solo del `ADMIN`.

### Tienda online — carrito y pedido (tarea 2, backend implementado)

El carrito vive en el navegador. La API lo **cotiza** y lo **confirma**: precios,
descuento y stock salen siempre de la base, nunca del carrito.

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| POST | `/tienda/carrito/cotizacion` | **público, sesión opcional** | `{ items: [{ varianteId, cantidad }] }` → `Cotizacion`. No reserva nada. Máx. 60 por minuto y por IP |
| POST | `/tienda/pedidos` | **público, sesión opcional** | Confirma: `{ items, comprador?, retira?, notas? }` → `201 { pedido, seguimientoToken }`. Máx. 5 por minuto y por IP |
| POST | `/tienda/pedidos/seguimiento` | **público** | `{ token }` → `Pedido`. `404` si no existe. Máx. 20 por minuto y por IP |
| GET | `/tienda/mis-pedidos` | SOCIO | Paginado, los más nuevos primero |
| GET | `/tienda/mis-pedidos/:codigo` | SOCIO | Por código (`T-0042`). Uno ajeno responde `404` |

- **Sesión opcional** (`@SesionOpcional()`): el endpoint es público, pero si llega una
  sesión válida la usa. Una sesión vencida, inválida o con la contraseña inicial
  pendiente cuenta como **invitado**, sin `401` ni `403`.
- **Cotización:** junta renglones repetidos. Hasta 10 unidades de cada producto y 20
  productos distintos. Una línea con problema se **marca** en vez de fallar:
  `NO_DISPONIBLE` (no existe, o el talle, el producto o la categoría están inactivos)
  o `STOCK_INSUFICIENTE`, con `disponibles`. `valida: false` si alguna tiene problema. **El total suma todo lo que tiene precio**, también las líneas sin stock suficiente (así el resumen coincide con los renglones); solo queda afuera lo `NO_DISPONIBLE`.
  Trae `descuentoSocio` (`{ porcentaje, motivo }`) para un socio con sesión, `null`
  para un invitado.
- **Descuento:** el de `/tienda/mi-descuento`, aplicado a cada unidad y redondeado al
  centavo. Un admin o un operador con sesión compran como cualquiera, sin descuento.
- **Comprador:** un invitado manda `comprador` (`nombre`, `apellido`, `dni`, `email`,
  `telefono`); sin él, `fieldErrors.comprador`. **Un socio con sesión compra con los
  datos de su ficha** y lo que mande se ignora: el pedido queda a su nombre.
  `retira` (`nombre`, `dni`) solo si retira otra persona.
- **Confirmar vuelve a cotizar** dentro de la transacción y **descuenta el stock** con
  la misma suma condicional del panel, que impide la sobreventa: de dos compras
  simultáneas de la última unidad pasa una. Si algo cambió desde la cotización
  responde `409 CONFLICT` con `fieldErrors["items.<varianteId>"]` ("Solo quedan 2",
  "Ya no está a la venta") y **no crea nada**: el front vuelve a cotizar.
- **Precios congelados:** cada renglón guarda nombre, talle, precio de lista y precio
  final del momento. Si después cambia el producto, el pedido no cambia.
- **Código:** `T-0042`, correlativo. Por eso **no alcanza para ver un pedido**: el
  invitado entra con su token y el socio con su sesión.
- **Seguimiento:** el token (256 bits) llega en el correo de confirmación y en la
  respuesta de `POST /tienda/pedidos`, y en la base se guarda solo su SHA-256. El
  enlace es `TIENDA_URL/pedido?token=<token>`: la página lo lee, lo saca de la barra
  de direcciones (`history.replaceState`), usa `Referrer-Policy: no-referrer` y lo
  manda en el cuerpo de `/tienda/pedidos/seguimiento`. **El seguimiento no muestra el
  DNI.**
- **Reserva y vencimiento:** el pedido nace `PENDIENTE_PAGO` con el stock reservado
  hasta `venceEn` (`horasReserva` de la configuración, **48 h por defecto**). Mientras
  no esté la pasarela (tarea 6) se paga en el club al retirarlo. **Cada minuto** un
  control cancela los vencidos: el stock vuelve (movimiento `CANCELACION`), queda en
  el historial y le llega un correo al comprador.
- **Correos:** "Recibimos tu pedido T-0042" (detalle, total, hasta cuándo se reserva,
  dónde se retira y el enlace) y "Tu pedido T-0042 se canceló". Si el correo falla, el
  pedido igual queda hecho.

**Estados** (`EstadoPedido`): `PENDIENTE_PAGO` → `PAGADO` → `PREPARADO` (listo para
retirar) → `RETIRADO`, y `CANCELADO`. Por ahora solo existen `PENDIENTE_PAGO` y
`CANCELADO` (vencido); los demás los maneja el panel en la tarea 3.

### Disciplinas (implementado)

Actividades del club. Reemplazan al menú "Fútbol" por **"Disciplinas"**, que despliega
las seis como una **lista plana**, sin agrupar: las categorías de fútbol conviven al
mismo nivel que patín y la colonia.

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| GET | `/disciplinas` | **público** | Lista en el orden del menú. `?todas=true` incluye las inactivas |
| GET | `/disciplinas/:slug` | **público** | Detalle por slug (ej: `/disciplinas/patin`) |
| POST | `/disciplinas` | ADMIN | El slug se genera del nombre si no se envía |
| PATCH | `/disciplinas/:id` | ADMIN | `activa: false` la saca del sitio sin borrarla |
| DELETE | `/disciplinas/:id` | ADMIN | `204` |

El `slug` se genera del nombre quitando tildes ("Colonia de Verano" →
`colonia-de-verano`) y es único; al renombrar se regenera, salvo que se haya fijado a
mano. El orden del menú lo da `orden` y, a igualdad, el nombre.

Iniciales (semilla, en ese orden): **Fútbol Masculino**, **Fútbol Femenino**,
**Escuelita**, **Inferiores**, **Patín** y **Colonia de Verano**.

### Páginas institucionales (implementado)

Secciones de contenido del sitio. Slugs actuales: **`proyectos`**, **`historia`**,
**`galeria`** y **`socio`**. El texto de cada disciplina va en `disciplinas.contenido`,
no acá.

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| GET | `/paginas/:slug` | **público** | Ej: `/paginas/proyectos`. Una página despublicada responde 404 |
| GET | `/paginas` | ADMIN | Listado, incluye las despublicadas |
| PATCH | `/paginas/:slug` | ADMIN | Edita `titulo`, `resumen`, `contenido` y `publicada` |

**No hay alta ni baja a propósito:** cada página necesita su ruta en el frontend, y
dejar crearlas desde el panel generaría contenido que ninguna página muestra. Las crea
la semilla; desde el panel solo se edita. Por el mismo motivo el `slug` no es editable.

> ⚠️ **`contenido` es Markdown, no HTML.** Lo escribe una persona desde el panel:
> volcarlo con `innerHTML` permitiría inyectar scripts. Renderizarlo como Markdown
> o como texto plano.

**`contenido` vacío (`""`) es un estado válido y esperado:** significa que la sección
existe y está publicada pero el club todavía no pasó el texto. El sitio muestra ahí su
estado vacío. **Nunca rellenar con ejemplos inventados**, que publicados se leen como
información real del club.

#### Cómo se carga el contenido

Durante el desarrollo el club pasa el texto por chat y se carga en
`cdi-backend/src/database/seeds/seed-data.ts` (`PAGINAS_SEED`). **Esa lista es la
fuente de verdad**: así el contenido queda versionado en git y sobrevive a cualquier
reseteo de la base.

| Comando | Qué hace |
|---|---|
| `npm run seed` | Crea las páginas que falten. **Nunca pisa** lo que ya está |
| `npm run seed:contenido` | Baja el texto de la semilla a la base, **pisando** lo que haya |

Son dos comandos distintos para que el pisado sea siempre deliberado y nunca un efecto
secundario de sembrar. Cuando el club empiece a editar desde el panel, el criterio se
invierte: el contenido pasa a vivir en la base y `seed:contenido` deja de usarse.
La edición desde el panel se mantiene funcionando: es el camino previsto, solo que
todavía no se usa.

### Correos automáticos: avisos de cuota y cumpleaños (backend implementado)

Al socio le llega un correo cuando su cuota **está por vencer**, otro cuando **venció**,
y el **saludo del club el día de su cumpleaños**. No hay endpoints: lo dispara una tarea
programada dentro del backend, una vez por día (`AVISOS_CRON`, por defecto `0 9 * * *`
en `APP_TIMEZONE`). Para mandarlos en el momento: `npm run avisos:enviar`. Se puede
ejecutar las veces que sea: lo ya enviado no se repite.

| Correo | Cuándo |
|---|---|
| Cumpleaños | El día que coincide con `fechaNacimiento`. Los nacidos un 29/2 lo reciben el 28/2 en los años no bisiestos |
| Por vencer | **5 días antes** del vencimiento si el número de socio es **par**, **4 días antes** si es **impar** |
| Vencida | Desde el día siguiente al vencimiento, y solo durante 7 días |

**Por qué la mitad a 5 días y la otra a 4.** Decisión del cliente del 2026-10-30. Los
proveedores de correo gratuitos tienen un límite **por día**. Con una carga masiva de
socios, todos quedan con el mismo vencimiento, y el aviso de todos caería el mismo
día. Partidos por número de socio, el envío se reparte en dos días. El número de socio
no cambia, así que cada socio recibe el aviso siempre con la misma anticipación.

- **Tope diario** (`AVISOS_LIMITE_DIARIO`, 250 por defecto, compartido por los tres
  correos). Es la red de seguridad si ni así alcanza: lo que no entra sale al día
  siguiente. El orden es **cumpleaños, por vencer** (el vencimiento más cercano
  primero) **y vencidas**. El cumpleaños va primero porque es el único que no puede
  esperar: un saludo al día siguiente ya no es un saludo, así que no se posterga. Dejarlo por debajo del límite del plan del proveedor, para que quede
  lugar para los otros correos (alta, recuperación de clave).
- **Un aviso por vencimiento, no por socio** (`avisos_enviados`). Si paga, la vigencia
  se corre y el vencimiento nuevo tiene su propio aviso. El cumpleaños se asienta con
  la fecha del saludo, así que vuelve a salir el año siguiente.
- **Si un día no corre** (servidor caído, tope alcanzado), el aviso "por vencer" sale
  al día siguiente: le corresponde desde su día de anticipación hasta el vencimiento.
- **La ventana de 7 días de "vencida" es a propósito**: al poner el sistema en marcha
  no les llega un correo a socios vencidos hace meses.
- Solo socios en `ALTA` y sin baja lógica. **Los avisos de cuota no les salen a las
  categorías sin cuota** (Juvenil, Campeón): no se les vence nada. El saludo de
  cumpleaños les llega a todos, **tengan o no la cuota al día**: es un saludo, no un aviso.
- Si el servidor de correo rechaza 3 envíos seguidos, corta la tanda: lo más probable
  es que esté caído, y lo pendiente sale en la próxima ejecución.

**El saludo de cumpleaños** (pedido del cliente, 2026-10-30) es cálido y en nombre de
"la familia rojinegra" del club. No menciona la cuota ni lleva botón al sitio, y no usa
adjetivos con género ("querido", "rodeado"): el sistema no sabe cómo se nombra cada
socio. El texto está en `correoCumpleanios`.

**El texto de los avisos de cuota no inventa datos del club.** Dice la fecha, la categoría y el importe
configurado. Para el pago remite a "la administración del club" y enlaza a
`SITIO_URL/perfil`. Cuando el club defina medios de pago o contacto, se suman ahí
(`src/modules/avisos/domain/plantillas.ts`).

**Correo en desarrollo: Mailpit** (`docker compose up -d`). Atrapa todo lo que manda la
API sin enviarlo a internet; la bandeja se ve en `http://localhost:8025`. Así ningún
aviso de prueba le llega a una persona real. En producción solo cambian las variables
`SMTP_*` y `MAIL_FROM` por las del proveedor (Brevo, Resend…), y conviene un dominio
propio del club para que los correos no caigan en spam.

> ⚠️ **Simular fechas deja registros.** `npm run avisos:enviar -- 2026-11-24` (solo fuera
> de producción) asienta los avisos con esa fecha de envío, y eso bloquea los avisos
> reales de esos vencimientos y los saludos de ese día. Después de probar, vaciar la tabla: `DELETE FROM avisos_enviados;`.

**WhatsApp quedó descartado por ahora** (decisión del 2026-10-30). Los avisos de alta y
la recuperación de contraseña por correo van en una tarea aparte: comparten el enlace
de un solo uso para elegir la clave.

### Códigos de error

`VALIDATION_ERROR`, `BAD_REQUEST`, `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`, `PASSWORD_CHANGE_REQUIRED`,
`WEAK_PASSWORD`, `SESSION_EXPIRED`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`,
`PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, `TOO_MANY_REQUESTS`, `PASSWORD_CHANGE_LIMIT`,
`INVALID_TOKEN` (enlace de elegir contraseña inexistente, usado o vencido), `PAYMENT_GATEWAY_ERROR` (503: Mercado Pago sin configurar o sin responder), `INTERNAL_ERROR`.

Qué debe hacer el frontend: `SESSION_EXPIRED`/`UNAUTHORIZED` → mandar a `/login`;
`PASSWORD_CHANGE_REQUIRED` → mandar a `/cambiar-password`; `VALIDATION_ERROR` → pintar `fieldErrors` en el formulario.

> Las respuestas exitosas **no** van envueltas (nada de `{ data: ... }`): el cuerpo es
> directamente el recurso, tal como lo declaran los tipos del frontend.

## Datos iniciales (`npm run seed` en cdi-backend)

**Cuenta de administración:** "Club Deportivo Independencia" — usuario con rol `ADMIN`
y **sin ficha de socio** (administra el sistema, no paga cuota). Accede a todo:
crear, editar y dar de baja socios, y configurar tipos de socio.
Credenciales de desarrollo en `.env` (`SEED_ADMIN_*`): DNI `20000001`, clave `CdiAdmin2026`.

**Administrador de la tienda:** otro usuario, con rol `TIENDA` y sin ficha de socio. Maneja productos, stock y pedidos, y no ve socios ni cuotas. Lo crea la semilla, igual que al admin, y no se toca si el DNI ya existe. Credenciales de desarrollo en `.env` (`SEED_TIENDA_*`): DNI `20000002`, clave `CdiTienda2026`. `demo:reiniciar` lo deja sin cambio de clave obligatorio. Los demás operadores de tienda los crea el admin desde el panel.

**Categorías de socio iniciales:**

| Categoría | Descripción | Cuota |
|---|---|---|
| Socio Activo | Socio activo, con beneficios exclusivos. | $8.000 |
| Socio Protector | Mitad de precio y algunos beneficios. | $4.000 |
| Socio Juvenil | Deportistas menores de 18 años. Sin cuota, con entrada gratis a todas las actividades del club. | **Sin cuota** |
| Socio Campeón | Jugadores que salieron campeones con el club. Sin cuota, con entrada gratis a todas las actividades y descuento en el alquiler de salones. | **Sin cuota** |

**Categorías sin cuota** (`montoCuota: null`, definidas por el cliente el 2026-11-02). Sus
socios están **siempre al día** mientras estén de alta: la vigencia no se mira, no reciben
avisos de cuota, no se les registran cobros, y la categoría no se ofrece en "Hacete
socio" porque no hay nada que pagar online. Las asigna el club desde el panel, al dar
de alta o al editar un socio. Tienen carnet QR como cualquier otro socio, y al escanearlo
se ve su categoría y que está al día. **La pantalla de escaneo no habla de beneficios
ni descuentos** (decisión del cliente, 2026-11-02): solo la situación y la categoría.

Montos definidos por el cliente el 2026-10-30. En la semilla, el Protector se calcula
como la mitad de `CUOTA_BASE`. La semilla no pisa los montos ya guardados: para cambiar
los de una base existente, editarlos desde el panel (`PATCH /tipos-socio/:id`).

> ⚠️ **Provisional:** los montos y los datos del administrador son placeholders para
> desarrollo y testing, pendientes de confirmar con el club. Para sumar categorías,
> agregarlas a `src/database/seeds/seed-data.ts`: la semilla es idempotente y solo
> crea las que falten, sin pisar lo que se haya editado desde el panel.

## Modelo de datos (backend)

- `usuarios`: identidad + credenciales (`dni` único, `nombre`, `apellido`, `password_hash`, `rol`, `must_change_password`, `last_login_at`).
- `socios`: ficha de membresía 1:1 con `usuarios` (`numero_socio` serial, domicilio, localidad, email, teléfono, fecha de nacimiento, `foto_url`, `tipo_socio_id`, `estado`, `vigencia_desde`, `vigencia_hasta`, `codigo_qr`, `deleted_at`). DNI/nombre/apellido se leen del usuario (una sola fuente de verdad).
- `tipos_socio`: `nombre` único, `descripcion`, `monto_cuota`, `activo`.
- `cuentas`: destino de los cobros (`nombre` único, `tipo`, `identificador`, `activa`, `uso_sistema` = `EFECTIVO` | `MERCADO_PAGO`, único). El club usa solo esas dos cuentas: Efectivo y Mercado Pago.
- `cambios_password`: cuándo cambió su clave cada usuario y si fue voluntario (no guarda hashes). Sirve para el límite de 2 cada 30 días.
- `enlaces_password`: enlaces **pendientes** para elegir contraseña (`usuario_id`, `token_hash` SHA-256 único, `tipo` = `BIENVENIDA` | `RECUPERACION`, `expira_en`). Usarlo lo borra.
- `cobros_online`: cada intento de cobro por Mercado Pago (`referencia` única = `external_reference`, `tipo`, `estado`, `socio_id`, `meses`, `monto_mensual`, `total`, `preferencia_id`, `init_point`, `expira_en`, `mp_payment_id` único, `pago_id` → el `Pago` registrado, `solicitud_id` en un alta (queda nulo al resolverse), `detalle`). No es el registro contable: ese es `pagos`.
- `debitos_automaticos`: débito automático de cada socio (`socio_id`, `estado` = `PENDIENTE` | `ACTIVO` | `PAUSADO` | `CANCELADO`, `plan_id` único, `init_point`, `suscripcion_id` único, `monto`, `cancelado_en`, `motivo_cancelacion`). A lo sumo uno no cancelado por socio.
- `pagos`: cobro de cuota (`socio_id`, `cuenta_id`, `monto` numeric, `medio_pago`, `fecha_pago`, período cubierto, `comprobante`, `origen` (`PANEL` | `MERCADO_PAGO`), quién registró (nulo solo en los cobros online), datos de anulación, y la devolución o contracargo detectado en Mercado Pago: `devolucion` = `DEVOLUCION` | `DEVOLUCION_PARCIAL` | `CONTRACARGO`, `monto_devuelto`, `devolucion_en`, `vigencia_revertida` y `devolucion_revisada_en`).
- `tipos_socio.descuento_tienda` (0–100) y `usuarios.activo` (un usuario inactivo no entra; lo usan los operadores de tienda).
- Esquema `tienda`: `categorias` (`slug` único, `orden`, `activa`), `productos` (`slug` único, `precio` numeric, `descripcion` Markdown, `destacado`, `activo`), `variantes` (un talle de un producto, `talle` nulo = sin talles, `stock` ≥ 0, `orden`, `activa`), `imagenes` (ruta, orden, ancho y alto), `movimientos_stock` (cantidad, stock resultante, motivo `INGRESO` \| `AJUSTE` \| `VENTA` \| `CANCELACION`, quién) y `configuracion` (una fila: datos de retiro, umbral de últimas unidades y `horas_reserva`). Pedidos: `pedidos` (`numero` correlativo → código `T-0042`, `estado`, `socio_id` si compró un socio con sesión, datos del comprador y de quien retira, `subtotal`, `descuento_porcentaje`, `descuento_monto`, `total`, `vence_en`, `seguimiento_hash` SHA-256 único, `motivo_cancelacion`), `items_pedido` (nombre, talle y precios congelados al comprar) e `historial_pedidos` (cada estado, cuándo y quién). `movimientos_stock.pedido_id` apunta al pedido de una venta o cancelación.
- `paginas`: secciones de contenido editable (`slug` único, `titulo`, `resumen`, `contenido` en Markdown, `publicada`).
- `disciplinas`: actividades del menú (`slug` único, `orden`, `activa`). Lista plana, sin jerarquía.
- `solicitudes_socio`: postulaciones pendientes (datos del formulario + `foto_path` + `tipo_socio_id` + `estado` = `PENDIENTE_PAGO` | `REQUIERE_REVISION`, `vence_en`, `motivo_revision`). `dni` y `email` únicos. Se borra al darse el alta, al rechazarla o si el pago se rechaza o vence.
- `solicitudes_baja`: pedidos de baja pendientes (`socio_id` único + `motivo` opcional). Se borra al aprobar o rechazar; aprobar solo cambia `socios.estado` a `BAJA`.
- `avisos_enviados`: cada correo automático mandado (`socio_id`, `tipo` = `CUOTA_POR_VENCER` | `CUOTA_VENCIDA` | `CUMPLEANIOS` | `DEBITO_RECHAZADO`, `fecha_referencia`, `fecha_envio`, `email`). `fecha_referencia` es el vencimiento en los avisos de cuota, el día del saludo en el de cumpleaños y el día del cobro en el de débito rechazado. Único por socio + tipo + fecha: es lo que impide repetirlo.
- `socios.foto_path` guarda la ruta relativa del archivo; la URL pública se arma al responder.

## Comandos rápidos

Backend (`cdi-backend/`): `npm run start:dev`, `npm test`, `npm run lint`, `npm run migration:generate -- src/database/migrations/<Nombre>`, `npm run migration:run`, `npm run seed`, `npm run seed:dev` (datos de prueba para el frontend; credenciales en el README del backend), `npm run demo:reiniciar` (**borra todos los datos** y deja la base para mostrarle el sistema al cliente: el admin, tres socios (al día, por vencer y con la cuota vencida) y la tienda con seis productos de muestra y 10% de descuento para Activo y Campeón, con la misma contraseña que `seed:dev`; correrlo con el servidor apagado y el mismo día de la demo, porque las fechas son relativas a hoy; no corre en producción), `npm run avisos:enviar` (manda ya los avisos de cuota y saludos de cumpleaños del día; en desarrollo acepta una fecha para simular), `npm run mp:verificar` (comprueba las credenciales de Mercado Pago del `.env` sin mostrarlas), `npm run mp:revisar` (corre ya la revisión de cada hora de pagos de Mercado Pago: devoluciones, contracargos y aprobados que se hayan escapado).
Frontend (`cdi-frontend/`): `npm run dev`, `npm run lint`, `npm run build`.
