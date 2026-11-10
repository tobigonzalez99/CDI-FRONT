"use client";

import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { fechaCierrePreventa } from "@/features/tienda/components/preventa";
import { usePreventas } from "@/features/tienda/hooks/use-tienda-admin";
import { cn } from "@/lib/utils";

/** Qué encargar: lo pedido en cada preventa, por talle. */
export function PreventasAdmin() {
  const { data, isPending, isError, error, refetch } = usePreventas();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Preventas</h1>
        <p className="text-sm text-muted-foreground">
          Lo que hay que encargar de cada producto. No cuentan los pedidos cancelados ni los
          devueltos. Una preventa se abre desde la ficha del producto, y solo en los que tienen talles.
        </p>
      </div>

      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
        Lo pedido en preventa no descuenta stock. Cuando llegue la mercadería, lo encargado no se
        carga como stock: ya está vendido. Cargá solo lo que sobre.
      </p>

      {isPending ? (
        <Cargando etiqueta="Cargando las preventas…" />
      ) : isError ? (
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      ) : data.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">
          Todavía no hubo ninguna preventa.
        </p>
      ) : (
        <div className="space-y-4">
          {data.map((preventa) => (
            <article key={`${preventa.productoId}-${preventa.hasta}`} className="rounded-2xl border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-lg font-bold">
                      <Link href={`/tienda/panel/productos/${preventa.productoId}`} className="hover:underline">
                        {preventa.nombre}
                      </Link>
                    </h2>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        preventa.activa ? "bg-sky-100 text-sky-900" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {preventa.activa ? "Abierta" : "Cerrada"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {preventa.activa ? "Cierra" : "Cerró"} el {fechaCierrePreventa(preventa.hasta)}
                    {preventa.entrega && ` · ${preventa.entrega}`}
                  </p>
                </div>
                <Link
                  href={`/tienda/panel/pedidos?preventa=1`}
                  className="text-sm font-medium underline"
                >
                  Ver pedidos con preventa
                </Link>
              </div>

              {preventa.unidades === 0 ? (
                <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">Todavía no se pidió nada.</p>
              ) : (
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Talle</TableHead>
                      <TableHead className="text-right">Pedidas</TableHead>
                      <TableHead className="text-right">Ya pagadas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preventa.talles.map((fila) => (
                      <TableRow key={fila.talle}>
                        <TableCell className="font-medium">{fila.talle}</TableCell>
                        <TableCell className="text-right tabular-nums">{fila.unidades}</TableCell>
                        <TableCell className="text-right tabular-nums">{fila.unidadesPagadas}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{preventa.unidades}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {preventa.unidadesPagadas}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
