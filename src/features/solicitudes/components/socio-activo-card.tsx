"use client";

import { useId, useState } from "react";
import { Clock, HeartHandshake, LoaderCircle, UserMinus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { ConfirmarDialog } from "@/components/shared/confirmar-dialog";
import {
  useCancelarMiSolicitudBaja,
  useMiSolicitudBaja,
  usePedirBaja,
} from "@/features/solicitudes/hooks/use-bajas";
import { mensajeDeError } from "@/lib/api/errors";
import { formatearFecha } from "@/lib/formato";

const MOTIVO_MAX = 500;

/**
 * Lo que ve un socio con sesión iniciada en la sección "Socio".
 *
 * Mantiene el mismo encuadre que la tarjeta de "Hacete socio" —no tendría
 * sentido que la sección cambie de forma según quién mire— y reemplaza el
 * agradecimiento por el formulario, y el botón de enviar por el de baja.
 */
export function SocioActivoCard() {
  const { data, isPending, isError, error, refetch } = useMiSolicitudBaja();

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-start gap-2.5 font-heading text-xl text-balance">
          <HeartHandshake className="mt-0.5 size-6 shrink-0 text-brand-red" aria-hidden />
          Gracias por colaborar y ser parte del Club Deportivo Independencia
        </CardTitle>
        <CardDescription>
          Tu aporte sostiene las inferiores, la escuelita y las actividades del club.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <Cargando etiqueta="Cargando el estado de tu membresía…" />
        ) : isError ? (
          <ErrorConsulta error={error} onReintentar={() => void refetch()} />
        ) : data.pendiente ? (
          <BajaPendiente solicitadaEn={data.solicitadaEn} />
        ) : (
          <BotonDarseDeBaja />
        )}
      </CardContent>
    </Card>
  );
}

/** El pedido ya está hecho: en lugar del botón, en qué quedó y cómo revertirlo. */
function BajaPendiente({ solicitadaEn }: { solicitadaEn: string | null }) {
  const [confirmando, setConfirmando] = useState(false);
  const { mutateAsync: cancelar, isPending } = useCancelarMiSolicitudBaja();

  async function confirmarMarchaAtras() {
    try {
      await cancelar();
      setConfirmando(false);
      toast.success("Listo, seguís siendo socio", {
        description: "Dimos de baja tu pedido.",
      });
    } catch (error) {
      toast.error("No pudimos cancelar el pedido", {
        description: mensajeDeError(error),
      });
    }
  }

  return (
    <>
      <div className="rounded-xl border border-dashed p-5">
        <p className="flex items-center gap-2 font-medium">
          <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          Pediste la baja y el club la está revisando
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          {solicitadaEn
            ? `Lo pediste el ${formatearFecha(solicitadaEn.slice(0, 10))}. `
            : ""}
          Hasta que la resuelvan seguís siendo socio, con todos tus beneficios.
        </p>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="mt-4"
          onClick={() => setConfirmando(true)}
        >
          Dar marcha atrás
        </Button>
      </div>

      <ConfirmarDialog
        open={confirmando}
        onOpenChange={setConfirmando}
        variante="default"
        titulo="¿Dar marcha atrás?"
        descripcion="Se elimina tu pedido de baja y seguís siendo socio, como hasta ahora."
        textoConfirmar="Sí, quiero seguir"
        textoCancelar="Volver"
        ejecutando={isPending}
        onConfirmar={() => void confirmarMarchaAtras()}
      />
    </>
  );
}

/**
 * El pedido de baja va con confirmación: una vez enviado, volver atrás
 * depende del club, así que conviene que no salga de un clic distraído.
 */
function BotonDarseDeBaja() {
  const [confirmando, setConfirmando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const motivoId = useId();

  const { mutateAsync: pedir, isPending } = usePedirBaja();

  async function confirmarBaja() {
    const texto = motivo.trim();

    try {
      await pedir(texto ? { motivo: texto } : {});
      setConfirmando(false);
      setMotivo("");
      toast.success("Enviamos tu pedido de baja", {
        description: "El club lo va a revisar. Mientras tanto seguís siendo socio.",
      });
    } catch (error) {
      toast.error("No pudimos enviar tu pedido", {
        description: mensajeDeError(error),
      });
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size="lg"
        className="h-12 w-full text-base"
        onClick={() => setConfirmando(true)}
      >
        <UserMinus aria-hidden />
        Darme de baja como socio
      </Button>

      {/* No usa ConfirmarDialog porque suma el motivo, que es opcional. */}
      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">¿Querés darte de baja?</DialogTitle>
            <DialogDescription>
              Le mandamos tu pedido a la administración del club. Hasta que lo
              resuelvan seguís siendo socio, y para volver después vas a tener que
              comunicarte con el club.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor={motivoId}>¿Querés contarnos por qué? (opcional)</Label>
            <textarea
              id={motivoId}
              rows={3}
              maxLength={MOTIVO_MAX}
              value={motivo}
              onChange={(evento) => setMotivo(evento.target.value)}
              placeholder="Nos ayuda a mejorar, pero podés dejarlo vacío"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setConfirmando(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              size="lg"
              onClick={() => void confirmarBaja()}
              disabled={isPending}
            >
              {isPending && <LoaderCircle className="animate-spin" aria-hidden />}
              Sí, darme de baja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
