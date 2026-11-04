/**
 * Datos fijos de las pantallas que todavía son maqueta: pedidos (tarea 3) y
 * ventas (tarea 4). El catálogo ya sale de la API. Los montos son inventados.
 */

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
