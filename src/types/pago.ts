import type { ISODateString, PaginationParams } from "./api";

export const TIPOS_CUENTA = ["EFECTIVO", "BANCARIA", "BILLETERA_VIRTUAL"] as const;
export type TipoCuenta = (typeof TIPOS_CUENTA)[number];

/** Dónde queda el dinero cobrado. Las configura el club desde el panel. */
export interface Cuenta {
  id: string;
  nombre: string;
  tipo: TipoCuenta;
  /** CBU, alias o CVU, solo como referencia. Nunca datos de tarjetas. */
  identificador: string | null;
  activa: boolean;
}

export interface CreateCuentaInput {
  nombre: string;
  tipo: TipoCuenta;
  identificador?: string | null;
  activa?: boolean;
}

export type UpdateCuentaInput = Partial<CreateCuentaInput>;

export const MEDIOS_PAGO = ["EFECTIVO", "TRANSFERENCIA"] as const;
export type MedioPago = (typeof MEDIOS_PAGO)[number];

/** Datos del socio que acompañan al cobro en los listados. */
export interface SocioDelPago {
  id: string;
  numeroSocio: number;
  nombre: string;
  apellido: string;
  dni: string;
}

/**
 * Cobro de una cuota. Un pago no se edita ni se borra: se anula con motivo,
 * y queda visible con `anulado: true` para que el movimiento siga auditable.
 */
export interface Pago {
  id: string;
  socio: SocioDelPago;
  cuenta: Cuenta;
  monto: number;
  medioPago: MedioPago;
  fechaPago: ISODateString;
  /** Período de cuota que cubre este pago. */
  periodo: { desde: ISODateString; hasta: ISODateString };
  comprobante: string | null;
  observaciones: string | null;
  /** Nombre de quién registró el cobro. */
  registradoPor: string;
  createdAt: ISODateString;
  anulado: boolean;
  anuladoEn: ISODateString | null;
  anuladoPor: string | null;
  motivoAnulacion: string | null;
}

/**
 * Registrar un cobro extiende la vigencia del socio en la misma operación.
 * `fechaPago` por defecto es hoy; `meses` por defecto, 1.
 */
export interface CreatePagoInput {
  socioId: string;
  cuentaId: string;
  monto: number;
  medioPago: MedioPago;
  fechaPago?: ISODateString;
  meses?: number;
  comprobante?: string;
  observaciones?: string;
}

export interface AnularPagoInput {
  /** Obligatorio, de 5 a 300 caracteres: explica por qué deja de contar. */
  motivo: string;
}

export interface AnulacionResponse {
  id: string;
  /** true si la vigencia del socio se apoyaba en ese pago: conviene revisarla. */
  requiereRevisarVigencia: boolean;
}

/** Qué pagos incluir según su anulación. */
export const VISTAS_ANULACION = ["vigentes", "anulados", "todos"] as const;
export type VistaAnulacion = (typeof VISTAS_ANULACION)[number];

export interface PagoFilters extends PaginationParams {
  socioId?: string;
  cuentaId?: string;
  medioPago?: MedioPago;
  desde?: ISODateString;
  hasta?: ISODateString;
  /** Por defecto "vigentes": los anulados quedan fuera. */
  anulacion?: VistaAnulacion;
  sortBy?: "fechaPago" | "monto" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface IngresosDelMes {
  /** `YYYY-MM` */
  mes: string;
  total: number;
  cantidad: number;
}

export interface TotalPorClave {
  clave: string;
  nombre: string;
  total: number;
  cantidad: number;
}

/** Totales de cobranza. Los pagos anulados no suman. */
export interface ResumenCobranzas {
  totalAcumulado: number;
  cantidadPagos: number;
  ingresosPorMes: IngresosDelMes[];
  porMedioPago: TotalPorClave[];
  porCuenta: TotalPorClave[];
}
