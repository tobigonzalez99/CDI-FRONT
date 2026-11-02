"use client";

import { useEffect, useId, useState } from "react";
import { CreditCard, LoaderCircle, Minus, Plus, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCotizacionCuota,
  useIniciarPagoCuota,
} from "@/features/mercadopago/hooks/use-pago-cuota";
import { mensajeDeError } from "@/lib/api/errors";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";
import { MESES_PAGO_ONLINE } from "@/types/mercadopago";

const { min: MIN_MESES, max: MAX_MESES } = MESES_PAGO_ONLINE;

const textoMeses = (meses: number) => `${meses} ${meses === 1 ? "mes" : "meses"}`;

/** Lo que escribió el socio, si es una cantidad de meses que se puede pagar. */
function mesesValidos(texto: string): number | null {
  const numero = Number(texto);
  return texto.trim() !== "" &&
    Number.isInteger(numero) &&
    numero >= MIN_MESES &&
    numero <= MAX_MESES
    ? numero
    : null;
}

const limitar = (numero: number) => Math.min(MAX_MESES, Math.max(MIN_MESES, numero));

/**
 * Lo que va adentro del diálogo: cuántos meses, el total y la confirmación.
 *
 * El total lo calcula siempre el backend: acá no se hace ninguna cuenta con
 * plata. Antes de mandarlo a Mercado Pago se compara el total del cobro con
 * el que se le mostró, así nunca termina pagando una cifra distinta de la
 * que vio.
 */
function FormularioPagoCuota({
  redirigiendo,
  onRedirigir,
}: {
  redirigiendo: boolean;
  onRedirigir: () => void;
}) {
  const mesesId = useId();
  /** La última cantidad válida: es la que se cotiza y la que se paga. */
  const [meses, setMeses] = useState<number>(MIN_MESES);
  /** Lo que está escrito en el campo, que mientras se tipea puede no ser válido. */
  const [texto, setTexto] = useState(String(MIN_MESES));
  const [problema, setProblema] = useState<string | null>(null);

  const cotizacion = useCotizacionCuota(meses);
  const { mutateAsync: iniciar, isPending: iniciando } = useIniciarPagoCuota();

  const textoValido = mesesValidos(texto) !== null;
  const ocupado = iniciando || redirigiendo;

  function elegir(nuevos: number) {
    const limitados = limitar(nuevos);
    setMeses(limitados);
    setTexto(String(limitados));
    setProblema(null);
  }

  function alEscribir(valor: string) {
    setTexto(valor);
    setProblema(null);
    const numero = mesesValidos(valor);
    if (numero !== null) setMeses(numero);
  }

  /**
   * Al salir del campo se corrige lo que haya quedado fuera de rango: vacío
   * vuelve a la última cantidad válida, 20 queda en 12 y 0 en 1.
   */
  function alSalir() {
    if (textoValido) return;
    const numero = Math.trunc(Number(texto));
    elegir(texto.trim() === "" || Number.isNaN(numero) ? meses : numero);
  }

  /**
   * El total que se ve corresponde a los meses elegidos. Mientras lo escrito
   * no sea válido no hay total para pagar.
   */
  const totalVigente =
    textoValido && cotizacion.data && cotizacion.data.meses === meses ? cotizacion.data : null;

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

      onRedirigir();
      window.location.assign(cobro.initPoint);
    } catch (error) {
      setProblema(mensajeDeError(error));
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={mesesId}>¿Cuántos meses querés pagar?</Label>
        {/*
          Un contador y no una lista desplegable: se sube y se baja con los
          botones, o se escribe el número directamente.
        */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0"
            aria-label="Un mes menos"
            disabled={ocupado || meses <= MIN_MESES}
            onClick={() => elegir(meses - 1)}
          >
            <Minus aria-hidden />
          </Button>

          <div className="relative flex-1">
            <Input
              id={mesesId}
              type="number"
              inputMode="numeric"
              min={MIN_MESES}
              max={MAX_MESES}
              step={1}
              value={texto}
              disabled={ocupado}
              aria-invalid={!textoValido}
              aria-describedby={`${mesesId}-ayuda`}
              onChange={(evento) => alEscribir(evento.target.value)}
              onBlur={alSalir}
              // Sin las flechitas propias del navegador: ya están los botones − y +.
              className="h-11 pr-16 text-center text-lg font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
              {meses === 1 && textoValido ? "mes" : "meses"}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0"
            aria-label="Un mes más"
            disabled={ocupado || meses >= MAX_MESES}
            onClick={() => elegir(meses + 1)}
          >
            <Plus aria-hidden />
          </Button>
        </div>
        <p
          id={`${mesesId}-ayuda`}
          className={cn("text-xs", textoValido ? "text-muted-foreground" : "text-destructive")}
        >
          {textoValido
            ? `Entre ${MIN_MESES} y ${MAX_MESES}. También podés escribir el número.`
            : `Elegí entre ${MIN_MESES} y ${MAX_MESES} meses.`}
        </p>
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
          <p className="mt-1 text-sm text-destructive">{mensajeDeError(cotizacion.error)}</p>
        ) : (
          <LoaderCircle
            className="mt-2 size-5 animate-spin text-muted-foreground"
            aria-label="Calculando el total"
          />
        )}
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
            : "Pagar"}
      </Button>

      <div className="grid gap-1 text-center text-xs text-muted-foreground">
        <p>Vas a pagar en la página de Mercado Pago. Cuando termines, volvés acá con el resultado.</p>
        {/*
          Mercado Pago no siempre vuelve solo al sitio, y alguien puede cerrar
          la pestaña al terminar. El backend registra igual el pago en menos
          de un minuto: esto evita que lo pague dos veces de los nervios.
        */}
        <p>Si pagaste y no volviste al sitio, tu pago aparece en tu historial en un minuto.</p>
      </div>
    </div>
  );
}

/**
 * Pago de la cuota con Mercado Pago, desde el perfil. En la página se ve solo
 * el botón; al apretarlo se abre el diálogo para elegir los meses y pagar.
 */
export function PagarCuota({ className }: { className?: string }) {
  const [abierto, setAbierto] = useState(false);
  const [redirigiendo, setRedirigiendo] = useState(false);

  // Si vuelve desde Mercado Pago con "atrás", el navegador puede restaurar la
  // página tal como quedó, con el botón trabado en "Te llevamos…".
  useEffect(() => {
    function alVolver(evento: PageTransitionEvent) {
      if (evento.persisted) setRedirigiendo(false);
    }
    window.addEventListener("pageshow", alVolver);
    return () => window.removeEventListener("pageshow", alVolver);
  }, []);

  return (
    <>
      <Button
        type="button"
        size="lg"
        className={cn("h-12 text-base", className)}
        onClick={() => setAbierto(true)}
      >
        <CreditCard aria-hidden />
        Pagar mi cuota
      </Button>

      <Dialog
        open={abierto}
        // Mientras se va a Mercado Pago no se cierra: la página ya está cambiando.
        onOpenChange={(valor) => !redirigiendo && setAbierto(valor)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Pagar mi cuota</DialogTitle>
            <DialogDescription>
              Con tarjeta o con dinero en tu cuenta de Mercado Pago. Los meses que pagues
              se suman a los que ya tenés.
            </DialogDescription>
          </DialogHeader>

          <FormularioPagoCuota
            redirigiendo={redirigiendo}
            onRedirigir={() => setRedirigiendo(true)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
