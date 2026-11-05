/**
 * Datos fijos del dashboard de ventas, que todavía es maqueta (tarea 4). Los
 * montos son inventados.
 */

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
