"use client";

import { useState } from "react";
import { Check, Inbox, LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { ConfirmarDialog } from "@/components/shared/confirmar-dialog";
import { PasswordInicialDialog } from "@/features/solicitudes/components/password-inicial-dialog";
import {
  useAprobarSolicitud,
  useRechazarSolicitud,
  useSolicitudes,
} from "@/features/solicitudes/hooks/use-solicitudes";
import { mensajeDeError } from "@/lib/api/errors";
import { formatearFecha, formatearFechaCorta } from "@/lib/formato";
import type { CreateSocioResponse } from "@/types/socio";
import type { SolicitudSocio } from "@/types/solicitud";

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm break-words">{valor}</dd>
    </div>
  );
}

function TarjetaSolicitud({
  solicitud,
  onAprobada,
}: {
  solicitud: SolicitudSocio;
  onAprobada: (resultado: CreateSocioResponse) => void;
}) {
  const [confirmandoRechazo, setConfirmandoRechazo] = useState(false);

  const aprobar = useAprobarSolicitud();
  const rechazar = useRechazarSolicitud();
  const ocupado = aprobar.isPending || rechazar.isPending;

  async function darDeAlta() {
    try {
      const resultado = await aprobar.mutateAsync({ id: solicitud.id });
      onAprobada(resultado);
    } catch (error) {
      toast.error("No pudimos dar de alta al socio", {
        description: mensajeDeError(error),
      });
    }
  }

  async function confirmarRechazo() {
    try {
      await rechazar.mutateAsync(solicitud.id);
      setConfirmandoRechazo(false);
      toast.success("Solicitud rechazada");
    } catch (error) {
      toast.error("No pudimos rechazar la solicitud", {
        description: mensajeDeError(error),
      });
    }
  }

  return (
    <>
      <article className="rounded-2xl border p-5">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar className="size-20 shrink-0 rounded-lg">
            <AvatarImage
              src={solicitud.fotoUrl}
              alt={`Foto de ${solicitud.nombre} ${solicitud.apellido}`}
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg font-semibold">
              {solicitud.nombre[0]}
              {solicitud.apellido[0]}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-bold">
              {solicitud.nombre} {solicitud.apellido}
            </h3>
            <p className="text-sm text-muted-foreground">
              Pidió {solicitud.tipoSocio.nombre} · enviada el{" "}
              {formatearFechaCorta(solicitud.createdAt.slice(0, 10))}
            </p>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <Dato etiqueta="DNI" valor={solicitud.dni} />
          <Dato etiqueta="Correo electrónico" valor={solicitud.email} />
          <Dato etiqueta="Teléfono" valor={solicitud.telefono} />
          <Dato
            etiqueta="Fecha de nacimiento"
            valor={formatearFecha(solicitud.fechaNacimiento)}
          />
          <Dato
            etiqueta="Domicilio"
            valor={`${solicitud.domicilio}, ${solicitud.localidad}`}
          />
          <Dato etiqueta="Categoría" valor={solicitud.tipoSocio.nombre} />
        </dl>

        {solicitud.comentario && (
          <p className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">
            <span className="text-xs text-muted-foreground">Comentario: </span>
            {solicitud.comentario}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
          <Button
            type="button"
            variant="success"
            onClick={darDeAlta}
            disabled={ocupado}
          >
            {aprobar.isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <Check className="size-4" aria-hidden />
            )}
            Dar de alta
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={() => setConfirmandoRechazo(true)}
            disabled={ocupado}
          >
            <Trash2 className="size-4" aria-hidden />
            Rechazar solicitud
          </Button>
        </div>
      </article>

      {/* Rechazar borra los datos y la foto: no se deshace, va con confirmación. */}
      <ConfirmarDialog
        open={confirmandoRechazo}
        onOpenChange={setConfirmandoRechazo}
        variante="danger"
        titulo="¿Rechazar la solicitud?"
        descripcion={`Vas a rechazar la solicitud de ${solicitud.nombre} ${solicitud.apellido}. Se borran los datos que envió y su foto, y no se pueden recuperar. La persona puede volver a postularse más adelante.`}
        textoConfirmar="Rechazar solicitud"
        ejecutando={rechazar.isPending}
        onConfirmar={() => void confirmarRechazo()}
      />
    </>
  );
}

/** HU-08: solicitudes de alta pendientes de revisión. */
export function SolicitudesPendientes() {
  const [altaReciente, setAltaReciente] = useState<CreateSocioResponse | null>(null);
  const { data, isPending, isError, error, refetch } = useSolicitudes();

  if (isPending) return <Cargando etiqueta="Cargando las solicitudes…" />;
  if (isError) return <ErrorConsulta error={error} onReintentar={() => void refetch()} />;

  if (data.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-14 text-center">
        <Inbox className="size-7 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">
          No hay solicitudes pendientes por ahora.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {data.data.map((solicitud) => (
          <TarjetaSolicitud
            key={solicitud.id}
            solicitud={solicitud}
            onAprobada={setAltaReciente}
          />
        ))}
      </div>

      <PasswordInicialDialog
        resultado={altaReciente}
        onClose={() => setAltaReciente(null)}
      />
    </>
  );
}
