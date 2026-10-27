"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import {
  FiltrosSocios,
  type ValoresFiltros,
} from "@/features/admin/components/filtros-socios";
import { SocioDetalleDialog } from "@/features/admin/components/socio-detalle-dialog";
import { useSocios } from "@/features/admin/hooks/use-socios";
import { useDebounce } from "@/hooks/use-debounce";
import { EstadoCuotaBadge } from "@/features/socios/components/estado-cuota-badge";
import { formatearVigencia } from "@/lib/formato";
import { cn } from "@/lib/utils";

const POR_PAGINA = 20;

const FILTROS_INICIALES: ValoresFiltros = {
  search: "",
  estado: "",
  estadoCuota: "",
};

/** HU-08: listado general de socios con búsqueda, filtros y paginación. */
export function PadronSocios() {
  const [filtros, setFiltros] = useState<ValoresFiltros>(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);
  const [socioAbierto, setSocioAbierto] = useState<string | null>(null);

  const busqueda = useDebounce(filtros.search);

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useSocios({
    page: pagina,
    pageSize: POR_PAGINA,
    search: busqueda || undefined,
    estado: filtros.estado || undefined,
    estadoCuota: filtros.estadoCuota || undefined,
    sortBy: "apellido",
    sortOrder: "asc",
  });

  /** Cambiar un filtro vuelve a la primera página: si no, se vería vacío. */
  function cambiarFiltros(valores: ValoresFiltros) {
    setFiltros(valores);
    setPagina(1);
  }

  return (
    <div className="space-y-5">
      <FiltrosSocios valores={filtros} onChange={cambiarFiltros} />

      {isPending ? (
        <Cargando etiqueta="Cargando el padrón de socios…" />
      ) : isError ? (
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      ) : data.data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center">
          <Users className="size-7 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            No hay socios que coincidan con la búsqueda.
          </p>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "overflow-x-auto rounded-xl border transition-opacity",
              isPlaceholderData && "opacity-60",
            )}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">N°</TableHead>
                  <TableHead>Socio</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Cuota</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.data.map((socio) => (
                  <TableRow
                    key={socio.id}
                    onClick={() => setSocioAbierto(socio.id)}
                    className="cursor-pointer"
                  >
                    <TableCell className="text-muted-foreground">
                      {socio.numeroSocio}
                    </TableCell>
                    <TableCell>
                      {/*
                        El botón es lo que hace la fila operable con teclado:
                        un onClick en el <tr> solo funciona con mouse.
                      */}
                      <button
                        type="button"
                        className="font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        onClick={(evento) => {
                          evento.stopPropagation();
                          setSocioAbierto(socio.id);
                        }}
                      >
                        {socio.apellido}, {socio.nombre}
                      </button>
                    </TableCell>
                    <TableCell className="tabular-nums">{socio.dni}</TableCell>
                    <TableCell>{socio.tipoSocio.nombre}</TableCell>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {formatearVigencia(socio.vigencia.desde, socio.vigencia.hasta)}
                    </TableCell>
                    <TableCell>
                      <EstadoCuotaBadge estado={socio.estadoCuota} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          socio.estado === "ALTA"
                            ? "bg-muted text-foreground"
                            : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {socio.estado === "ALTA" ? "Activo" : "Baja"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {data.total} {data.total === 1 ? "socio" : "socios"} · página {data.page} de{" "}
              {data.totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
                disabled={data.page <= 1}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPagina((actual) => actual + 1)}
                disabled={data.page >= data.totalPages}
              >
                Siguiente
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </>
      )}

      <SocioDetalleDialog
        socioId={socioAbierto}
        onOpenChange={(abierto) => !abierto && setSocioAbierto(null)}
      />
    </div>
  );
}
