/**
 * Datos fijos de la maqueta de la tienda.
 *
 * Sirven solo para la propuesta visual: no hay API todavía. Cuando llegue el
 * contrato del catálogo, estos tipos se reemplazan por los de la API y las
 * pantallas pasan a leer de ahí. Los precios son inventados.
 */

export type Ilustracion =
  | "camiseta-titular"
  | "camiseta-alternativa"
  | "camiseta-retro"
  | "buzo"
  | "campera"
  | "short"
  | "remera"
  | "gorra"
  | "bufanda"
  | "mate"
  | "vaso"
  | "termo"
  | "llavero";

export interface CategoriaTienda {
  slug: string;
  nombre: string;
  ilustracion: Ilustracion;
}

export interface TalleProducto {
  talle: string;
  stock: number;
}

export interface ProductoTienda {
  slug: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  /** Precio final, con impuestos. */
  precio: number;
  /** Fotos de la galería: en la maqueta, la misma ilustración en otro fondo. */
  ilustraciones: Ilustracion[];
  /** Vacío en los productos sin talle (vasos, mates): se compran directo. */
  talles: TalleProducto[];
  /** Solo para los que no tienen talle. */
  stock?: number;
  destacado?: boolean;
  nuevo?: boolean;
}

export const CATEGORIAS: CategoriaTienda[] = [
  { slug: "camisetas", nombre: "Camisetas", ilustracion: "camiseta-titular" },
  { slug: "indumentaria", nombre: "Indumentaria", ilustracion: "buzo" },
  { slug: "mates-y-vasos", nombre: "Mates y vasos", ilustracion: "mate" },
  { slug: "accesorios", nombre: "Accesorios", ilustracion: "bufanda" },
];

/** Descuento de ejemplo para el Socio Activo; lo configura el admin por categoría. */
export const DESCUENTO_SOCIO = 0.15;

/** Debajo de esta cantidad se avisa "Últimas unidades". */
export const POCAS_UNIDADES = 3;

const TALLES_ADULTO = ["S", "M", "L", "XL", "XXL"];

function talles(stock: number[], nombres = TALLES_ADULTO): TalleProducto[] {
  return nombres.map((talle, indice) => ({ talle, stock: stock[indice] ?? 0 }));
}

export const PRODUCTOS: ProductoTienda[] = [
  {
    slug: "camiseta-titular-2026",
    nombre: "Camiseta titular 2026",
    categoria: "camisetas",
    descripcion:
      "La camiseta oficial de la temporada, con las rayas rojas y negras de siempre y el escudo bordado. Tela liviana que respira.",
    precio: 54000,
    ilustraciones: ["camiseta-titular", "camiseta-titular", "camiseta-titular"],
    talles: talles([4, 12, 9, 2, 0]),
    destacado: true,
    nuevo: true,
  },
  {
    slug: "camiseta-alternativa-2026",
    nombre: "Camiseta alternativa 2026",
    categoria: "camisetas",
    descripcion: "La blanca de visitante, con detalles en rojo y negro.",
    precio: 54000,
    ilustraciones: ["camiseta-alternativa", "camiseta-alternativa"],
    talles: talles([3, 6, 0, 1, 2]),
    destacado: true,
    nuevo: true,
  },
  {
    slug: "camiseta-retro-1911",
    nombre: "Camiseta retro 1911",
    categoria: "camisetas",
    descripcion: "Homenaje a la primera camiseta del club, con cuello a la vieja usanza.",
    precio: 48000,
    ilustraciones: ["camiseta-retro", "camiseta-retro"],
    talles: talles([0, 0, 0, 0, 0]),
  },
  {
    slug: "buzo-ventarron",
    nombre: "Buzo El Ventarrón",
    categoria: "indumentaria",
    descripcion: "Buzo negro con capucha y el escudo al frente. Frisa por dentro.",
    precio: 62000,
    ilustraciones: ["buzo", "buzo"],
    talles: talles([2, 5, 5, 3, 1]),
    destacado: true,
  },
  {
    slug: "campera-rompeviento",
    nombre: "Campera rompeviento",
    categoria: "indumentaria",
    descripcion: "Liviana, con cierre completo y capucha que se guarda en el cuello.",
    precio: 71000,
    ilustraciones: ["campera", "campera"],
    talles: talles([1, 2, 0, 2, 0]),
    nuevo: true,
  },
  {
    slug: "remera-urbana",
    nombre: "Remera urbana CDI",
    categoria: "indumentaria",
    descripcion: "Remera de algodón negra con el escudo chico en el pecho.",
    precio: 26000,
    ilustraciones: ["remera"],
    talles: talles([8, 10, 10, 6, 3]),
  },
  {
    slug: "short-titular",
    nombre: "Short titular",
    categoria: "indumentaria",
    descripcion: "El short negro de juego, con el número del escudo al costado.",
    precio: 24000,
    ilustraciones: ["short"],
    talles: talles([5, 7, 4, 0, 0]),
  },
  {
    slug: "mate-escudo",
    nombre: "Mate de calabaza con escudo",
    categoria: "mates-y-vasos",
    descripcion: "Calabaza forrada en cuero negro con el escudo grabado. Incluye bombilla.",
    precio: 22000,
    ilustraciones: ["mate", "mate"],
    talles: [],
    stock: 14,
    destacado: true,
  },
  {
    slug: "vaso-termico",
    nombre: "Vaso térmico 500 ml",
    categoria: "mates-y-vasos",
    descripcion: "Acero inoxidable, mantiene frío o caliente. Escudo grabado.",
    precio: 19000,
    ilustraciones: ["vaso"],
    talles: [],
    stock: 2,
    nuevo: true,
  },
  {
    slug: "termo-1-litro",
    nombre: "Termo 1 litro",
    categoria: "mates-y-vasos",
    descripcion: "Termo de acero con pico cebador y el escudo del club.",
    precio: 46000,
    ilustraciones: ["termo"],
    talles: [],
    stock: 0,
  },
  {
    slug: "bufanda-rayada",
    nombre: "Bufanda rayada",
    categoria: "accesorios",
    descripcion: "Bufanda de hinchada, roja y negra, con flecos.",
    precio: 15000,
    ilustraciones: ["bufanda"],
    talles: [],
    stock: 20,
  },
  {
    slug: "gorra-escudo",
    nombre: "Gorra con escudo",
    categoria: "accesorios",
    descripcion: "Gorra negra de seis paneles con el escudo bordado.",
    precio: 18000,
    ilustraciones: ["gorra"],
    talles: [],
    stock: 9,
  },
  {
    slug: "llavero-escudo",
    nombre: "Llavero escudo",
    categoria: "accesorios",
    descripcion: "Llavero de metal esmaltado con el escudo.",
    precio: 6000,
    ilustraciones: ["llavero"],
    talles: [],
    stock: 30,
  },
];

export function productoPorSlug(slug: string): ProductoTienda | undefined {
  return PRODUCTOS.find((producto) => producto.slug === slug);
}

export function categoriaPorSlug(slug: string): CategoriaTienda | undefined {
  return CATEGORIAS.find((categoria) => categoria.slug === slug);
}

export function stockTotal(producto: ProductoTienda): number {
  return producto.talles.length > 0
    ? producto.talles.reduce((suma, talle) => suma + talle.stock, 0)
    : (producto.stock ?? 0);
}

export function precioSocio(precio: number): number {
  return Math.round((precio * (1 - DESCUENTO_SOCIO)) / 100) * 100;
}

/** Dónde se retira, como lo cargaría el admin desde el panel. */
export const RETIRO = {
  lugar: "Sede social del club",
  direccion: "España N° 1, Adolfo Gonzáles Chaves",
  horarios: "Lunes a viernes de 17 a 21 h · Sábados de 9 a 13 h",
};

/** Datos del vendedor, obligatorios al pie de la tienda. CUIT de ejemplo. */
export const VENDEDOR = {
  razonSocial: "Club Deportivo Independencia",
  cuit: "30-00000000-0",
  domicilio: "España N° 1, 7513 Adolfo Gonzáles Chaves, Buenos Aires",
};

// ---------------------------------------------------------------- Panel

export type EstadoPedido = "PENDIENTE_PAGO" | "PAGADO" | "PREPARADO" | "RETIRADO" | "CANCELADO";

export const ETIQUETAS_ESTADO_PEDIDO: Record<EstadoPedido, string> = {
  PENDIENTE_PAGO: "Esperando el pago",
  PAGADO: "Pagado · a preparar",
  PREPARADO: "Listo para retirar",
  RETIRADO: "Retirado",
  CANCELADO: "Cancelado",
};

export interface PedidoTienda {
  codigo: string;
  fecha: string;
  comprador: string;
  esSocio: boolean;
  items: { nombre: string; talle?: string; cantidad: number; precio: number }[];
  total: number;
  estado: EstadoPedido;
}

export const PEDIDOS: PedidoTienda[] = [
  {
    codigo: "T-0142",
    fecha: "2026-11-04T10:12:00",
    comprador: "Lucía Fernández",
    esSocio: true,
    items: [{ nombre: "Camiseta titular 2026", talle: "M", cantidad: 1, precio: 45900 }],
    total: 45900,
    estado: "PAGADO",
  },
  {
    codigo: "T-0141",
    fecha: "2026-11-03T21:40:00",
    comprador: "Marcos Álvarez",
    esSocio: false,
    items: [
      { nombre: "Mate de calabaza con escudo", cantidad: 1, precio: 22000 },
      { nombre: "Bufanda rayada", cantidad: 2, precio: 15000 },
    ],
    total: 52000,
    estado: "PENDIENTE_PAGO",
  },
  {
    codigo: "T-0140",
    fecha: "2026-11-03T18:05:00",
    comprador: "Diego Ramírez",
    esSocio: true,
    items: [{ nombre: "Buzo El Ventarrón", talle: "L", cantidad: 1, precio: 52700 }],
    total: 52700,
    estado: "PREPARADO",
  },
  {
    codigo: "T-0139",
    fecha: "2026-11-02T12:30:00",
    comprador: "Valentina Ibáñez",
    esSocio: true,
    items: [
      { nombre: "Camiseta alternativa 2026", talle: "S", cantidad: 1, precio: 45900 },
      { nombre: "Gorra con escudo", cantidad: 1, precio: 15300 },
    ],
    total: 61200,
    estado: "RETIRADO",
  },
  {
    codigo: "T-0138",
    fecha: "2026-11-01T09:15:00",
    comprador: "Sofía Herrera",
    esSocio: false,
    items: [{ nombre: "Vaso térmico 500 ml", cantidad: 1, precio: 19000 }],
    total: 19000,
    estado: "CANCELADO",
  },
];

/** Ventas por mes, con la forma de `IngresosDelMes` para reusar el gráfico de cobranzas. */
export const VENTAS_POR_MES = [
  { mes: "2026-06", total: 412000, cantidad: 11 },
  { mes: "2026-07", total: 538000, cantidad: 15 },
  { mes: "2026-08", total: 361000, cantidad: 9 },
  { mes: "2026-09", total: 690000, cantidad: 19 },
  { mes: "2026-10", total: 1245000, cantidad: 31 },
  { mes: "2026-11", total: 230800, cantidad: 6 },
];

/** Con la forma de `TotalPorClave`, para reusar las barras de desglose. */
export const VENTAS_POR_CATEGORIA = [
  { clave: "camisetas", nombre: "Camisetas", total: 1820000, cantidad: 38 },
  { clave: "indumentaria", nombre: "Indumentaria", total: 980000, cantidad: 21 },
  { clave: "mates-y-vasos", nombre: "Mates y vasos", total: 410000, cantidad: 19 },
  { clave: "accesorios", nombre: "Accesorios", total: 266800, cantidad: 13 },
];
