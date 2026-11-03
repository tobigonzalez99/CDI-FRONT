"use client";

import { useState } from "react";
import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { SocioDetalleDialog } from "@/features/admin/components/socio-detalle-dialog";
import { AnularPagoDialog } from "@/features/pagos/components/anular-pago-dialog";
import { ListaPagos } from "@/features/pagos/components/lista-pagos";
import { SelectorSocio } from "@/features/pagos/components/selector-socio";
import { useHistorialDeSocio } from "@/features/pagos/hooks/use-pagos";
import { formatearFechaCorta, formatearMonto } from "@/lib/formato";
import type { Pago } from "@/types/pago";
import type { Socio } from "@/types/socio";

function HistorialParaAnular({
  socio,
  onAnular,
}: {
  socio: Socio;
  onAnular: (pago: Pago) => void;
}) {
  const { data, isPending, isError, error, refetch } = useHistorialDeSocio(socio.id);

  if (isPending) return <Cargando etiqueta="Cargando los cobros del socio…" />;
  if (isError) return <ErrorConsulta error={error} onReintentar={() => void refetch()} />;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Total cobrado</p>
          <p className="mt-1 font-heading text-2xl font-bold">
            {formatearMonto(data.totalCobrado)}
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Pagos vigentes</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.pagosVigentes}</p>
        </div>
      </div>

      <ListaPagos
        pagos={data.data}
        mensajeVacio={`${socio.nombre} todavía no tiene cobros registrados.`}
        accionDePago={(pago) =>
          // Los anulados ya no tienen nada que anular: quedan tachados, con su motivo.
          pago.anulado ? null : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              aria-label={`Anular el cobro de ${formatearMonto(pago.monto)} del ${formatearFechaCorta(pago.fechaPago)}`}
              onClick={() => onAnular(pago)}
            >
              <Ban aria-hidden />
              Anular
            </Button>
          )
        }
      />
    </div>
  );
}

/**
 * Anular un cobro: se busca al socio y, en su historial, cada cobro vigente
 * tiene su botón. Así queda a la vista cuál se anula.
 *
 * Incluye a los socios de baja: también pueden tener un cobro mal cargado.
 */
export function AnularCobros() {
  const [socio, setSocio] = useState<Socio | null>(null);
  const [aAnular, setAAnular] = useState<Pago | null>(null);
  const [fichaAbierta, setFichaAbierta] = useState<string | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Anular un cobro</CardTitle>
          <CardDescription>
            Buscá al socio y anulá el cobro que corresponda desde su historial. Un cobro no
            se edita ni se borra: se anula con un motivo y queda a la vista.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <SelectorSocio socio={socio} onSeleccionar={setSocio} incluirBajas />

          {socio && <HistorialParaAnular socio={socio} onAnular={setAAnular} />}
        </CardContent>
      </Card>

      <AnularPagoDialog
        pago={aAnular}
        onClose={() => setAAnular(null)}
        onVerFicha={setFichaAbierta}
      />

      <SocioDetalleDialog
        socioId={fichaAbierta}
        onOpenChange={(abierto) => !abierto && setFichaAbierta(null)}
      />
    </>
  );
}
