"use client";

import { useState } from "react";
import { Inbox, LoaderCircle, UserMinus, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { ConfirmarDialog } from "@/components/shared/confirmar-dialog";
import { EstadoCuotaBadge } from "@/features/socios/components/estado-cuota-badge";
import {
  useAprobarBaja,
  useRechazarBaja,
  useSolicitudesBaja,
} from "@/features/solicitudes/hooks/use-bajas";
import { mensajeDeError } from "@/lib/api/errors";
import { formatearFecha, formatearFechaCorta, formatearVigencia } from "@/lib/formato";
import type { SolicitudBaja } from "@/types/solicitud-baja";

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm break-words">{valor}</dd>
    </div>
  );
}

function TarjetaBaja({ solicitud }: { solicitud: SolicitudBaja }) {
  const [confirmando, setConfirmando] = useState<"baja" | "cancelar" | null>(null);

  const aprobar = useAprobarBaja();
  const rechazar = useRechazarBaja();
  const ocupado = aprobar.isPending || rechazar.isPending;

  const { socio } = solicitud;
  const nombreCompleto = `${socio.nombre} ${socio.apellido}`;

  async function darDeBaja() {
    try {
      await aprobar.mutateAsync(solicitud.id);
      setConfirmando(null);
      // Sin participio: no sabemos el género de la persona y "dado/dada" fallaría.
      toast.success(`Diste de baja a ${nombreCompleto}`, {
        description:
          "Sus datos y sus pagos se conservan. Podés reactivar la cuenta cuando quiera volver.",
      });
    } catch (error) {
      toast.error("No pudimos dar de baja al socio", {
        description: mensajeDeError(error),
      });
    }
  }

  async function cancelarLaBaja() {
    try {
      await rechazar.mutateAsync(solicitud.id);
      setConfirmando(null);
      toast.success(`${nombreCompleto} sigue siendo socio`, {
        description: "Eliminamos el pedido de baja.",
      });
    } catch (error) {
      toast.error("No pudimos cancelar la baja", {
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
              src={socio.fotoUrl ?? undefined}
              alt={`Foto de ${nombreCompleto}`}
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg font-semibold">
              {socio.nombre[0]}
              {socio.apellido[0]}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-bold">{nombreCompleto}</h3>
            <p className="text-sm text-muted-foreground">
              Socio N° {socio.numeroSocio} · {socio.tipoSocio.nombre} · pidió la baja el{" "}
              {formatearFechaCorta(solicitud.createdAt.slice(0, 10))}
            </p>
            <div className="mt-2">
              <EstadoCuotaBadge estado={socio.estadoCuota} />
            </div>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <Dato etiqueta="DNI" valor={socio.dni} />
          <Dato etiqueta="Correo electrónico" valor={socio.email} />
          <Dato etiqueta="Teléfono" valor={socio.telefono} />
          <Dato
            etiqueta="Domicilio"
            valor={`${socio.domicilio}, ${socio.localidad}`}
          />
          <Dato
            etiqueta="Fecha de nacimiento"
            valor={formatearFecha(socio.fechaNacimiento)}
          />
          <Dato
            etiqueta="Vigencia"
            valor={formatearVigencia(socio.vigencia.desde, socio.vigencia.hasta)}
          />
        </dl>

        {solicitud.motivo && (
          <p className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">
            <span className="text-xs text-muted-foreground">Motivo: </span>
            {solicitud.motivo}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
          <Button
            type="button"
            variant="danger"
            onClick={() => setConfirmando("baja")}
            disabled={ocupado}
          >
            {aprobar.isPending ? (
              <LoaderCircle className="animate-spin" aria-hidden />
            ) : (
              <UserMinus aria-hidden />
            )}
            Dar de baja
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setConfirmando("cancelar")}
            disabled={ocupado}
          >
            <X aria-hidden />
            Cancelar la baja
          </Button>
        </div>
      </article>

      {/*
        Los dos carteles aclaran lo contrario a propósito: dar de baja NO borra
        nada, y es la confusión más probable viendo un botón rojo.
      */}
      <ConfirmarDialog
        open={confirmando === "baja"}
        onOpenChange={(abierto) => setConfirmando(abierto ? "baja" : null)}
        variante="danger"
        titulo="¿Dar de baja al socio?"
        descripcion={`Vas a dar de baja a ${nombreCompleto}. Sus datos y su historial de pagos se conservan, pero no va a poder iniciar sesión hasta que lo reactives.`}
        textoConfirmar="Dar de baja"
        ejecutando={aprobar.isPending}
        onConfirmar={() => void darDeBaja()}
      />

      <ConfirmarDialog
        open={confirmando === "cancelar"}
        onOpenChange={(abierto) => setConfirmando(abierto ? "cancelar" : null)}
        variante="default"
        titulo="¿Cancelar la baja?"
        descripcion={`${socio.nombre} va a seguir siendo socio activo y el pedido se elimina.`}
        textoConfirmar="Confirmar"
        textoCancelar="Volver"
        ejecutando={rechazar.isPending}
        onConfirmar={() => void cancelarLaBaja()}
      />
    </>
  );
}

/** Bandeja de pedidos de baja, de la más antigua a la más reciente. */
export function BajasPendientes() {
  const { data, isPending, isError, error, refetch } = useSolicitudesBaja();

  if (isPending) return <Cargando etiqueta="Cargando los pedidos de baja…" />;
  if (isError) return <ErrorConsulta error={error} onReintentar={() => void refetch()} />;

  if (data.data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-14 text-center">
        <Inbox className="size-7 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">
          No hay pedidos de baja pendientes por ahora.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.data.map((solicitud) => (
        <TarjetaBaja key={solicitud.id} solicitud={solicitud} />
      ))}
    </div>
  );
}
