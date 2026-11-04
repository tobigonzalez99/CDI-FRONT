import type { ISODateString } from "./api";

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
