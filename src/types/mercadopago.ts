/**
 * Estado de un intento de pago con Mercado Pago, tal como lo resuelve el
 * backend (`GET /pagos/mercadopago/estado/:ref`).
 *
 * - `APROBADO`: en un alta garantiza que la cuenta ya existe y que salió el
 *   correo para elegir la contraseña; en una cuota, que la vigencia ya se
 *   extendió.
 * - `PENDIENTE`: Mercado Pago todavía no confirmó. Sin efectivo, dura lo que
 *   tarda en llegar la confirmación.
 * - `RECHAZADO`: no se cobró. En un alta, además, no quedó ningún dato.
 * - `EN_REVISION`: solo en un alta. Se cobró, pero la cuenta no se pudo crear
 *   y el club la revisa a mano.
 */
export const ESTADOS_PAGO_MP = ["APROBADO", "PENDIENTE", "RECHAZADO", "EN_REVISION"] as const;
export type EstadoPagoMp = (typeof ESTADOS_PAGO_MP)[number];

/** Qué se pagó: la cuota de un socio o el alta desde "Hacete socio". */
export const TIPOS_PAGO_MP = ["CUOTA", "ALTA"] as const;
export type TipoPagoMp = (typeof TIPOS_PAGO_MP)[number];

/** Público y sin datos personales: la persona que vuelve de un alta no tiene sesión. */
export interface EstadoPagoMpResponse {
  estado: EstadoPagoMp;
  tipo: TipoPagoMp;
}

/** Meses que se pueden pagar de una vez desde el perfil. */
export const MESES_PAGO_ONLINE = { min: 1, max: 12 } as const;

/** Lo que cuesta pagar `meses` cuotas. Lo calcula siempre el backend. */
export interface CotizacionCuota {
  meses: number;
  montoMensual: number;
  total: number;
}

export interface IniciarPagoCuotaInput {
  meses: number;
}

/**
 * El cobro creado en Mercado Pago. `total` vuelve para compararlo con el que
 * se le mostró al socio antes de mandarlo a pagar.
 */
export interface IniciarPagoCuotaResponse {
  initPoint: string;
  meses: number;
  total: number;
}
