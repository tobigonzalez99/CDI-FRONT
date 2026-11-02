import type { ISODateString, PaginationParams } from "./api";
import type { TipoSocio } from "./socio";

/**
 * Solicitud de alta enviada desde el sitio público ("Hacete socio").
 *
 * Solo existen las pendientes: al aprobarla se convierte en socio y al
 * rechazarla se borran sus datos, de modo que la persona pueda volver a
 * postularse sin que su DNI o su correo queden ocupados.
 */
export interface SolicitudSocio {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  domicilio: string;
  localidad: string;
  telefono: string;
  fechaNacimiento: ISODateString;
  /** Siempre presente: la foto es obligatoria. */
  fotoUrl: string;
  /** Categoría solicitada; el admin puede cambiarla al aprobar. */
  tipoSocio: TipoSocio;
  comentario: string | null;
  /** Cuándo se envió, para ordenar y mostrar la antigüedad del pedido. */
  createdAt: ISODateString;
  estado: EstadoSolicitud;
  /**
   * Con fecha: la persona está pagando en Mercado Pago y, si no paga, la
   * solicitud vence y se borra ahí. En `null`: es anterior al pago online,
   * no vence y se resuelve a mano como siempre.
   */
  venceEn: ISODateString | null;
  /** Por qué quedó en revisión. Solo con `REQUIERE_REVISION`. */
  motivoRevision: string | null;
}

/**
 * - `PENDIENTE_PAGO`: todavía no se pagó (o es anterior al pago online).
 * - `REQUIERE_REVISION`: se pagó, pero el alta no se pudo hacer sola y la
 *   tiene que resolver el administrador.
 */
export const ESTADOS_SOLICITUD = ["PENDIENTE_PAGO", "REQUIERE_REVISION"] as const;
export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

/**
 * Formulario público. **Todos los campos son obligatorios salvo `comentario`.**
 * Se envía como `multipart/form-data` por la foto.
 */
export interface CreateSolicitudInput {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  domicilio: string;
  localidad: string;
  telefono: string;
  fechaNacimiento: ISODateString;
  tipoSocioId: string;
  foto: File;
  comentario?: string;
}

/**
 * Respuesta del envío: el cobro del primer mes en Mercado Pago. La persona
 * queda dada de alta sola cuando el pago se aprueba.
 */
export interface SolicitudEnviadaResponse {
  id: string;
  initPoint: string;
}

/** Ajustes opcionales del administrador al dar de alta. */
export interface AprobarSolicitudInput {
  tipoSocioId?: string;
  /** Por defecto, un mes desde hoy. */
  vigencia?: { desde: ISODateString; hasta: ISODateString };
}

export type SolicitudFilters = PaginationParams;

/**
 * Campos que identifican a una única persona y no pueden repetirse, ni entre
 * socios ni entre solicitudes pendientes. El backend los informa en
 * `fieldErrors` con un 409, así se marcan en el campo correspondiente.
 */
export const CAMPOS_UNICOS_SOCIO = ["dni", "email"] as const;
export type CampoUnicoSocio = (typeof CAMPOS_UNICOS_SOCIO)[number];
