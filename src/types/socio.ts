import type { ISODateString, PaginationParams } from "./api";
import type { MedioPagoManual } from "./pago";

/**
 * HU-09: los tipos de socio son configurables por el administrador,
 * por eso se modelan como entidad y no como enum fijo.
 */
export interface TipoSocio {
  id: string;
  nombre: string;
  descripcion: string | null;
  montoCuota: number | null;
  activo: boolean;
}

/** HU-08: condición administrativa del socio (Alta / Baja). */
export const ESTADOS_SOCIO = ["ALTA", "BAJA"] as const;
export type EstadoSocio = (typeof ESTADOS_SOCIO)[number];

/** HU-04: estado de la cuota ("AL DÍA" / "PENDIENTE DE PAGO"). */
export const ESTADOS_CUOTA = ["AL_DIA", "PENDIENTE"] as const;
export type EstadoCuota = (typeof ESTADOS_CUOTA)[number];

/** HU-09: rango de vigencia de la membresía (ej: 16/09 al 16/10). */
export interface Vigencia {
  desde: ISODateString;
  hasta: ISODateString;
}

export interface Socio {
  id: string;
  numeroSocio: number;
  nombre: string;
  apellido: string;
  /** String para preservar ceros y evitar operaciones numéricas accidentales. */
  dni: string;
  domicilio: string;
  localidad: string;
  email: string;
  telefono: string;
  fechaNacimiento: ISODateString;
  fotoUrl: string | null;
  tipoSocio: TipoSocio;
  estado: EstadoSocio;
  vigencia: Vigencia;
  /** Calculado por el backend a partir de `vigencia` y la fecha actual. */
  estadoCuota: EstadoCuota;
  /** Código aleatorio del carnet. `null` hasta que el administrador lo genera. */
  codigoQr: string | null;
  /**
   * Enlace exacto que lleva adentro el QR, armado por el backend.
   *
   * No se rearma acá con `window.location.origin`: un administrador que entre
   * al panel por la IP de la red repartiría carnets con una dirección que no
   * le sirve a nadie más. Se dibuja tal como llega.
   */
  carnetUrl: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Datos que el socio ve en su carnet digital (HU-04). */
export type CarnetSocio = Pick<
  Socio,
  | "id"
  | "numeroSocio"
  | "nombre"
  | "apellido"
  | "dni"
  | "fotoUrl"
  | "tipoSocio"
  | "vigencia"
  | "estadoCuota"
  | "codigoQr"
  | "carnetUrl"
>;

/**
 * Resultado de generar los códigos de carnet (`POST /socios/generar-qr`).
 *
 * `yaTenian` no es un detalle: el botón saltea a los socios que ya tienen
 * código, para no romper los carnets ya repartidos por WhatsApp.
 */
export interface GenerarQrResponse {
  generados: number;
  yaTenian: number;
  total: number;
}

/** HU-08: payload del formulario de alta. Se envía como multipart/form-data por la foto. */
interface DatosDelAlta {
  nombre: string;
  apellido: string;
  dni: string;
  domicilio: string;
  localidad: string;
  email: string;
  telefono: string;
  fechaNacimiento: ISODateString;
  tipoSocioId: string;
  foto: File | null;
}

/**
 * Cobro que se registra junto con el alta, para quien paga en el club.
 * El monto no viaja: lo calcula el backend con la cuota de la categoría.
 */
export interface PagoDelAlta {
  cuentaId: string;
  medioPago: MedioPagoManual;
  meses?: number;
  comprobante?: string;
  observaciones?: string;
}

/**
 * HU-08: alta manual. Lleva la vigencia **o** el cobro, nunca los dos.
 *
 * - Con `vigencia`: quien ya venía pagando. No se registra ningún cobro.
 * - Con `pago`: quien paga ahora en el club. La vigencia la calcula el
 *   backend desde hoy por los meses pagados, en la misma operación que el
 *   cobro. Mandar las dos cosas le sumaría al socio meses que no pagó.
 */
export type CreateSocioInput = DatosDelAlta &
  ({ vigencia: Vigencia; pago?: never } | { pago: PagoDelAlta; vigencia?: never });

/**
 * Edición de la ficha desde el panel (`PATCH /socios/:id`). Todos los campos
 * son opcionales y se puede mandar uno solo.
 */
export type UpdateSocioInput = Partial<DatosDelAlta> & {
  estado?: EstadoSocio;
  /** Acepta un solo extremo: el que no se manda se conserva como estaba. */
  vigencia?: Partial<Vigencia>;
};

/** HU-08: el backend genera la contraseña inicial y la devuelve una única vez. */
export interface CreateSocioResponse {
  socio: Socio;
  passwordInicial: string;
  /**
   * Si salió el correo de bienvenida con el enlace para elegir la contraseña.
   * La clave inicial se muestra igual en los dos casos: es el respaldo por si
   * el correo no llega.
   */
  correoBienvenidaEnviado: boolean;
}

/** HU-08: filtros y búsqueda del listado de socios. */
export interface SocioFilters extends PaginationParams {
  /** Busca por DNI o nombre/apellido. */
  search?: string;
  estado?: EstadoSocio;
  estadoCuota?: EstadoCuota;
  tipoSocioId?: string;
  sortBy?: "apellido" | "numeroSocio" | "vigenciaHasta" | "createdAt";
  sortOrder?: "asc" | "desc";
}

/**
 * Lo único que el socio puede editar de su propia ficha.
 * Nombre, apellido, DNI y email lo identifican y solo los cambia la
 * administración (`PATCH /socios/:id`), igual que categoría, vigencia y estado.
 */
export interface UpdateMiPerfilInput {
  telefono?: string;
  domicilio?: string;
  localidad?: string;
  foto?: File;
}
