import type { ISODateString, PaginationParams } from "./api";

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
>;

/** HU-08: payload del formulario de alta. Se envía como multipart/form-data por la foto. */
export interface CreateSocioInput {
  nombre: string;
  apellido: string;
  dni: string;
  domicilio: string;
  localidad: string;
  email: string;
  telefono: string;
  fechaNacimiento: ISODateString;
  tipoSocioId: string;
  vigencia: Vigencia;
  foto: File | null;
}

export type UpdateSocioInput = Partial<CreateSocioInput> & {
  estado?: EstadoSocio;
};

/** HU-08: el backend genera la contraseña inicial y la devuelve una única vez. */
export interface CreateSocioResponse {
  socio: Socio;
  passwordInicial: string;
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
