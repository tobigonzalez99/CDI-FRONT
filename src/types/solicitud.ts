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
}

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

/** Respuesta del envío: no devuelve los datos, solo la confirmación. */
export interface SolicitudEnviadaResponse {
  id: string;
  mensaje: string;
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
