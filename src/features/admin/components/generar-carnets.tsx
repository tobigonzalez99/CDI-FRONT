"use client";

import { CircleCheck, LoaderCircle, QrCode, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGenerarCodigosDeCarnet } from "@/features/admin/hooks/use-socios";
import { mensajeDeError } from "@/lib/api/errors";
import type { GenerarQrResponse } from "@/types/socio";

/** Lo que se le dice al administrador después de apretar el botón. */
function resumen({ generados, yaTenian }: GenerarQrResponse): string {
  const nuevos =
    generados === 0
      ? "No hubo carnets nuevos para generar"
      : generados === 1
        ? "Se generó 1 carnet nuevo"
        : `Se generaron ${generados} carnets nuevos`;

  const viejos =
    yaTenian === 0
      ? ""
      : yaTenian === 1
        ? " 1 socio ya tenía el suyo."
        : ` ${yaTenian} socios ya tenían el suyo.`;

  return `${nuevos}.${viejos}`;
}

/**
 * Le da su código de carnet a los socios que todavía no lo tienen.
 *
 * Se aprieta cada vez que hay altas nuevas. No hay "regenerar": el carnet ya
 * está en el teléfono de cada socio y cambiarle el código lo dejaría sin
 * servir sin que nadie se entere hasta la puerta de la cancha.
 */
export function GenerarCarnets() {
  const generar = useGenerarCodigosDeCarnet();

  return (
    <section className="flex flex-wrap items-start justify-between gap-4 rounded-xl border p-4">
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-medium">Carnets digitales</h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Le da su código QR a cada socio activo que todavía no lo tenga. A los que ya
          tienen el suyo no se les cambia nada, así los carnets que ya repartiste
          siguen funcionando. Podés apretarlo cada vez que des de alta a alguien.
        </p>

        <div role="status" aria-live="polite">
          {generar.isSuccess && (
            <p className="mt-3 flex items-start gap-1.5 text-sm font-medium text-emerald-700">
              <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
              {resumen(generar.data)}
            </p>
          )}

          {generar.isError && (
            <p className="mt-3 flex items-start gap-1.5 text-sm font-medium text-destructive">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {mensajeDeError(generar.error)}
            </p>
          )}
        </div>
      </div>

      <Button
        type="button"
        onClick={() => generar.mutate()}
        disabled={generar.isPending}
      >
        {generar.isPending ? (
          <LoaderCircle className="animate-spin" aria-hidden />
        ) : (
          <QrCode aria-hidden />
        )}
        {generar.isPending ? "Generando…" : "Generar los que falten"}
      </Button>
    </section>
  );
}
