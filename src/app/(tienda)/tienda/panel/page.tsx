import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarrasDesglose } from "@/features/admin/components/barras-desglose";
import { GraficoIngresosMes } from "@/features/admin/components/grafico-ingresos-mes";
import { PRODUCTOS, VENTAS_POR_CATEGORIA, VENTAS_POR_MES, stockTotal } from "@/features/tienda/maqueta/datos";
import { formatearMonto } from "@/lib/formato";

export const metadata: Metadata = { title: "Ventas" };

function Numero({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-sm text-muted-foreground">{etiqueta}</p>
        <p className="mt-1 font-heading text-3xl font-bold tabular-nums md:text-4xl">{valor}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{detalle}</p>
      </CardContent>
    </Card>
  );
}

const MAS_VENDIDOS = [
  { nombre: "Camiseta titular 2026", unidades: 26, total: 1190000 },
  { nombre: "Buzo El Ventarrón", unidades: 12, total: 632000 },
  { nombre: "Mate de calabaza con escudo", unidades: 11, total: 220000 },
  { nombre: "Camiseta alternativa 2026", unidades: 9, total: 418000 },
  { nombre: "Bufanda rayada", unidades: 8, total: 112000 },
];

/**
 * Dashboard de ventas. Separado de las cobranzas de cuotas: otra plata, otro
 * panel. Reusa los mismos gráficos para que se lea igual.
 */
export default function PanelVentasPage() {
  const delMes = VENTAS_POR_MES.at(-1)!;
  const mesAnterior = VENTAS_POR_MES.at(-2)!;
  const pocoStock = PRODUCTOS.filter((producto) => {
    const stock = stockTotal(producto);
    return stock > 0 && stock <= 5;
  });
  const agotados = PRODUCTOS.filter((producto) => stockTotal(producto) === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Ventas</h1>
        <p className="text-sm text-muted-foreground">
          Lo que vendió la tienda. Solo cuentan los pedidos pagados; los cancelados no suman.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Numero etiqueta="Vendido en noviembre" valor={formatearMonto(delMes.total)} detalle={`${delMes.cantidad} pedidos en lo que va del mes`} />
        <Numero etiqueta="Octubre" valor={formatearMonto(mesAnterior.total)} detalle={`${mesAnterior.cantidad} pedidos`} />
        <Numero etiqueta="Ticket promedio" valor={formatearMonto(Math.round(mesAnterior.total / mesAnterior.cantidad))} detalle="Por pedido, en octubre" />
        <Numero etiqueta="A preparar" valor="2" detalle="Pedidos pagados que esperan" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Ventas por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficoIngresosMes datos={VENTAS_POR_MES} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <BarrasDesglose datos={VENTAS_POR_CATEGORIA} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Los más vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="divide-y text-sm">
              {MAS_VENDIDOS.map((producto, indice) => (
                <li key={producto.nombre} className="flex items-center gap-3 py-2.5">
                  <span className="w-5 text-muted-foreground tabular-nums">{indice + 1}</span>
                  <span className="flex-1 font-medium">{producto.nombre}</span>
                  <span className="text-muted-foreground tabular-nums">{producto.unidades} u.</span>
                  <span className="w-24 text-right tabular-nums">{formatearMonto(producto.total)}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Stock para reponer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">Sin stock</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {agotados.map((producto) => (
                <li key={producto.slug}>{producto.nombre}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Quedan pocas (5 o menos)</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {pocoStock.map((producto) => (
                <li key={producto.slug}>
                  {producto.nombre} · {stockTotal(producto)}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
