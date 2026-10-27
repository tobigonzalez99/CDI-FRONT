"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { listarPagos } from "@/features/pagos/api/pagos.api";
import { PAGOS_QUERY_KEY } from "@/features/pagos/hooks/use-pagos";
import { AnularPagoDialog } from "@/features/pagos/components/anular-pago-dialog";
import { ListaPagos } from "@/features/pagos/components/lista-pagos";
import { formatearMonto } from "@/lib/formato";
import type { Pago } from "@/types/pago";

/** Últimos cobros registrados, con la opción de anular los que siguen vigentes. */
export function PagosRecientes() {
  const [aAnular, setAAnular] = useState<Pago | null>(null);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [...PAGOS_QUERY_KEY, "recientes"],
    queryFn: () =>
      listarPagos({
        page: 1,
        pageSize: 10,
        anulacion: "todos",
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Últimos cobros</CardTitle>
          <CardDescription>
            Un cobro no se edita ni se borra: se anula con un motivo y queda a la vista.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <Cargando etiqueta="Cargando los últimos cobros…" />
          ) : isError ? (
            <ErrorConsulta error={error} onReintentar={() => void refetch()} />
          ) : (
            <div className="space-y-3">
              <ListaPagos
                pagos={data.data}
                mostrarSocio
                mensajeVacio="Todavía no se registró ningún cobro."
              />

              {/*
                Las acciones van aparte de ListaPagos: esa lista también la ve
                el socio en su perfil, donde anular no corresponde.
              */}
              {data.data.some((pago) => !pago.anulado) && (
                <ul className="flex flex-wrap gap-2 border-t pt-3">
                  {data.data
                    .filter((pago) => !pago.anulado)
                    .map((pago) => (
                      <li key={pago.id}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAAnular(pago)}
                        >
                          <Ban className="size-3.5" aria-hidden />
                          Anular {formatearMonto(pago.monto)} de {pago.socio.apellido}
                        </Button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AnularPagoDialog pago={aAnular} onClose={() => setAAnular(null)} />
    </>
  );
}
