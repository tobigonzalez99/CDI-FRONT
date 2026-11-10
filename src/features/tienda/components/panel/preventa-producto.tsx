"use client";

import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fechaCierrePreventa } from "@/features/tienda/components/preventa";
import { Campo } from "@/features/tienda/components/panel/campo";
import { useAbrirPreventa, useCerrarPreventa } from "@/features/tienda/hooks/use-tienda-admin";
import { aplicarFieldErrors, mensajeDeError } from "@/lib/api/errors";
import { preventaSchema, type PreventaFormValues } from "@/lib/validators/tienda";
import type { ProductoAdmin } from "@/types/tienda";

/** El valor de un `datetime-local`, en la hora de quien usa el panel. */
const paraElCampo = (fecha: string) => format(parseISO(fecha), "yyyy-MM-dd'T'HH:mm");

/**
 * Preventa de un producto con talles: por un tiempo se vende a pedido, sin
 * mirar el stock. Cierra sola a la hora indicada, o antes desde acá.
 */
export function PreventaDeProducto({ producto }: { producto: ProductoAdmin }) {
  const id = useId();
  const { preventa } = producto;
  const abierta = Boolean(preventa?.activa);
  const { mutateAsync: abrir } = useAbrirPreventa();
  const { mutateAsync: cerrar, isPending: cerrando } = useCerrarPreventa();
  const [confirmando, setConfirmando] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PreventaFormValues>({
    resolver: zodResolver(preventaSchema),
    // Una preventa cerrada no se reabre con su fecha vieja: se carga una nueva.
    values: {
      hasta: abierta && preventa ? paraElCampo(preventa.hasta) : "",
      entrega: abierta ? (preventa?.entrega ?? "") : "",
    },
  });

  const onSubmit: SubmitHandler<PreventaFormValues> = async (valores) => {
    try {
      await abrir({
        productoId: producto.id,
        hasta: new Date(valores.hasta).toISOString(),
        entrega: valores.entrega || undefined,
      });
      toast.success(abierta ? "Preventa actualizada" : "Preventa abierta");
    } catch (error) {
      if (!aplicarFieldErrors(error, setError, ["hasta", "entrega"])) {
        toast.error("No pudimos guardar la preventa", { description: mensajeDeError(error) });
      }
    }
  };

  async function cerrarAhora() {
    try {
      await cerrar(producto.id);
      toast.success("Preventa cerrada");
    } catch (error) {
      toast.error("No pudimos cerrar la preventa", { description: mensajeDeError(error) });
    }
    setConfirmando(false);
  }

  return (
    <div className="grid gap-4">
      <p
        className={
          abierta
            ? "rounded-lg bg-sky-50 p-3 text-sm text-sky-950"
            : "rounded-lg bg-muted p-3 text-sm text-muted-foreground"
        }
      >
        {abierta && preventa
          ? `Abierta hasta el ${fechaCierrePreventa(preventa.hasta)}. Todos los talles activos se pueden pedir, aunque no haya stock.`
          : preventa
            ? `Cerrada. La última cerró el ${fechaCierrePreventa(preventa.hasta)}.`
            : "Este producto no está en preventa: se vende solo lo que hay en stock."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
        <Campo
          id={`${id}-hasta`}
          etiqueta="Cierra el"
          ayuda="A esa hora se cierra sola y vuelve a venderse solo lo que hay en stock."
          error={errors.hasta?.message}
        >
          <Input
            id={`${id}-hasta`}
            type="datetime-local"
            className="h-10 w-full sm:w-64"
            aria-invalid={Boolean(errors.hasta)}
            {...register("hasta")}
          />
        </Campo>
        <Campo
          id={`${id}-entrega`}
          etiqueta="Entrega"
          ayuda="Opcional. Lo ve el comprador. Por ejemplo: «Llega al club la primera semana de diciembre»."
          error={errors.entrega?.message}
        >
          <Input
            id={`${id}-entrega`}
            maxLength={150}
            className="h-10"
            aria-invalid={Boolean(errors.entrega)}
            {...register("entrega")}
          />
        </Campo>

        <div className="flex flex-wrap justify-end gap-2">
          {abierta && (
            <Button type="button" variant="ghost" onClick={() => setConfirmando(true)} disabled={isSubmitting}>
              Cerrar ahora
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || (abierta && !isDirty)}>
            {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden />}
            {abierta ? "Guardar cambios" : "Abrir preventa"}
          </Button>
        </div>
      </form>

      <p className="text-xs text-muted-foreground">
        Lo pedido en preventa no descuenta stock. Cuando llegue la mercadería, lo encargado no se carga
        como stock: ya está vendido. Cargá solo lo que sobre.
      </p>

      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Cerrar la preventa</DialogTitle>
            <DialogDescription>
              Desde ahora {producto.nombre} se vende solo con el stock que tenga cargado. Lo que ya se
              pidió no cambia.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmando(false)} disabled={cerrando}>
              Volver
            </Button>
            <Button type="button" variant="danger" onClick={() => void cerrarAhora()} disabled={cerrando}>
              {cerrando && <LoaderCircle className="animate-spin" aria-hidden />}
              Cerrar ahora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
