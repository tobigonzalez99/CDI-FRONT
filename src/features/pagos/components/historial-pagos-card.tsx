"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { ListaPagos } from "@/features/pagos/components/lista-pagos";
import { useMisPagos } from "@/features/pagos/hooks/use-pagos";

/** Historial de cuotas del socio autenticado, dentro de "Mi perfil". */
export function HistorialPagosCard() {
  const { data, isPending, isError, error, refetch } = useMisPagos();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">Historial de pagos</CardTitle>
        <CardDescription>
          Los cobros de tu cuota social y el período que cubre cada uno.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <Cargando etiqueta="Cargando tu historial de pagos…" />
        ) : isError ? (
          <ErrorConsulta error={error} onReintentar={() => void refetch()} />
        ) : (
          <ListaPagos
            pagos={data.data}
            mensajeVacio="Todavía no registramos pagos a tu nombre."
          />
        )}
      </CardContent>
    </Card>
  );
}
