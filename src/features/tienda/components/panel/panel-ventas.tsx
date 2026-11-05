"use client";

import Link from "next/link";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { BarrasDesglose } from "@/features/admin/components/barras-desglose";
import { GraficoIngresosMes } from "@/features/admin/components/grafico-ingresos-mes";
import {
  usePedidosAdmin,
  useProductosAdmin,
  useVentasTienda,
} from "@/features/tienda/hooks/use-tienda-admin";
import { nombreMedio, planillaVentas } from "@/features/tienda/lib/planilla-ventas";
import { formatearMes, formatearMonto } from "@/lib/formato";
import {
  ESTADOS_PEDIDO,
  ETIQUETAS_ESTADO_PEDIDO,
  type ProductoAdmin,
  type VentasTienda,
} from "@/types/tienda";

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

const nombreMes = (mes: string) => {
  const nombre = formatearMes(mes);
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
};

function descargarPlanilla(datos: VentasTienda) {
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(planillaVentas(datos));
  enlace.download = "ventas-tienda-cdi.csv";
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

function PedidosPorEstado() {
  const { data } = usePedidosAdmin({ page: 1, pageSize: 1 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">Pedidos por estado</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y text-sm">
          {ESTADOS_PEDIDO.map((estado) => (
            <li key={estado} className="flex justify-between gap-3 py-2.5">
              <span>{ETIQUETAS_ESTADO_PEDIDO[estado]}</span>
              <span className="font-medium tabular-nums">{data?.contadores[estado] ?? "—"}</span>
            </li>
          ))}
        </ul>
        <Link href="/tienda/panel/pedidos" className="mt-3 inline-block text-sm font-medium underline">
          Ver pedidos
        </Link>
      </CardContent>
    </Card>
  );
}

/** Lo que hay que reponer: un producto entra en la lista por un solo talle. */
function detalleStockBajo(producto: ProductoAdmin) {
  if (!producto.tieneTalles) return `${producto.stockTotal} en stock`;
  return producto.variantes
    .filter((variante) => variante.activa && variante.disponibilidad !== "DISPONIBLE")
    .map((variante) => `${variante.talle}: ${variante.stock}`)
    .join(" · ");
}

function StockBajo({ className }: { className?: string }) {
  const { data } = useProductosAdmin({ page: 1, pageSize: 5, activo: true, stockBajo: true });
  const productos = data?.data ?? [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-heading text-base">Stock bajo</CardTitle>
      </CardHeader>
      <CardContent>
        {data && productos.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Ningún producto publicado tiene el stock bajo.
          </p>
        ) : (
          <ul className="divide-y text-sm">
            {productos.map((producto) => (
              <li key={producto.id} className="flex justify-between gap-3 py-2.5">
                <Link href={`/tienda/panel/productos/${producto.id}`} className="min-w-0 font-medium hover:underline">
                  {producto.nombre}
                </Link>
                <span className="shrink-0 text-right text-muted-foreground tabular-nums">
                  {detalleStockBajo(producto)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {data && data.total > productos.length && (
          <p className="mt-3 text-sm text-muted-foreground">
            Y {data.total - productos.length} más en{" "}
            <Link href="/tienda/panel/productos" className="font-medium underline">
              Productos
            </Link>
            .
          </p>
        )}
      </CardContent>
    </Card>
  );
}

const pedidos = (cantidad: number) => `${cantidad} ${cantidad === 1 ? "pedido" : "pedidos"}`;

/**
 * Dashboard de ventas. Separado de las cobranzas de cuotas: otra plata, otro
 * panel. Reusa los mismos gráficos para que se lea igual.
 */
export function PanelVentas() {
  const { data, isPending, isError, error, refetch } = useVentasTienda();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            Lo que vendió la tienda. Solo cuentan los pedidos pagados; los cancelados no suman.
          </p>
        </div>
        <Button variant="outline" disabled={!data} onClick={() => data && descargarPlanilla(data)}>
          <Download aria-hidden />
          Descargar planilla
        </Button>
      </div>

      {isPending ? (
        <Cargando etiqueta="Cargando las ventas…" />
      ) : isError ? (
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      ) : (
        <Contenido datos={data} />
      )}
    </div>
  );
}

function Contenido({ datos }: { datos: VentasTienda }) {
  const { ventasPorMes, porCategoria, masVendidos, porMedio, pendientes } = datos;
  const delMes = ventasPorMes.at(-1);
  const mesAnterior = ventasPorMes.at(-2);
  const total = ventasPorMes.reduce((suma, mes) => suma + mes.total, 0);
  const cantidad = ventasPorMes.reduce((suma, mes) => suma + mes.cantidad, 0);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {delMes && (
          <Numero
            etiqueta={nombreMes(delMes.mes)}
            valor={formatearMonto(delMes.total)}
            detalle={`${pedidos(delMes.cantidad)} en lo que va del mes`}
          />
        )}
        {mesAnterior && (
          <Numero
            etiqueta={nombreMes(mesAnterior.mes)}
            valor={formatearMonto(mesAnterior.total)}
            detalle={pedidos(mesAnterior.cantidad)}
          />
        )}
        <Numero
          etiqueta="Ticket promedio"
          valor={cantidad > 0 ? formatearMonto(Math.round(total / cantidad)) : "—"}
          detalle="Por pedido, en los últimos 6 meses"
        />
        <Numero
          etiqueta="A preparar"
          valor={String(pendientes.aPreparar)}
          detalle={`${pendientes.porCobrar} por cobrar · ${pendientes.paraRetirar} para retirar`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Ventas por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <GraficoIngresosMes datos={ventasPorMes} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Por categoría · últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <BarrasDesglose
              datos={porCategoria}
              mensajeVacio="Todavía no hay ventas."
              unidad={["unidad", "unidades"]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Los más vendidos · últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            {masVendidos.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Todavía no hay ventas.</p>
            ) : (
              <ol className="divide-y text-sm">
                {masVendidos.map((producto, indice) => (
                  <li key={producto.productoNombre} className="flex items-center gap-3 py-2.5">
                    <span className="w-5 text-muted-foreground tabular-nums">{indice + 1}</span>
                    <span className="min-w-0 flex-1 font-medium">{producto.productoNombre}</span>
                    <span className="text-muted-foreground tabular-nums">{producto.unidades} u.</span>
                    <span className="w-24 text-right tabular-nums">{formatearMonto(producto.total)}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Por medio de pago · últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <BarrasDesglose
              datos={porMedio.map((fila) => ({
                clave: fila.medio ?? "sin-dato",
                nombre: nombreMedio(fila.medio),
                total: fila.total,
                cantidad: fila.cantidad,
              }))}
              mensajeVacio="Todavía no hay ventas."
              unidad={["pedido", "pedidos"]}
            />
          </CardContent>
        </Card>

        <PedidosPorEstado />
        <StockBajo className="lg:col-span-2" />
      </div>
    </>
  );
}
