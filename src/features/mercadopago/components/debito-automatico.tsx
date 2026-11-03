"use client";

import { useEffect, useState } from "react";
import { CircleCheck, CirclePause, Clock, LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmarDialog } from "@/components/shared/confirmar-dialog";
import {
  useActivarDebito,
  useCancelarDebito,
  useDebito,
} from "@/features/mercadopago/hooks/use-debito";
import { esApiError, mensajeDeError } from "@/lib/api/errors";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";
import type { DebitoAutomatico as Debito } from "@/types/mercadopago";

/** Una línea con ícono y texto, el mismo molde para los cuatro estados. */
function Estado({
  Icono,
  clases,
  children,
}: {
  Icono: typeof CircleCheck;
  clases: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-start gap-2.5 text-sm", clases)}>
      <Icono className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="grid gap-1">{children}</div>
    </div>
  );
}

const porMes = (monto: number | null) => (monto === null ? "" : ` (${formatearMonto(monto)} por mes)`);

/**
 * Débito automático de la cuota, debajo de "Pagar mi cuota".
 *
 * Mercado Pago cobra la cuota todos los meses y cada cobro extiende la
 * vigencia solo. Se activa acá, se confirma en Mercado Pago y se cancela acá
 * o desde la cuenta de Mercado Pago. Pagar a mano sigue valiendo: los meses
 * se suman.
 */
export function DebitoAutomatico() {
  const debito = useDebito();
  const activar = useActivarDebito();
  const cancelar = useCancelarDebito();

  const [problema, setProblema] = useState<string | null>(null);
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false);
  const [redirigiendo, setRedirigiendo] = useState(false);

  // Si vuelve desde Mercado Pago con "atrás", el navegador puede restaurar la
  // página tal como quedó, con el botón trabado en "Te llevamos…".
  const { refetch } = debito;
  useEffect(() => {
    function alVolver(evento: PageTransitionEvent) {
      if (evento.persisted) {
        setRedirigiendo(false);
        void refetch();
      }
    }
    window.addEventListener("pageshow", alVolver);
    return () => window.removeEventListener("pageshow", alVolver);
  }, [refetch]);

  async function activarDebito() {
    setProblema(null);
    try {
      const { initPoint } = await activar.mutateAsync();
      setRedirigiendo(true);
      window.location.assign(initPoint);
    } catch (error) {
      // Ya tenía uno activo o pausado: se muestra el estado real en lugar del error.
      if (esApiError(error) && error.code === "CONFLICT") {
        void debito.refetch();
        return;
      }
      setProblema(mensajeDeError(error));
    }
  }

  async function confirmarCancelacion() {
    setProblema(null);
    try {
      await cancelar.mutateAsync();
      setConfirmandoCancelacion(false);
    } catch (error) {
      setConfirmandoCancelacion(false);
      if (esApiError(error) && error.code === "NOT_FOUND") return;
      // Con 503 Mercado Pago no confirmó: el débito sigue y hay que reintentar.
      setProblema(
        esApiError(error) && error.code === "PAYMENT_GATEWAY_ERROR"
          ? "No pudimos cancelarlo: Mercado Pago no respondió y el débito sigue activo. Probá de nuevo en un rato."
          : mensajeDeError(error),
      );
    }
  }

  if (debito.isPending) {
    return (
      <div className="flex justify-center py-4" role="status">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">Consultando el débito automático…</span>
      </div>
    );
  }

  if (debito.isError) {
    return (
      <p className="flex items-center justify-between gap-3 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        No pudimos consultar tu débito automático.
        <Button type="button" variant="outline" size="sm" onClick={() => void debito.refetch()}>
          Reintentar
        </Button>
      </p>
    );
  }

  const { estado, monto, initPoint }: Debito = debito.data;
  const ocupado = activar.isPending || redirigiendo || cancelar.isPending;

  const botonCancelar = (variante: "outline" | "ghost") => (
    <Button
      type="button"
      variant={variante}
      size="sm"
      disabled={ocupado}
      onClick={() => setConfirmandoCancelacion(true)}
    >
      Cancelar débito automático
    </Button>
  );

  return (
    <section
      aria-labelledby="debito-titulo"
      className="grid gap-3 rounded-xl border border-border p-4"
    >
      <h2 id="debito-titulo" className="font-heading text-sm font-bold">
        Débito automático
      </h2>

      {estado === "SIN_DEBITO" && (
        <>
          <p className="text-sm text-muted-foreground">
            Mercado Pago te cobra la cuota{porMes(monto)} todos los meses y quedás al día
            sin tener que acordarte.
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={ocupado}
            onClick={() => void activarDebito()}
          >
            {ocupado ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="size-4" aria-hidden />
            )}
            {redirigiendo
              ? "Te llevamos a Mercado Pago…"
              : activar.isPending
                ? "Preparando…"
                : "Activar débito automático"}
          </Button>
        </>
      )}

      {estado === "PENDIENTE" && (
        <>
          <Estado Icono={Clock} clases="text-amber-800">
            <p className="font-medium">Falta que confirmes la suscripción en Mercado Pago.</p>
            <p className="text-muted-foreground">
              Si ya la confirmaste, en un par de minutos se ve activo acá.
            </p>
          </Estado>
          <div className="flex flex-wrap gap-2">
            {initPoint && (
              <a href={initPoint} className={cn(buttonVariants({ size: "sm" }))}>
                Continuar en Mercado Pago
              </a>
            )}
            {botonCancelar("ghost")}
          </div>
        </>
      )}

      {estado === "ACTIVO" && (
        <>
          <Estado Icono={CircleCheck} clases="text-emerald-700">
            <p className="font-medium">
              Activo: Mercado Pago te cobra la cuota{porMes(monto)} todos los meses.
            </p>
            <p className="text-muted-foreground">
              Si querés, igual podés pagar meses por adelantado: se suman.
            </p>
          </Estado>
          <div>{botonCancelar("outline")}</div>
        </>
      )}

      {estado === "PAUSADO" && (
        <>
          <Estado Icono={CirclePause} clases="text-amber-800">
            <p className="font-medium">Pausado desde tu cuenta de Mercado Pago.</p>
            <p className="text-muted-foreground">
              Mientras esté pausado no se te cobra la cuota. Lo podés reanudar desde
              Mercado Pago.
            </p>
          </Estado>
          <div>{botonCancelar("outline")}</div>
        </>
      )}

      {problema && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {problema}
        </p>
      )}

      <ConfirmarDialog
        open={confirmandoCancelacion}
        onOpenChange={setConfirmandoCancelacion}
        variante="danger"
        titulo="¿Cancelar el débito automático?"
        descripcion="Mercado Pago deja de cobrarte la cuota todos los meses. Los meses que ya pagaste siguen valiendo, y la podés pagar a mano cuando quieras."
        textoConfirmar="Cancelar débito"
        textoCancelar="Volver"
        ejecutando={cancelar.isPending}
        onConfirmar={() => void confirmarCancelacion()}
      />
    </section>
  );
}
