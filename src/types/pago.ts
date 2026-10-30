import type { ISODateString, PaginationParams } from "./api";

export const TIPOS_CUENTA = ["EFECTIVO", "BANCARIA", "BILLETERA_VIRTUAL"] as const;
export type TipoCuenta = (typeof TIPOS_CUENTA)[number];

export const USOS_SISTEMA_CUENTA = ["EFECTIVO", "MERCADO_PAGO"] as const;
export type UsoSistemaCuenta = (typeof USOS_SISTEMA_CUENTA)[number];

/**
 * Dónde queda el dinero cobrado. Son dos y fijas —la caja de efectivo y la
 * de Mercado Pago—, marcadas con `usoSistema`. No se crean cuentas nuevas.
 */
export interface Cuenta {
  id: string;
  nombre: string;
  tipo: TipoCuenta;
  /** CBU, alias o CVU, solo como referencia. Nunca datos de tarjetas. */
  identificador: string | null;
  activa: boolean;
  /** Para qué la usa el sistema. Con esto se elige la cuenta de cada cobro. */
  usoSistema: UsoSistemaCuenta | null;
}

/** Lo único editable de una cuenta (`PATCH /cuentas/:id`). */
export interface UpdateCuentaInput {
  nombre?: string;
  identificador?: string | null;
}

/**
 * Medios con los que el club registra un cobro a mano desde el panel.
 *
 * `MERCADO_PAGO` no está a propósito: esos cobros los registra solo el
 * backend cuando Mercado Pago confirma el pago, y `POST /pagos` lo rechaza.
 */
export const MEDIOS_PAGO_MANUALES = ["EFECTIVO", "TRANSFERENCIA"] as const;
export type MedioPagoManual = (typeof MEDIOS_PAGO_MANUALES)[number];

/** Todos los medios que pueden aparecer en los listados de cobros. */
export const MEDIOS_PAGO = [...MEDIOS_PAGO_MANUALES, "MERCADO_PAGO"] as const;
export type MedioPago = (typeof MEDIOS_PAGO)[number];

/** Etiquetas para mostrar; el backend ya las usa en el resumen. */
export const ETIQUETAS_MEDIO_PAGO: Record<MedioPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  MERCADO_PAGO: "Mercado Pago (online)",
};

/**
 * A qué cuenta va cada medio. El backend aplica la misma regla y rechaza un
 * cobro que no la cumpla; acá sirve para no pedirle al admin un dato que se
 * deduce solo: el efectivo entra en la caja, y una transferencia o un pago
 * online entran en la cuenta de Mercado Pago del club.
 *
 * Es Mercado Pago y no el banco porque la pasarela de pagos solo puede
 * acreditar en una cuenta de Mercado Pago.
 */
export const CUENTA_DE_CADA_MEDIO: Record<MedioPago, UsoSistemaCuenta> = {
  EFECTIVO: "EFECTIVO",
  TRANSFERENCIA: "MERCADO_PAGO",
  MERCADO_PAGO: "MERCADO_PAGO",
};

/** La cuenta que corresponde a un medio, entre las que devuelve `/cuentas`. */
export function cuentaParaMedio(
  cuentas: readonly Cuenta[],
  medio: MedioPago,
): Cuenta | undefined {
  return cuentas.find((cuenta) => cuenta.usoSistema === CUENTA_DE_CADA_MEDIO[medio]);
}

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
  /** Solo los manuales: los cobros de Mercado Pago los registra el backend. */
  medioPago: MedioPagoManual;
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

/** Historial de un socio: el listado paginado más sus totales. */
export interface HistorialDeSocio {
  data: Pago[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** Suma de los pagos vigentes del socio. */
  totalCobrado: number;
  pagosVigentes: number;
}
