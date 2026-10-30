"use client";

import { LoaderCircle, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CambiarPasswordCard } from "@/features/auth/components/cambiar-password-card";
import { PagarCuotaCard } from "@/features/mercadopago/components/pagar-cuota-card";
import { HistorialPagosCard } from "@/features/pagos/components/historial-pagos-card";
import { CarnetSocioCard } from "@/features/socios/components/carnet-socio";
import { DatosPersonales } from "@/features/socios/components/datos-personales";
import { useMiPerfil } from "@/features/socios/hooks/use-mi-perfil";
import { mensajeDeError } from "@/lib/api/errors";
import { formatearMonto } from "@/lib/formato";

/** HU-04 + HU-05: perfil del socio. */
export function MiPerfil() {
  const { data: socio, isPending, isError, error, refetch } = useMiPerfil();

  if (isPending) {
    return (
      <div className="flex justify-center py-20" role="status" aria-live="polite">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">Cargando tu perfil…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <TriangleAlert className="size-8 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">{mensajeDeError(error)}</p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const cuotaPendiente = socio.estadoCuota === "PENDIENTE";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">
          Tu carnet digital y el estado de tu cuota social.
        </p>
      </div>

      <CarnetSocioCard socio={socio} />

      {cuotaPendiente && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col gap-1 py-4">
            <p className="text-sm font-medium text-red-900">
              Tu cuota está pendiente de pago
            </p>
            <p className="text-sm text-red-800">
              El período de vigencia venció. Podés pagarla acá abajo con Mercado Pago o
              en la sede del club
              {socio.tipoSocio.montoCuota !== null && (
                <>
                  {" "}
                  (cuota de {socio.tipoSocio.nombre}:{" "}
                  {formatearMonto(socio.tipoSocio.montoCuota)})
                </>
              )}
              .
            </p>
          </CardContent>
        </Card>
      )}

      <PagarCuotaCard />

      <DatosPersonales socio={socio} />

      <HistorialPagosCard />

      <CambiarPasswordCard />
    </div>
  );
}
