import type { ISODateString } from "./api";
import type { IngresosDelMes, MedioPago, MedioPagoManual, TotalPorClave } from "./pago";

/**
 * Tienda online: catálogo (tarea 1).
 *
 * La tienda pública nunca recibe el stock exacto: solo `disponibilidad`, por
 * producto y por talle. El número lo ve el panel.
 */
export const DISPONIBILIDADES = ["DISPONIBLE", "ULTIMAS_UNIDADES", "SIN_STOCK"] as const;
export type Disponibilidad = (typeof DISPONIBILIDADES)[number];

export interface CategoriaTienda {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
  activa: boolean;
}

/** URL absoluta, en WebP. La primera de un producto es la de la grilla. */
export interface ImagenProducto {
  id: string;
  url: string;
  ancho: number;
  alto: number;
}

export interface ProductoResumen {
  id: string;
  slug: string;
  nombre: string;
  categoria: { id: string; nombre: string; slug: string };
  /** Precio final, con impuestos. */
  precio: number;
  /**
   * Referencia para quien no inició sesión: el precio con el mayor descuento
   * entre las categorías de socio. `null` si ninguna tiene descuento. El
   * precio de cada socio sale de `/tienda/mi-descuento`.
   */
  precioSocio: number | null;
  descuentoSocio: number | null;
  imagen: ImagenProducto | null;
  destacado: boolean;
  /** Cargado en los últimos 30 días. */
  nuevo: boolean;
  /** `false` en vasos, mates y accesorios: se compran sin elegir talle. */
  tieneTalles: boolean;
  disponibilidad: Disponibilidad;
}

/** Un talle; sin talles hay una sola variante con `talle: null`. El `id` es lo que va al carrito. */
export interface VarianteProducto {
  id: string;
  talle: string | null;
  disponibilidad: Disponibilidad;
}

export interface ProductoDetalle extends ProductoResumen {
  /** Markdown, nunca HTML. */
  descripcion: string;
  imagenes: ImagenProducto[];
  variantes: VarianteProducto[];
}

export const ORDENES_CATALOGO = ["relevancia", "nuevos", "precio-asc", "precio-desc"] as const;
export type OrdenCatalogo = (typeof ORDENES_CATALOGO)[number];

export interface FiltrosCatalogo {
  page?: number;
  pageSize?: number;
  categoria?: string;
  talle?: string;
  precioMin?: number;
  precioMax?: number;
  buscar?: string;
  destacados?: boolean;
  orden?: OrdenCatalogo;
}

/** Textos libres que carga el club; vacíos hasta que los complete. */
export interface ConfiguracionTiendaPublica {
  retiroLugar: string;
  retiroDireccion: string;
  retiroHorarios: string;
}

export const MOTIVOS_DESCUENTO = [
  "APLICA",
  "CATEGORIA_SIN_DESCUENTO",
  "CUOTA_VENCIDA",
  "SOCIO_DE_BAJA",
] as const;
export type MotivoDescuento = (typeof MOTIVOS_DESCUENTO)[number];

export interface MiDescuento {
  porcentaje: number;
  motivo: MotivoDescuento;
  /** Nombre de la categoría de socio. */
  categoria: string;
}

// ------------------------------------------------------------------ Panel

export interface VarianteAdmin {
  id: string;
  talle: string | null;
  orden: number;
  stock: number;
  activa: boolean;
  disponibilidad: Disponibilidad;
}

export interface ProductoAdmin {
  id: string;
  slug: string;
  nombre: string;
  categoria: { id: string; nombre: string; slug: string };
  descripcion: string;
  precio: number;
  destacado: boolean;
  activo: boolean;
  tieneTalles: boolean;
  stockTotal: number;
  stockBajo: boolean;
  variantes: VarianteAdmin[];
  imagenes: ImagenProducto[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface FiltrosProductosAdmin {
  page?: number;
  pageSize?: number;
  buscar?: string;
  categoriaId?: string;
  activo?: boolean;
  stockBajo?: boolean;
}

export interface CrearProductoInput {
  categoriaId: string;
  nombre: string;
  slug?: string;
  descripcion?: string;
  precio: number;
  destacado?: boolean;
  activo?: boolean;
  /** Con talles, una fila por talle; sin talles, una sola fila sin `talle`. */
  variantes: { talle?: string; stock: number }[];
}

export type ActualizarProductoInput = Partial<Omit<CrearProductoInput, "variantes">>;

export const MOTIVOS_MOVIMIENTO = ["INGRESO", "AJUSTE", "VENTA", "CANCELACION"] as const;
export type MotivoMovimiento = (typeof MOTIVOS_MOVIMIENTO)[number];

/** Los que se cargan a mano desde el panel; VENTA y CANCELACION los pone el sistema. */
export const MOTIVOS_MOVIMIENTO_MANUAL = ["INGRESO", "AJUSTE"] as const;
export type MotivoMovimientoManual = (typeof MOTIVOS_MOVIMIENTO_MANUAL)[number];

export const ETIQUETAS_MOTIVO_MOVIMIENTO: Record<MotivoMovimiento, string> = {
  INGRESO: "Ingreso",
  AJUSTE: "Ajuste",
  VENTA: "Venta",
  CANCELACION: "Cancelación",
};

export interface MovimientoStock {
  id: string;
  varianteId: string;
  talle: string | null;
  /** Positiva entra, negativa sale. */
  cantidad: number;
  stockResultante: number;
  motivo: MotivoMovimiento;
  observaciones: string | null;
  registradoPor: string;
  createdAt: ISODateString;
}

export interface MovimientoStockInput {
  cantidad: number;
  motivo: MotivoMovimientoManual;
  observaciones?: string;
}

export interface ConfiguracionTienda extends ConfiguracionTiendaPublica {
  umbralUltimasUnidades: number;
  /** Cuántas horas se reserva el stock de un pedido sin pagar (1 a 720). */
  horasReserva: number;
  updatedAt: ISODateString;
}

export interface OperadorTienda {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  activo: boolean;
  mustChangePassword: boolean;
  lastLoginAt: ISODateString | null;
  createdAt: ISODateString;
}

/** La contraseña inicial se devuelve una sola vez. */
export interface OperadorConPassword {
  operador: OperadorTienda;
  passwordInicial: string;
}

// ------------------------------------------------------ Carrito y pedido

/**
 * Lo que la API dice de una línea del carrito al cotizar. Una línea con
 * problema no hace fallar la cotización: viene marcada y `valida` es false.
 */
export type ProblemaLinea = "NO_DISPONIBLE" | "STOCK_INSUFICIENTE";

export interface LineaCotizada {
  varianteId: string;
  productoSlug: string | null;
  productoNombre: string;
  talle: string | null;
  imagenUrl: string | null;
  cantidad: number;
  /** Precio de lista. */
  precioUnitario: number;
  /** Con el descuento de socio, si corresponde. */
  precioFinal: number;
  subtotal: number;
  problema: ProblemaLinea | null;
  /** Solo con STOCK_INSUFICIENTE. */
  disponibles: number | null;
}

export interface Cotizacion {
  lineas: LineaCotizada[];
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  total: number;
  valida: boolean;
  /** Para un socio con sesión; `null` para un invitado. */
  descuentoSocio: { porcentaje: number; motivo: MotivoDescuento } | null;
}

export interface ItemCarritoInput {
  varianteId: string;
  cantidad: number;
}

/** Topes de la API: 10 unidades de cada producto y 20 productos distintos. */
export const MAXIMO_UNIDADES_POR_PRODUCTO = 10;
export const MAXIMO_PRODUCTOS_DISTINTOS = 20;

export const ESTADOS_PEDIDO = ["PENDIENTE_PAGO", "PAGADO", "PREPARADO", "RETIRADO", "CANCELADO"] as const;
export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];

export const ETIQUETAS_ESTADO_PEDIDO: Record<EstadoPedido, string> = {
  PENDIENTE_PAGO: "Reservado · se paga al retirar",
  PAGADO: "Pagado",
  PREPARADO: "Listo para retirar",
  RETIRADO: "Retirado",
  CANCELADO: "Cancelado",
};

export interface ItemPedido {
  productoNombre: string;
  productoSlug: string | null;
  talle: string | null;
  imagenUrl: string | null;
  cantidad: number;
  precioUnitario: number;
  precioFinal: number;
  subtotal: number;
}

/** Un pedido con sus precios congelados del momento de la compra. No trae el DNI. */
export interface Pedido {
  /** Correlativo, como "T-0042": no alcanza para ver el pedido. */
  codigo: string;
  estado: EstadoPedido;
  createdAt: ISODateString;
  /** Hasta cuándo se reserva el stock mientras está PENDIENTE_PAGO. */
  venceEn: ISODateString | null;
  comprador: { nombre: string; apellido: string; email: string; telefono: string };
  retiro: { lugar: string; direccion: string; horarios: string; retiraOtraPersona: string | null };
  notas: string | null;
  items: ItemPedido[];
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  total: number;
  motivoCancelacion: string | null;
  historial: { estado: EstadoPedido; fecha: ISODateString }[];
}

/** Un pedido en el panel: suma el DNI y quién hizo cada cambio. */
export interface PedidoAdmin extends Omit<Pedido, "comprador" | "retiro" | "historial"> {
  comprador: Pedido["comprador"] & { dni: string };
  esSocio: boolean;
  /** Se carga al cobrarlo; `null` hasta entonces. */
  medioPago: MedioPago | null;
  retiro: Pedido["retiro"] & { retiraOtraPersonaDni: string | null };
  historial: (Pedido["historial"][number] & { registradoPor: string | null })[];
}

export interface CambioEstadoPedido {
  estado: EstadoPedido;
  /** Obligatorio al cancelar: lo ve el comprador. */
  motivo?: string;
  /** Obligatorio al pasar a PAGADO. */
  medioPago?: MedioPagoManual;
}

export interface FiltrosPedidosAdmin {
  page: number;
  pageSize: number;
  estado?: EstadoPedido;
  /** Código, nombre, apellido o DNI del comprador. */
  buscar?: string;
}

/** Dashboard de ventas: últimos 6 meses. Solo cuentan los pedidos pagados. */
export interface VentasTienda {
  /** Del más viejo al mes actual, con los meses sin ventas en cero. */
  ventasPorMes: IngresosDelMes[];
  porCategoria: TotalPorClave[];
  masVendidos: { productoNombre: string; unidades: number; total: number }[];
  /** De mayor a menor. `medio` es `null` en lo cobrado antes de guardarlo. */
  porMedio: { medio: MedioPago | null; total: number; cantidad: number }[];
  pendientes: { porCobrar: number; aPreparar: number; paraRetirar: number };
}

export interface CompradorInput {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
}

export interface CrearPedidoInput {
  items: ItemCarritoInput[];
  /** Solo el invitado: el socio con sesión compra con los datos de su ficha. */
  comprador?: CompradorInput;
  /** Solo si retira otra persona. */
  retira?: { nombre: string; dni: string };
  notas?: string;
}

export interface CrearPedidoResponse {
  pedido: Pedido;
  /** Para ver el pedido sin sesión. Nunca va en la URL de la tienda. */
  seguimientoToken: string;
}
