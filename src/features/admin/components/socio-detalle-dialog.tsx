"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { EstadoCuotaBadge } from "@/features/socios/components/estado-cuota-badge";
import { ListaPagos } from "@/features/pagos/components/lista-pagos";
import { useSocio } from "@/features/admin/hooks/use-socios";
import { useHistorialDeSocio } from "@/features/pagos/hooks/use-pagos";
import { formatearFecha, formatearMonto, formatearVigencia } from "@/lib/formato";
import type { Socio } from "@/types/socio";

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm break-words">{valor}</dd>
    </div>
  );
}

function Cabecera({ socio }: { socio: Socio }) {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="size-16 shrink-0 rounded-lg">
        <AvatarImage
          src={socio.fotoUrl ?? undefined}
          alt={`Foto de ${socio.nombre} ${socio.apellido}`}
          className="object-cover"
        />
        <AvatarFallback className="rounded-lg font-semibold">
          {socio.nombre[0]}
          {socio.apellido[0]}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <p className="font-heading text-lg font-bold">
          {socio.nombre} {socio.apellido}
        </p>
        <p className="text-sm text-muted-foreground">
          Socio N° {socio.numeroSocio} · {socio.tipoSocio.nombre}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <EstadoCuotaBadge estado={socio.estadoCuota} />
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            {socio.estado === "ALTA" ? "Activo" : "Dado de baja"}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Historial de cobros del socio, con los totales que calcula el backend. */
function HistorialDelSocio({ socioId }: { socioId: string }) {
  const { data, isPending, isError, error, refetch } = useHistorialDeSocio(socioId);

  if (isPending) return <Cargando etiqueta="Cargando el historial de cobros…" />;
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
        mensajeVacio="Este socio todavía no tiene cobros registrados."
      />
    </div>
  );
}

interface SocioDetalleDialogProps {
  socioId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function SocioDetalleDialog({ socioId, onOpenChange }: SocioDetalleDialogProps) {
  const { data: socio, isPending, isError, error, refetch } = useSocio(socioId);

  return (
    <Dialog open={Boolean(socioId)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Ficha del socio</DialogTitle>
          <DialogDescription>
            Datos de la ficha y todos los cobros registrados a su nombre.
          </DialogDescription>
        </DialogHeader>

        {!socioId ? null : isPending ? (
          <Cargando etiqueta="Cargando la ficha…" />
        ) : isError ? (
          <ErrorConsulta error={error} onReintentar={() => void refetch()} />
        ) : (
          <div className="space-y-6">
            <Cabecera socio={socio} />

            <dl className="grid gap-4 border-t pt-4 sm:grid-cols-2">
              <Dato etiqueta="DNI" valor={socio.dni} />
              <Dato etiqueta="Correo electrónico" valor={socio.email} />
              <Dato etiqueta="Teléfono" valor={socio.telefono} />
              <Dato
                etiqueta="Fecha de nacimiento"
                valor={formatearFecha(socio.fechaNacimiento)}
              />
              <Dato
                etiqueta="Domicilio"
                valor={`${socio.domicilio}, ${socio.localidad}`}
              />
              <Dato
                etiqueta="Vigencia"
                valor={formatearVigencia(socio.vigencia.desde, socio.vigencia.hasta)}
              />
            </dl>

            <div className="border-t pt-4">
              <h3 className="font-heading text-base font-bold">Historial de cobros</h3>
              <div className="mt-4">
                <HistorialDelSocio socioId={socio.id} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
