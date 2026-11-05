import type { VentasTienda } from "@/types/tienda";

/**
 * Planilla del dashboard: un CSV que Excel abre directo. Va con BOM para las
 * tildes y con punto y coma, que es el separador de Excel en español.
 */
function celda(valor: string | number): string {
  const texto = String(valor);
  return /[;"\n]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto;
}

export function planillaVentas({ ventasPorMes, porCategoria, masVendidos }: VentasTienda): Blob {
  const filas: (string | number)[][] = [
    ["Ventas por mes"],
    ["Mes", "Pedidos", "Total"],
    ...ventasPorMes.map((mes) => [mes.mes, mes.cantidad, mes.total]),
    [],
    ["Por categoría (últimos 6 meses)"],
    ["Categoría", "Unidades", "Total"],
    ...porCategoria.map((categoria) => [categoria.nombre, categoria.cantidad, categoria.total]),
    [],
    ["Los más vendidos (últimos 6 meses)"],
    ["Producto", "Unidades", "Total"],
    ...masVendidos.map((producto) => [producto.productoNombre, producto.unidades, producto.total]),
  ];

  const csv = filas.map((fila) => fila.map(celda).join(";")).join("\r\n");
  return new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
}
