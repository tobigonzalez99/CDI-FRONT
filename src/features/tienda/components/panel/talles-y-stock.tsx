"use client";

import { useEffect, useId, useState } from "react";
import { useFieldArray, useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Campo, CLASES_SELECT } from "@/features/tienda/components/panel/campo";
import { SelectorTipoTalle } from "@/features/tienda/components/panel/selector-tipo-talle";
import {
  useActualizarVariante,
  useAgregarTalle,
  useEliminarTalle,
  useMoverStock,
} from "@/features/tienda/hooks/use-tienda-admin";
import { aplicarTipoTalle } from "@/features/tienda/lib/talles";
import { mensajeDeError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { tallesStockSchema, type TallesStockFormValues } from "@/lib/validators/tienda";
import type { ProductoAdmin } from "@/types/tienda";

function valoresDe(producto: ProductoAdmin): TallesStockFormValues {
  return {
    conTalles: producto.tieneTalles,
    filas: producto.variantes.map((variante) => ({
      varianteId: variante.id,
      talle: variante.talle ?? "",
      stock: variante.stock,
      activa: variante.activa,
    })),
    motivo: "INGRESO",
    observaciones: "",
  };
}

/** Un producto sin talles se convierte al cargarle el primero. */
function AgregarPrimerTalle({ productoId }: { productoId: string }) {
  const [talle, setTalle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: agregar, isPending } = useAgregarTalle();

  async function alAgregar(evento: React.FormEvent) {
    evento.preventDefault();
    const limpio = talle.trim().replace(/\s+/g, " ").toUpperCase();
    if (!limpio) {
      setError("Ingresá el talle");
      return;
    }
    try {
      await agregar({ productoId, talle: limpio });
      toast.success(`Talle ${limpio} agregado`);
      setTalle("");
      setError(null);
    } catch (problema) {
      setError(mensajeDeError(problema));
    }
  }

  return (
    <form onSubmit={(evento) => void alAgregar(evento)} className="border-t pt-4">
      <p className="text-sm font-medium">Pasar a talles</p>
      <p className="text-xs text-muted-foreground">El stock actual queda en el primer talle que cargues.</p>
      <div className="mt-2 flex flex-wrap items-start gap-2">
        <Input
          aria-label="Primer talle"
          placeholder="Talle"
          maxLength={20}
          value={talle}
          onChange={(evento) => setTalle(evento.target.value)}
          className="h-9 w-28 uppercase"
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

/**
 * Talles y stock de un producto, con las mismas filas que el alta. Se carga el
 * stock que tiene que quedar y al guardar se manda la diferencia: la API la
 * suma, así no pisa una venta que entre mientras se edita, y queda en el
 * historial.
 */
export function TallesYStock({ producto }: { producto: ProductoAdmin }) {
  const id = useId();
  const { mutateAsync: actualizarVariante } = useActualizarVariante();
  const { mutateAsync: agregarTalle } = useAgregarTalle();
  const { mutateAsync: eliminarTalle } = useEliminarTalle();
  const { mutateAsync: moverStock } = useMoverStock();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting, defaultValues },
  } = useForm<TallesStockFormValues>({
    resolver: zodResolver(tallesStockSchema),
    defaultValues: valoresDe(producto),
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: "filas", keyName: "clave" });
  const filas = useWatch({ control, name: "filas" });

  // Sin cambios a medio cargar, muestra lo último que hay (una venta, por ejemplo).
  useEffect(() => {
    if (!isDirty) reset(valoresDe(producto));
  }, [producto, isDirty, reset]);

  const base = defaultValues?.filas ?? [];
  const anteriorDe = (varianteId?: string) => base.find((fila) => fila?.varianteId === varianteId);

  const diferencia = (fila: { varianteId?: string; stock: number }) => {
    const anterior = fila.varianteId ? anteriorDe(fila.varianteId) : undefined;
    if (anterior?.stock === undefined || !Number.isFinite(fila.stock)) return 0;
    return fila.stock - anterior.stock;
  };

  const diferencias = filas.map(diferencia);
  const quitados = base.filter(
    (anterior) => !filas.some((fila) => fila.varianteId === anterior?.varianteId),
  );

  const onSubmit: SubmitHandler<TallesStockFormValues> = async (valores) => {
    const cambios: (() => Promise<ProductoAdmin>)[] = [];
    const nuevos: (() => Promise<ProductoAdmin>)[] = [];

    for (const fila of valores.filas) {
      const { varianteId } = fila;
      if (!varianteId) {
        nuevos.push(() => agregarTalle({ productoId: producto.id, talle: fila.talle, stock: fila.stock }));
        continue;
      }

      const anterior = anteriorDe(varianteId);
      if (valores.conTalles && fila.talle !== anterior?.talle) {
        cambios.push(() => actualizarVariante({ id: varianteId, talle: fila.talle }));
      }
      if (fila.activa !== anterior?.activa) {
        cambios.push(() => actualizarVariante({ id: varianteId, activa: fila.activa }));
      }
      const cantidad = diferencia(fila);
      if (cantidad !== 0) {
        cambios.push(() =>
          moverStock({
            varianteId,
            cantidad,
            // Si baja no entró mercadería: solo puede ser una corrección.
            motivo: cantidad > 0 ? valores.motivo : "AJUSTE",
            observaciones: valores.observaciones || undefined,
          }),
        );
      }
    }

    // Lo que se quita va último: un producto no puede quedarse sin talles en el medio.
    const eliminados = quitados.flatMap((fila) => {
      const varianteId = fila?.varianteId;
      return varianteId ? [() => eliminarTalle(varianteId)] : [];
    });

    let ultimo: ProductoAdmin | null = null;
    try {
      for (const paso of [...cambios, ...nuevos, ...eliminados]) ultimo = await paso();
    } catch (error) {
      toast.error(ultimo ? "Se guardó solo una parte de los cambios" : "No pudimos guardar los cambios", {
        description: mensajeDeError(error),
      });
      if (ultimo) reset(valoresDe(ultimo));
      return;
    }

    toast.success("Talles y stock actualizados");
    reset(valoresDe(ultimo ?? producto));
  };

  const hayIngreso = diferencias.some((cantidad) => cantidad > 0);
  const hayCambioDeStock = diferencias.some((cantidad) => cantidad !== 0);
  const total = filas.reduce((suma, fila) => suma + (Number.isFinite(fila.stock) ? fila.stock : 0), 0);
  const errorFilas = errors.filas?.root?.message ?? errors.filas?.message;

  return (
    <div className="grid gap-4">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
        {producto.tieneTalles && (
          <SelectorTipoTalle
            talles={filas.map((fila) => fila.talle)}
            onElegir={(tipo) =>
              replace(
                aplicarTipoTalle(getValues("filas"), tipo, (talle) => ({ talle, stock: 0, activa: true })),
              )
            }
          />
        )}

        <div>
          {producto.tieneTalles && (
            <div className="mb-1 flex gap-2 text-xs font-medium text-muted-foreground">
              <span className="w-28">Talle</span>
              <span className="w-24">Stock</span>
            </div>
          )}
          <ul className="space-y-2">
            {fields.map((campo, indice) => {
              const fila = filas[indice];
              const cantidad = diferencias[indice] ?? 0;
              const activa = fila?.activa ?? true;
              return (
                <li key={campo.clave} className="flex flex-wrap items-start gap-2">
                  {producto.tieneTalles && (
                    <div className="w-28">
                      <Input
                        aria-label={`Talle ${indice + 1}`}
                        maxLength={20}
                        className={cn("h-10 uppercase", !activa && "opacity-60")}
                        aria-invalid={Boolean(errors.filas?.[indice]?.talle)}
                        {...register(`filas.${indice}.talle`)}
                      />
                      {errors.filas?.[indice]?.talle && (
                        <p className="mt-1 text-xs text-destructive">{errors.filas[indice].talle.message}</p>
                      )}
                    </div>
                  )}
                  <div className="w-24">
                    <Input
                      aria-label={producto.tieneTalles ? `Stock del talle ${indice + 1}` : "Stock"}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      className={cn("h-10", !activa && "opacity-60")}
                      aria-invalid={Boolean(errors.filas?.[indice]?.stock)}
                      {...register(`filas.${indice}.stock`, { valueAsNumber: true })}
                    />
                    {errors.filas?.[indice]?.stock && (
                      <p className="mt-1 text-xs text-destructive">{errors.filas[indice].stock.message}</p>
                    )}
                  </div>
                  {producto.tieneTalles && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-1"
                        title={activa ? "Dejar de ofrecer este talle" : "Volver a ofrecer este talle"}
                        aria-label={`${activa ? "Ocultar" : "Mostrar"} el talle ${fila?.talle ?? indice + 1}`}
                        aria-pressed={!activa}
                        onClick={() => setValue(`filas.${indice}.activa`, !activa, { shouldDirty: true })}
                      >
                        {activa ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-1"
                        aria-label={`Quitar el talle ${fila?.talle ?? indice + 1}`}
                        onClick={() => remove(indice)}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </>
                  )}
                  <span className="mt-3 text-xs">
                    {cantidad !== 0 && (
                      <span
                        className={cn(
                          "font-medium tabular-nums",
                          cantidad > 0 ? "text-emerald-700" : "text-destructive",
                        )}
                      >
                        {cantidad > 0 ? `+${cantidad}` : `−${-cantidad}`}
                      </span>
                    )}
                    {!activa && <span className="ml-1 text-muted-foreground">Oculto: no se ofrece</span>}
                  </span>
                </li>
              );
            })}
          </ul>

          {errorFilas && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {errorFilas}
            </p>
          )}

          {producto.tieneTalles && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => append({ talle: "", stock: 0, activa: true })}
            >
              <Plus aria-hidden />
              Agregar talle
            </Button>
          )}

          <p className="mt-3 text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground tabular-nums">{total}</span>
          </p>
        </div>

        {quitados.length > 0 && (
          <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
            Al guardar se quita{quitados.length > 1 ? "n" : ""}:{" "}
            {quitados.map((fila) => `${fila?.talle} (${fila?.stock ?? 0} en stock)`).join(", ")}. Si ya tuvo
            ventas, queda oculto y vuelve al cargar de nuevo ese talle.
          </p>
        )}

        {hayCambioDeStock && (
          <div className="grid gap-4 sm:grid-cols-2">
            {hayIngreso && (
              <Campo id={`${id}-motivo`} etiqueta="Motivo de lo que entra">
                <select id={`${id}-motivo`} className={CLASES_SELECT} {...register("motivo")}>
                  <option value="INGRESO">Ingreso de mercadería</option>
                  <option value="AJUSTE">Ajuste o corrección</option>
                </select>
              </Campo>
            )}
            <Campo
              id={`${id}-obs`}
              etiqueta="Observaciones"
              ayuda="Opcional. Queda en el historial."
              error={errors.observaciones?.message}
            >
              <Input id={`${id}-obs`} className="h-10" {...register("observaciones")} />
            </Campo>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={!isDirty || isSubmitting}
            onClick={() => reset(valoresDe(producto))}
          >
            Descartar
          </Button>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden />}
            Guardar talles y stock
          </Button>
        </div>
      </form>

      {!producto.tieneTalles && <AgregarPrimerTalle productoId={producto.id} />}
    </div>
  );
}
