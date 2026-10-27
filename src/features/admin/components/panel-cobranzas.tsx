"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { BarrasDesglose } from "@/features/admin/components/barras-desglose";
import { GraficoIngresosMes } from "@/features/admin/components/grafico-ingresos-mes";
import { useResumenCobranzas } from "@/features/pagos/hooks/use-pagos";
import { formatearMonto } from "@/lib/formato";

interface Rango {
  desde: string;
  hasta: string;
}

const RANGO_VACIO: Rango = { desde: "", hasta: "" };

/** HU-08: estadísticas de cobranza. Los totales excluyen los pagos anulados. */
export function PanelCobranzas() {
  const [rango, setRango] = useState<Rango>(RANGO_VACIO);
  const desdeId = useId();
  const hastaId = useId();

  const { data, isPending, isError, error, refetch } = useResumenCobranzas({
    desde: rango.desde || undefined,
    hasta: rango.hasta || undefined,
  });

  const hayFiltro = Boolean(rango.desde || rango.hasta);

  return (
    <div className="space-y-5">
      {/* Filtros, en una sola fila por encima de los gráficos. */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor={desdeId} className="text-xs">
            Desde
          </Label>
          <Input
            id={desdeId}
            type="date"
            className="w-auto"
            value={rango.desde}
            max={rango.hasta || undefined}
            onChange={(evento) =>
              setRango((actual) => ({ ...actual, desde: evento.target.value }))
            }
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor={hastaId} className="text-xs">
            Hasta
          </Label>
          <Input
            id={hastaId}
            type="date"
            className="w-auto"
            value={rango.hasta}
            min={rango.desde || undefined}
            onChange={(evento) =>
              setRango((actual) => ({ ...actual, hasta: evento.target.value }))
            }
          />
        </div>

        {hayFiltro && (
          <Button type="button" variant="ghost" onClick={() => setRango(RANGO_VACIO)}>
            Limpiar
          </Button>
        )}
      </div>

      {isPending ? (
        <Cargando etiqueta="Cargando las estadísticas de cobranza…" />
      ) : isError ? (
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Número principal de la vista. */}
            <Card>
              <CardContent className="py-6">
                <p className="text-sm text-muted-foreground">Total acumulado</p>
                <p className="mt-1 font-heading text-5xl font-bold tabular-nums">
                  {formatearMonto(data.totalAcumulado)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  No incluye los pagos anulados.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <p className="text-sm text-muted-foreground">Pagos registrados</p>
                <p className="mt-1 font-heading text-5xl font-bold tabular-nums">
                  {data.cantidadPagos}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {hayFiltro ? "En el período elegido." : "Desde el inicio."}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">Ingresos por mes</CardTitle>
            </CardHeader>
            <CardContent>
              <GraficoIngresosMes datos={data.ingresosPorMes} />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-base">Por medio de pago</CardTitle>
              </CardHeader>
              <CardContent>
                <BarrasDesglose datos={data.porMedioPago} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-base">Por cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <BarrasDesglose datos={data.porCuenta} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
