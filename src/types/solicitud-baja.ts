import type { ISODateString, PaginationParams } from "./api";
import type { Socio } from "./socio";

/**
 * Pedido de baja hecho por un socio desde su sección, a la espera de que la
 * administración lo resuelva.
 *
 * Aprobarlo deja al socio en estado `BAJA`; rechazarlo borra el pedido y el
 * socio sigue activo. En ningún caso se pierden sus datos ni sus pagos: la
 * baja es un estado, no un borrado. No confundir con `DELETE /socios/:id`,
 * que es otra cosa.
 */
export interface SolicitudBaja {
  id: string;
  /** Ficha completa, para dibujar la tarjeta sin pedir nada más. */
  socio: Socio;
  /** Opcional: no se le exige a nadie explicar por qué se va. */
  motivo: string | null;
  createdAt: ISODateString;
}

/** Lo que ve el propio socio sobre su pedido. */
export interface MiSolicitudBaja {
  pendiente: boolean;
  /** `null` cuando no hay ningún pedido en curso. */
  solicitadaEn: ISODateString | null;
  motivo: string | null;
}

export interface CreateSolicitudBajaInput {
  motivo?: string;
}

export type SolicitudBajaFilters = PaginationParams;
