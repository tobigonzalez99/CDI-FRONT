"use client";

import { useId, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownUp, LoaderCircle, Plus } from "lucide-react";
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
import { Campo, CLASES_SELECT } from "@/features/tienda/components/panel/campo";
import {
  useActualizarVariante,
  useAgregarTalle,
  useMoverStock,
} from "@/features/tienda/hooks/use-tienda-admin";
import { aplicarFieldErrors, mensajeDeError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { movimientoStockSchema, type MovimientoStockFormValues } from "@/lib/validators/tienda";
import type { Disponibilidad, ProductoAdmin, VarianteAdmin } from "@/types/tienda";

const ETIQUETA_DISPONIBILIDAD: Record<Disponibilidad, { texto: string; clase: string }> = {
  DISPONIBLE: { texto: "Disponible", clase: "text-emerald-700" },
  ULTIMAS_UNIDADES: { texto: "Últimas unidades", clase: "text-amber-700" },
  SIN_STOCK: { texto: "Sin stock", clase: "text-destructive" },
};

/**
 * Movimiento de stock: entra mercadería o se corrige un error. Se carga la
 * cantidad en positivo y se elige si entra o sale: es más claro que pedir un
 * número negativo.
 */
function MoverStockDialog({
  variante,
  onClose,
}: {
  variante: VarianteAdmin | null;
  onClose: () => void;
}) {
  const id = useId();
  const { mutateAsync: mover } = useMoverStock();

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MovimientoStockFormValues>({
    resolver: zodResolver(movimientoStockSchema),
    defaultValues: { tipo: "ENTRA", cantidad: Number.NaN, motivo: "INGRESO", observaciones: "" },
  });

  const tipo = useWatch({ control, name: "tipo" });
  const cantidad = useWatch({ control, name: "cantidad" });
  const resultado =
    variante && Number.isFinite(cantidad)
      ? variante.stock + (tipo === "ENTRA" ? cantidad : -cantidad)
      : null;

  function cerrar() {
    reset();
    onClose();
  }

  const onSubmit: SubmitHandler<MovimientoStockFormValues> = async (valores) => {
    if (!variante) return;
    try {
      await mover({
        varianteId: variante.id,
        cantidad: valores.tipo === "ENTRA" ? valores.cantidad : -valores.cantidad,
        motivo: valores.motivo,
        observaciones: valores.observaciones || undefined,
      });
      toast.success("Stock actualizado");
      cerrar();
    } catch (error) {
      if (!aplicarFieldErrors(error, setError, ["cantidad", "motivo", "observaciones"])) {
        toast.error("No pudimos cambiar el stock", { description: mensajeDeError(error) });
      }
    }
  };

  return (
    <Dialog open={Boolean(variante)} onOpenChange={(abierto) => !abierto && cerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Cambiar stock{variante?.talle && ` · talle ${variante.talle}`}
          </DialogTitle>
          <DialogDescription>Hoy hay {variante?.stock ?? 0}. El cambio queda en el historial.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Campo id={`${id}-tipo`} etiqueta="Movimiento">
              <select id={`${id}-tipo`} className={CLASES_SELECT} {...register("tipo")}>
                <option value="ENTRA">Entra</option>
                <option value="SALE">Sale</option>
              </select>
            </Campo>
            <Campo id={`${id}-cantidad`} etiqueta="Cantidad" error={errors.cantidad?.message}>
              <Input
                id={`${id}-cantidad`}
                type="number"
                min={1}
                inputMode="numeric"
                autoFocus
                className="h-10"
                aria-invalid={Boolean(errors.cantidad)}
                {...register("cantidad", { valueAsNumber: true })}
              />
            </Campo>
          </div>

          <Campo id={`${id}-motivo`} etiqueta="Motivo">
            <select id={`${id}-motivo`} className={CLASES_SELECT} {...register("motivo")}>
              <option value="INGRESO">Ingreso de mercadería</option>
              <option value="AJUSTE">Ajuste o corrección</option>
            </select>
          </Campo>

          <Campo
            id={`${id}-obs`}
            etiqueta="Observaciones"
            ayuda="Opcional. Por ejemplo: «Llegó la segunda tanda» o «Se contó de nuevo»."
            error={errors.observaciones?.message}
          >
            <Input id={`${id}-obs`} className="h-10" {...register("observaciones")} />
          </Campo>

          {resultado !== null && (
            <p className={cn("text-sm", resultado < 0 ? "text-destructive" : "text-muted-foreground")}>
              {resultado < 0
                ? `No alcanza: hay ${variante?.stock ?? 0}.`
                : `Queda en ${resultado}.`}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={cerrar} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || (resultado !== null && resultado < 0)}>
              {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AgregarTalle({ productoId }: { productoId: string }) {
  const [talle, setTalle] = useState("");
  const [stock, setStock] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: agregar, isPending } = useAgregarTalle();

  async function alAgregar(evento: React.FormEvent) {
    evento.preventDefault();
    const limpio = talle.trim().toUpperCase();
    if (!limpio) {
      setError("Ingresá el talle");
      return;
    }
    try {
      await agregar({ productoId, talle: limpio, stock: Number(stock) || 0 });
      toast.success(`Talle ${limpio} agregado`);
      setTalle("");
      setStock("0");
      setError(null);
    } catch (problema) {
      setError(mensajeDeError(problema));
    }
  }

  return (
    <form onSubmit={(evento) => void alAgregar(evento)} className="mt-4 border-t pt-4">
      <p className="text-sm font-medium">Agregar un talle</p>
      <div className="mt-2 flex flex-wrap items-start gap-2">
        <Input
          aria-label="Talle nuevo"
          placeholder="Talle"
          value={talle}
          onChange={(evento) => setTalle(evento.target.value)}
          className="h-9 w-24 uppercase"
        />
        <Input
          aria-label="Stock inicial del talle nuevo"
          type="number"
          min={0}
          inputMode="numeric"
          value={stock}
          onChange={(evento) => setStock(evento.target.value)}
          className="h-9 w-24"
        />
        <Button type="submit" variant="outline" size="lg" disabled={isPending}>
          {isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : <Plus aria-hidden />}
          Agregar
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}

export function TallesYStock({ producto }: { producto: ProductoAdmin }) {
  const [aMover, setAMover] = useState<VarianteAdmin | null>(null);
  const { mutateAsync: actualizarVariante, isPending } = useActualizarVariante();

  async function cambiarActiva(variante: VarianteAdmin) {
    try {
      await actualizarVariante({ id: variante.id, activa: !variante.activa });
      toast.success(variante.activa ? `Talle ${variante.talle} desactivado` : `Talle ${variante.talle} activado`);
    } catch (error) {
      toast.error("No pudimos cambiar el talle", { description: mensajeDeError(error) });
    }
  }

  return (
    <div>
      <ul className="divide-y rounded-xl border">
        {producto.variantes.map((variante) => {
          const disponibilidad = ETIQUETA_DISPONIBILIDAD[variante.disponibilidad];
          return (
            <li
              key={variante.id}
              className={cn("flex flex-wrap items-center gap-3 px-4 py-3", !variante.activa && "bg-muted/50")}
            >
              {producto.tieneTalles && (
                <span className="w-12 font-heading text-lg font-bold">{variante.talle}</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium tabular-nums">{variante.stock} en stock</p>
                <p className={cn("text-xs", variante.activa ? disponibilidad.clase : "text-muted-foreground")}>
                  {variante.activa ? disponibilidad.texto : "Desactivado: no se ofrece"}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setAMover(variante)}>
                <ArrowDownUp aria-hidden />
                Cambiar stock
              </Button>
              {producto.tieneTalles && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => void cambiarActiva(variante)}
                >
                  {variante.activa ? "Desactivar" : "Activar"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-2 text-sm text-muted-foreground">
        Total: <span className="font-medium text-foreground tabular-nums">{producto.stockTotal}</span>
      </p>

      {producto.tieneTalles && <AgregarTalle productoId={producto.id} />}

      <MoverStockDialog variante={aMover} onClose={() => setAMover(null)} />
    </div>
  );
}
