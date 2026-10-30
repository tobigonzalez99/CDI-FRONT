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
| Roles | `ADMIN` \| `SOCIO` |
| Socio | `nombre` y `apellido` separados; `dni` string (7–8 dígitos); fechas `YYYY-MM-DD`; `vigencia: { desde, hasta }` inclusive. |
| Estado socio | `ALTA` \| `BAJA` (administrativo, persistido). Además soft delete (`deletedAt`). |
| Carnet QR | `socios.codigoQr` (aleatorio, único, nulo hasta generarlo) y `carnetUrl` (`SITIO_URL/carnet/<codigo>`), que arma el backend. El escaneo es público |
| Estado cuota | `AL_DIA` \| `PENDIENTE` — **calculado** por el backend comparando la vigencia con la fecha actual en `America/Argentina/Buenos_Aires`. No se persiste. |
| Tipos de socio | Entidad configurable (`TipoSocio`), no enum. El alta de socio recibe `tipoSocioId`. |
| Alta de socio | JSON o `multipart/form-data` (archivo `foto` opcional; `vigencia` y `pago`, si van, serializados como JSON). Lleva `vigencia` **o** `pago`, nunca los dos. Respuesta `{ socio, passwordInicial }` (la clave se muestra una única vez). |
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

Sin ninguna de las dos responde `fieldErrors.vigencia`; con las dos, también. Una
categoría sin cuota no se puede cobrar (`fieldErrors["pago.meses"]`). La **foto es
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
> 2026-10-29: el camino para el socio que olvida su clave va a ser la **recuperación por
> correo**, prevista para unas tareas más adelante. Este endpoint queda como la salida
> para quien no tenga acceso a su correo. **No sumarlo a la interfaz del panel sin que lo
> pida el cliente.**

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
> volver a consultarla: el admin tiene que copiarla y entregarla en ese momento.

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

### Solicitudes de alta — "Hacete socio" (implementado)

Una persona se postula desde el sitio público; el alta **no** se efectúa hasta que un
administrador la aprueba. La tabla guarda **solo solicitudes pendientes**: aprobar crea
el socio y borra la solicitud; rechazar borra los datos y la foto.

| Método | Ruta | Acceso | Notas |
|---|---|---|---|
| GET | `/tipos-socio/disponibles` | **público** | Categorías activas, para el selector del formulario |
| POST | `/solicitudes` | **público** | `multipart/form-data`. Máx. 3 envíos por minuto y por IP |
| GET | `/solicitudes` | ADMIN | Paginado, más antiguas primero. Devuelve la tarjeta completa |
| GET | `/solicitudes/pendientes/total` | ADMIN | `{ pendientes: n }` para el indicador del panel |
| GET | `/solicitudes/:id` | ADMIN | |
| POST | `/solicitudes/:id/aprobar` | ADMIN | "Dar de alta". Devuelve `{ socio, passwordInicial }`. Cuerpo opcional: `tipoSocioId`, `vigencia` |
| DELETE | `/solicitudes/:id` | ADMIN | "Rechazar solicitud". Borra datos y foto, `204` |

**Campos del formulario — todos obligatorios menos `comentario`:** `nombre`, `apellido`,
`dni`, `email`, `domicilio`, `localidad`, `telefono`, `fechaNacimiento`, `tipoSocioId`
y `foto` (archivo). Aprobar sin cuerpo usa la categoría solicitada y una vigencia de un
mes desde hoy.

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
| GET | `/pagos` | ADMIN | Filtros: `socioId`, `cuentaId`, `medioPago`, `desde`, `hasta`, `anulacion` |
| GET | `/pagos/resumen` | ADMIN | Ingresos por mes, acumulado y desglose por medio y por cuenta |
| GET | `/pagos/:id` | ADMIN | |
| PATCH | `/pagos/:id/anular` | ADMIN | Motivo obligatorio. Devuelve `requiereRevisarVigencia` |
| GET | `/pagos/socio/:socioId` | ADMIN | Historial de un socio + `totalCobrado` y `pagosVigentes` |
| GET | `/pagos/mios` | SOCIO | Su historial de pagos. **Acepta los mismos filtros que `/pagos`**, incluido `anulacion` |
| GET · POST | `/cuentas` | ADMIN | `?soloActivas=true` para el selector de cobro |
| GET · PATCH | `/cuentas/:id` | ADMIN | Desactivar la saca de cobros nuevos sin tocar los pagos ya hechos |

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

**Medio de pago `MERCADO_PAGO`** ("Mercado Pago (online)"): solo lo registra el
sistema, con el pago de Mercado Pago que lo respalda. `POST /pagos` lo rechaza
(`VALIDATION_ERROR` en `medioPago`), así que el formulario del panel no tiene que
ofrecerlo. Un cobro por Mercado Pago que el admin carga a mano sigue siendo
`BILLETERA_VIRTUAL`.

**Cuenta del sistema.** Los cobros online se asientan en la cuenta con
`usoSistema: MERCADO_PAGO` (la crea `npm run seed`, como "Mercado Pago (cobros online)").
El sistema la busca por ese campo y no por el nombre, así que el club puede renombrarla.

> **`anulacion` en `/pagos/mios`:** por defecto los listados excluyen los pagos anulados.
> El perfil del socio llama a `/pagos/mios?anulacion=todos` a propósito, para que pueda
> ver que un cobro suyo fue dado de baja y por qué. Sin eso no podría distinguir
> "no me lo registraron" de "me lo registraron y lo anularon". **No quitar ese filtro
> del endpoint por parecer sin uso.**

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
- Solo socios en `ALTA` y sin baja lógica. El saludo de cumpleaños les llega a todos
  ellos, **tengan o no la cuota al día**: es un saludo, no un aviso.
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
`INTERNAL_ERROR`.

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
| Socio Activo | Socio activo, con beneficios exclusivos. | $8.000 |
| Socio Protector | Mitad de precio y algunos beneficios. | $4.000 |

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
- `cuentas`: destino de los cobros (`nombre` único, `tipo`, `identificador`, `activa`, `uso_sistema` único y nulo salvo en las cuentas que usa el sistema).
- `cambios_password`: cuándo cambió su clave cada usuario y si fue voluntario (no guarda hashes). Sirve para el límite de 2 cada 30 días.
- `pagos`: cobro de cuota (`socio_id`, `cuenta_id`, `monto` numeric, `medio_pago`, `fecha_pago`, período cubierto, `comprobante`, `origen` (`PANEL` | `MERCADO_PAGO`), quién registró (nulo solo en los cobros online), y datos de anulación).
- `paginas`: secciones de contenido editable (`slug` único, `titulo`, `resumen`, `contenido` en Markdown, `publicada`).
- `disciplinas`: actividades del menú (`slug` único, `orden`, `activa`). Lista plana, sin jerarquía.
- `solicitudes_socio`: postulaciones pendientes (datos del formulario + `foto_path` + `tipo_socio_id`). `dni` y `email` únicos. Se borra al aprobar o rechazar.
- `solicitudes_baja`: pedidos de baja pendientes (`socio_id` único + `motivo` opcional). Se borra al aprobar o rechazar; aprobar solo cambia `socios.estado` a `BAJA`.
- `avisos_enviados`: cada correo automático mandado (`socio_id`, `tipo` = `CUOTA_POR_VENCER` | `CUOTA_VENCIDA` | `CUMPLEANIOS`, `fecha_referencia`, `fecha_envio`, `email`). `fecha_referencia` es el vencimiento en los avisos de cuota y el día del saludo en el de cumpleaños. Único por socio + tipo + fecha: es lo que impide repetirlo.
- `socios.foto_path` guarda la ruta relativa del archivo; la URL pública se arma al responder.

## Comandos rápidos

Backend (`cdi-backend/`): `npm run start:dev`, `npm test`, `npm run lint`, `npm run migration:generate -- src/database/migrations/<Nombre>`, `npm run migration:run`, `npm run seed`, `npm run seed:dev` (datos de prueba para el frontend; credenciales en el README del backend), `npm run avisos:enviar` (manda ya los avisos de cuota y saludos de cumpleaños del día; en desarrollo acepta una fecha para simular), `npm run mp:verificar` (comprueba las credenciales de Mercado Pago del `.env` sin mostrarlas).
Frontend (`cdi-frontend/`): `npm run dev`, `npm run lint`, `npm run build`.
