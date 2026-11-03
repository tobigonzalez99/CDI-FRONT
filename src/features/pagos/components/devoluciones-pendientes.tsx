"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Check, CircleCheck, Inbox, LoaderCircle, TriangleAlert, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { SocioDetalleDialog } from "@/features/admin/components/socio-detalle-dialog";
import { useRevisarDevolucion } from "@/features/pagos/hooks/use-pago-mutations";
import { useDevoluciones } from "@/features/pagos/hooks/use-pagos";
import { mensajeDeError } from "@/lib/api/errors";
import { formatearFechaCorta, formatearMonto, formatearVigencia } from "@/lib/formato";
import { cn } from "@/lib/utils";
import { ETIQUETAS_DEVOLUCION, type DevolucionPago, type Pago } from "@/types/pago";

type Vista = "pendientes" | "todas";

/**
 * Qué tiene que hacer el admin con cada caso, en una línea.
 *
 * El backend ya anuló el pago y, si pudo, le quitó al socio ese período. Lo
 * que queda para el admin es revisar los casos que no pudo resolver solo.
 */
function QueHacer({ devolucion, onVerFicha }: { devolucion: DevolucionPago; onVerFicha: () => void }) {
  if (devolucion.tipo === "DEVOLUCION_PARCIAL") {
    return (
      <p className="flex items-start gap-2 text-sm text-amber-900">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        El pago sigue vigente: decidí si corresponde ajustar la vigencia del socio.
      </p>
    );
  }

  if (devolucion.vigenciaRevertida) {
    return (
      <p className="flex items-start gap-2 text-sm text-emerald-800">
        <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        Se le quitó al socio el período de este pago. No hace falta hacer nada más.
      </p>
    );
  }

  // Había pagos posteriores, o el admin ya lo había anulado a mano.
  return (
    <p className="flex flex-wrap items-start gap-x-2 gap-y-1 text-sm text-amber-900">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>Revisá la vigencia del socio desde su ficha.</span>
      <button
        type="button"
        onClick={onVerFicha}
        className="font-medium underline underline-offset-4 hover:no-underline"
      >
        Abrir la ficha
      </button>
    </p>
  );
}

function TarjetaDevolucion({ pago, onVerFicha }: { pago: Pago; onVerFicha: (socioId: string) => void }) {
  const revisar = useRevisarDevolucion();
  const devolucion = pago.devolucion!;
  const nombre = `${pago.socio.nombre} ${pago.socio.apellido}`;

  async function marcarComoVista() {
    try {
      await revisar.mutateAsync(pago.id);
      toast.success("Listo, la marcaste como vista");
    } catch (error) {
      toast.error("No pudimos marcarla como vista", { description: mensajeDeError(error) });
    }
  }

  return (
    <article className="rounded-2xl border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
            <Undo2 className="size-3.5" aria-hidden />
            {ETIQUETAS_DEVOLUCION[devolucion.tipo]}
          </span>
          <h3 className="mt-2 font-heading text-lg font-bold">
            <button
              type="button"
              onClick={() => onVerFicha(pago.socio.id)}
              className="underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {nombre}
            </button>
          </h3>
          <p className="text-sm text-muted-foreground">
            Socio N° {pago.socio.numeroSocio} · detectada el{" "}
            {format(parseISO(devolucion.detectadaEn), "dd/MM/yyyy 'a las' HH:mm")}
          </p>
        </div>

        {devolucion.revisadaEn && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Vista el {formatearFechaCorta(devolucion.revisadaEn.slice(0, 10))}
          </span>
        )}
      </div>

      <dl className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Monto del pago</dt>
          <dd className="text-sm font-medium">{formatearMonto(pago.monto)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Monto devuelto</dt>
          <dd className="text-sm font-medium">{formatearMonto(devolucion.montoDevuelto)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Fecha del pago</dt>
          <dd className="text-sm font-medium">{formatearFechaCorta(pago.fechaPago)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Período que cubría</dt>
          <dd className="text-sm font-medium">
            {formatearVigencia(pago.periodo.desde, pago.periodo.hasta)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <QueHacer devolucion={devolucion} onVerFicha={() => onVerFicha(pago.socio.id)} />

        {!devolucion.revisadaEn && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={revisar.isPending}
            onClick={() => void marcarComoVista()}
          >
            {revisar.isPending ? (
              <LoaderCircle className="animate-spin" aria-hidden />
            ) : (
              <Check aria-hidden />
            )}
            Marcar como vista
          </Button>
        )}
      </div>
    </article>
  );
}

/**
 * Devoluciones y contracargos de los cobros online.
 *
 * Los detecta el backend solo y el panel no devuelve plata: acá el admin ve
 * qué pasó con cada uno, revisa lo que haga falta y lo marca como visto para
 * que salga del indicador.
 */
export function DevolucionesPendientes() {
  const [vista, setVista] = useState<Vista>("pendientes");
  const [socioAbierto, setSocioAbierto] = useState<string | null>(null);
  const { data, isPending, isError, error, refetch } = useDevoluciones(vista);

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-lg border p-1" role="group" aria-label="Qué mostrar">
        {(
          [
            ["pendientes", "Para revisar"],
            ["todas", "Todas"],
          ] as const
        ).map(([valor, etiqueta]) => (
          <button
            key={valor}
            type="button"
            aria-pressed={vista === valor}
            onClick={() => setVista(valor)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              vista === valor
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {isPending ? (
        <Cargando etiqueta="Cargando las devoluciones…" />
      ) : isError ? (
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      ) : data.data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-14 text-center">
          <Inbox className="size-7 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            {vista === "pendientes"
              ? "No hay devoluciones para revisar."
              : "Todavía no hubo devoluciones ni contracargos."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map((pago) => (
            <TarjetaDevolucion key={pago.id} pago={pago} onVerFicha={setSocioAbierto} />
          ))}
        </div>
      )}

      <SocioDetalleDialog
        socioId={socioAbierto}
        onOpenChange={(abierto) => !abierto && setSocioAbierto(null)}
      />
    </div>
  );
}
