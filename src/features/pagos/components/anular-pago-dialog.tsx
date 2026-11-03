"use client";

import { useId } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAnularPago } from "@/features/pagos/hooks/use-pago-mutations";
import { aplicarFieldErrors, mensajeDeError } from "@/lib/api/errors";
import { formatearMonto } from "@/lib/formato";
import { anulacionSchema, type AnulacionFormValues } from "@/lib/validators/pago";
import type { Pago } from "@/types/pago";

export function AnularPagoDialog({
  pago,
  onClose,
  onVerFicha,
}: {
  pago: Pago | null;
  onClose: () => void;
  /** Para ir a la ficha desde el aviso de revisar la vigencia. */
  onVerFicha?: (socioId: string) => void;
}) {
  const motivoId = useId();
  const { mutateAsync: anular, isPending } = useAnularPago();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<AnulacionFormValues>({
    resolver: zodResolver(anulacionSchema),
    defaultValues: { motivo: "" },
  });

  function cerrar() {
    reset();
    onClose();
  }

  const onSubmit: SubmitHandler<AnulacionFormValues> = async (valores) => {
    if (!pago) return;

    try {
      const resultado = await anular({ id: pago.id, input: valores });

      /*
       * Anular no revierte la vigencia: puede estar sostenida por otros pagos.
       * Cuando se apoyaba en este, el backend avisa y hay que ajustarla a mano
       * desde la ficha del socio.
       */
      if (resultado.requiereRevisarVigencia) {
        const socioId = pago.socio.id;
        toast.warning("Revisá la vigencia del socio", {
          description:
            "La vigencia se apoyaba en este cobro. Anularlo no la revierte: ajustala desde la ficha del socio.",
          duration: 15_000,
          action: onVerFicha
            ? { label: "Abrir la ficha", onClick: () => onVerFicha(socioId) }
            : undefined,
        });
      } else {
        toast.success("Pago anulado");
      }

      cerrar();
    } catch (error) {
      if (!aplicarFieldErrors(error, setError, ["motivo"])) {
        toast.error("No pudimos anular el pago", {
          description: mensajeDeError(error),
        });
      }
    }
  };

  return (
    <Dialog open={Boolean(pago)} onOpenChange={(abierto) => !abierto && cerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Anular el cobro</DialogTitle>
          <DialogDescription>
            {pago && (
              <>
                {formatearMonto(pago.monto)} de {pago.socio.apellido},{" "}
                {pago.socio.nombre}. El pago no se borra: queda registrado como
                anulado, con el motivo y quién lo anuló.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {pago?.medioPago === "MERCADO_PAGO" && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            Es un cobro online. Anularlo no le devuelve la plata al socio: eso se hace
            desde Mercado Pago.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={motivoId}>Motivo</Label>
            <textarea
              id={motivoId}
              rows={3}
              autoFocus
              placeholder="Por ejemplo: se cargó dos veces el mismo cobro"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
              aria-invalid={Boolean(errors.motivo)}
              aria-describedby={errors.motivo ? `${motivoId}-error` : undefined}
              {...register("motivo")}
            />
            {errors.motivo && (
              <p id={`${motivoId}-error`} role="alert" className="text-sm text-destructive">
                {errors.motivo.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={cerrar} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              Anular el cobro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
