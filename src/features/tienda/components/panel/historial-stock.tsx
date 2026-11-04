"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { useMovimientosStock } from "@/features/tienda/hooks/use-tienda-admin";
import { cn } from "@/lib/utils";
import { ETIQUETAS_MOTIVO_MOVIMIENTO } from "@/types/tienda";

/** Cada cambio de stock, con quién lo cargó. No se edita ni se borra. */
export function HistorialStock({ productoId }: { productoId: string }) {
  const [pagina, setPagina] = useState(1);
  const { data, isPending, isError, error, refetch } = useMovimientosStock(productoId, pagina);

  if (isPending) return <Cargando etiqueta="Cargando el historial…" />;
  if (isError) return <ErrorConsulta error={error} onReintentar={() => void refetch()} />;
  if (data.data.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay movimientos.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y text-sm">
        {data.data.map((movimiento) => (
          <li key={movimiento.id} className="flex items-start gap-3 py-2.5">
            <span
              className={cn(
                "w-12 shrink-0 font-semibold tabular-nums",
                movimiento.cantidad > 0 ? "text-emerald-700" : "text-destructive",
              )}
            >
              {movimiento.cantidad > 0 ? `+${movimiento.cantidad}` : movimiento.cantidad}
            </span>
            <div className="min-w-0 flex-1">
              <p>
                {ETIQUETAS_MOTIVO_MOVIMIENTO[movimiento.motivo]}
                {movimiento.talle && <span className="text-muted-foreground"> · talle {movimiento.talle}</span>}
                <span className="text-muted-foreground"> · quedó en {movimiento.stockResultante}</span>
              </p>
              {movimiento.observaciones && (
                <p className="text-muted-foreground">{movimiento.observaciones}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {format(parseISO(movimiento.createdAt), "dd/MM/yyyy HH:mm")} · {movimiento.registradoPor}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>
            <ChevronLeft aria-hidden />
            Más nuevos
          </Button>
          <span className="text-xs text-muted-foreground">
            {data.page} de {data.totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={pagina >= data.totalPages}
            onClick={() => setPagina(pagina + 1)}
          >
            Más viejos
            <ChevronRight aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
