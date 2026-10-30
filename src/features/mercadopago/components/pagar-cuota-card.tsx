"use client";

import { useEffect, useId, useState } from "react";
import { CreditCard, LoaderCircle, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  useCotizacionCuota,
  useIniciarPagoCuota,
} from "@/features/mercadopago/hooks/use-pago-cuota";
import { mensajeDeError } from "@/lib/api/errors";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";
import { MESES_PAGO_ONLINE } from "@/types/mercadopago";

const CLASES_SELECT =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const OPCIONES_MESES = Array.from(
  { length: MESES_PAGO_ONLINE.max - MESES_PAGO_ONLINE.min + 1 },
  (_, indice) => MESES_PAGO_ONLINE.min + indice,
);

const textoMeses = (meses: number) => `${meses} ${meses === 1 ? "mes" : "meses"}`;

/**
 * Pago de la cuota con Mercado Pago, desde el perfil.
 *
 * El socio elige cuántos meses paga y el total lo calcula siempre el
 * backend: acá no se hace ninguna cuenta con plata. Antes de mandarlo a
 * Mercado Pago se compara el total del cobro con el que se le mostró, así
 * nunca termina pagando una cifra distinta de la que vio.
 */
export function PagarCuotaCard() {
  const mesesId = useId();
  const [meses, setMeses] = useState<number>(MESES_PAGO_ONLINE.min);
  const [problema, setProblema] = useState<string | null>(null);
  const [redirigiendo, setRedirigiendo] = useState(false);

  const cotizacion = useCotizacionCuota(meses);
  const { mutateAsync: iniciar, isPending: iniciando } = useIniciarPagoCuota();

  // Si vuelve desde Mercado Pago con "atrás", el navegador puede restaurar la
  // página tal como quedó, con el botón trabado en "Te llevamos…".
  useEffect(() => {
    function alVolver(evento: PageTransitionEvent) {
      if (evento.persisted) setRedirigiendo(false);
    }
    window.addEventListener("pageshow", alVolver);
    return () => window.removeEventListener("pageshow", alVolver);
  }, []);

  /** El total que se ve en pantalla corresponde a los meses elegidos. */
  const totalVigente =
    cotizacion.data && cotizacion.data.meses === meses ? cotizacion.data : null;

  async function pagar() {
    if (!totalVigente) return;
    setProblema(null);

    try {
      const cobro = await iniciar({ meses });

      // El importe pudo cambiar entre que se mostró y que se apretó "Pagar":
      // en ese caso se avisa y se muestra el nuevo, en lugar de mandarlo a
      // pagar otra cifra.
      if (cobro.total !== totalVigente.total) {
        setProblema(
          `El monto cambió: ahora son ${formatearMonto(cobro.total)}. Revisalo y volvé a apretar "Pagar".`,
        );
        void cotizacion.refetch();
        return;
      }

      setRedirigiendo(true);
      window.location.assign(cobro.initPoint);
    } catch (error) {
      setProblema(mensajeDeError(error));
    }
  }

  const ocupado = iniciando || redirigiendo;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <CreditCard className="size-5 text-brand-red" aria-hidden />
          Pagar la cuota
        </CardTitle>
        <CardDescription>
          Con tarjeta o con dinero en tu cuenta de Mercado Pago. Los meses que pagues se
          suman a los que ya tenés.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          <div className="grid gap-2">
            <Label htmlFor={mesesId}>¿Cuántos meses querés pagar?</Label>
            <select
              id={mesesId}
              className={CLASES_SELECT}
              value={meses}
              disabled={ocupado}
              onChange={(evento) => {
                setMeses(Number(evento.target.value));
                setProblema(null);
              }}
            >
              {OPCIONES_MESES.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {textoMeses(opcion)}
                </option>
              ))}
            </select>
          </div>

          {/* El total lo da el backend: mientras llega el nuevo se ve el anterior, atenuado. */}
          <div
            className={cn(
              "rounded-xl bg-muted/50 p-4 transition-opacity",
              cotizacion.isFetching && "opacity-60",
            )}
            aria-live="polite"
          >
            <p className="text-xs text-muted-foreground">Total a pagar</p>
            {cotizacion.data ? (
              <p className="mt-1 font-heading text-2xl font-bold">
                {formatearMonto(cotizacion.data.total)}
                {cotizacion.data.meses > 1 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {textoMeses(cotizacion.data.meses)} ×{" "}
                    {formatearMonto(cotizacion.data.montoMensual)}
                  </span>
                )}
              </p>
            ) : cotizacion.isError ? (
              <p className="mt-1 text-sm text-destructive">
                {mensajeDeError(cotizacion.error)}
              </p>
            ) : (
              <LoaderCircle
                className="mt-2 size-5 animate-spin text-muted-foreground"
                aria-label="Calculando el total"
              />
            )}
          </div>
        </div>

        {problema && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {problema}
          </p>
        )}

        <Button
          type="button"
          size="lg"
          className="h-12 text-base"
          onClick={() => void pagar()}
          disabled={!totalVigente || ocupado}
        >
          {ocupado && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {redirigiendo
            ? "Te llevamos a Mercado Pago…"
            : iniciando
              ? "Preparando el pago…"
              : totalVigente
                ? `Pagar ${formatearMonto(totalVigente.total)}`
                : "Pagar"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Vas a pagar en la página de Mercado Pago. Cuando termines, volvés acá con el
          resultado.
        </p>
      </CardContent>
    </Card>
  );
}
