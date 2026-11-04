"use client";

import { useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Campo, CLASES_SELECT, CLASES_TEXTAREA } from "@/features/tienda/components/panel/campo";
import { useCategoriasAdmin, useCrearProducto } from "@/features/tienda/hooks/use-tienda-admin";
import { aplicarFieldErrors, mensajeDeError } from "@/lib/api/errors";
import { nuevoProductoSchema, type NuevoProductoFormValues } from "@/lib/validators/tienda";
import { cn } from "@/lib/utils";

const TALLES_SUGERIDOS = ["S", "M", "L", "XL", "XXL"];

/**
 * Alta de un producto. Primero los datos y el stock inicial; las fotos se
 * suben después, en la ficha del producto, que es adonde lleva al guardar.
 */
export function FormularioNuevoProducto() {
  const id = useId();
  const router = useRouter();
  const { data: categorias = [] } = useCategoriasAdmin();
  const { mutateAsync: crear } = useCrearProducto();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NuevoProductoFormValues>({
    resolver: zodResolver(nuevoProductoSchema),
    defaultValues: {
      nombre: "",
      categoriaId: "",
      precio: Number.NaN,
      descripcion: "",
      destacado: false,
      activo: true,
      conTalles: true,
      talles: TALLES_SUGERIDOS.map((talle) => ({ talle, stock: 0 })),
      stockUnico: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "talles" });
  const conTalles = useWatch({ control, name: "conTalles" });

  const onSubmit: SubmitHandler<NuevoProductoFormValues> = async (valores) => {
    try {
      const producto = await crear({
        categoriaId: valores.categoriaId,
        nombre: valores.nombre,
        descripcion: valores.descripcion || undefined,
        precio: valores.precio,
        destacado: valores.destacado,
        activo: valores.activo,
        variantes: valores.conTalles
          ? valores.talles.map((fila) => ({ talle: fila.talle, stock: fila.stock }))
          : [{ stock: valores.stockUnico }],
      });

      toast.success("Producto creado", { description: "Ahora sumale las fotos." });
      router.push(`/tienda/panel/productos/${producto.id}`);
    } catch (error) {
      if (!aplicarFieldErrors(error, setError, ["nombre", "categoriaId", "precio", "descripcion"])) {
        toast.error("No pudimos crear el producto", { description: mensajeDeError(error) });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/tienda/panel/productos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Productos
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold">Nuevo producto</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid gap-8 rounded-2xl border p-5 md:p-8 lg:grid-cols-2"
      >
        <div className="grid content-start gap-4">
          <Campo id={`${id}-nombre`} etiqueta="Nombre" error={errors.nombre?.message}>
            <Input
              id={`${id}-nombre`}
              className="h-10"
              aria-invalid={Boolean(errors.nombre)}
              {...register("nombre")}
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id={`${id}-categoria`} etiqueta="Categoría" error={errors.categoriaId?.message}>
              <select
                id={`${id}-categoria`}
                className={CLASES_SELECT}
                aria-invalid={Boolean(errors.categoriaId)}
                {...register("categoriaId")}
              >
                <option value="">Elegí una</option>
                {categorias
                  .filter((categoria) => categoria.activa)
                  .map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
              </select>
            </Campo>

            <Campo
              id={`${id}-precio`}
              etiqueta="Precio final"
              ayuda="Con impuestos. El de socio se calcula solo."
              error={errors.precio?.message}
            >
              <Input
                id={`${id}-precio`}
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                className="h-10"
                aria-invalid={Boolean(errors.precio)}
                {...register("precio", { valueAsNumber: true })}
              />
            </Campo>
          </div>

          <Campo
            id={`${id}-descripcion`}
            etiqueta="Descripción"
            ayuda="Opcional. Podés usar **negrita** y listas con guiones."
            error={errors.descripcion?.message}
          >
            <textarea
              id={`${id}-descripcion`}
              rows={5}
              className={CLASES_TEXTAREA}
              aria-invalid={Boolean(errors.descripcion)}
              {...register("descripcion")}
            />
          </Campo>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4 accent-brand-red" {...register("destacado")} />
              Destacado en el inicio
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4 accent-brand-red" {...register("activo")} />
              Publicado en la tienda
            </label>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <fieldset>
            <legend className="text-sm font-medium">¿Se elige talle?</legend>
            <div className="mt-2 inline-flex rounded-lg border p-1" role="radiogroup">
              {[
                { valor: true, etiqueta: "Con talles" },
                { valor: false, etiqueta: "Sin talles" },
              ].map((opcion) => (
                <button
                  key={opcion.etiqueta}
                  type="button"
                  role="radio"
                  aria-checked={conTalles === opcion.valor}
                  onClick={() => setValue("conTalles", opcion.valor)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium",
                    conTalles === opcion.valor
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opcion.etiqueta}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Camisetas e indumentaria llevan talles; vasos, mates y accesorios, no. No se puede
              cambiar después.
            </p>
          </fieldset>

          {conTalles ? (
            <div>
              <p className="text-sm font-medium">Talles y stock inicial</p>
              <ul className="mt-2 space-y-2">
                {fields.map((fila, indice) => (
                  <li key={fila.id} className="flex items-start gap-2">
                    <div className="w-24">
                      <Input
                        aria-label={`Talle ${indice + 1}`}
                        className="h-10 uppercase"
                        aria-invalid={Boolean(errors.talles?.[indice]?.talle)}
                        {...register(`talles.${indice}.talle`)}
                      />
                      {errors.talles?.[indice]?.talle && (
                        <p className="mt-1 text-xs text-destructive">{errors.talles[indice].talle.message}</p>
                      )}
                    </div>
                    <div className="w-28">
                      <Input
                        aria-label={`Stock del talle ${indice + 1}`}
                        type="number"
                        min={0}
                        inputMode="numeric"
                        className="h-10"
                        aria-invalid={Boolean(errors.talles?.[indice]?.stock)}
                        {...register(`talles.${indice}.stock`, { valueAsNumber: true })}
                      />
                      {errors.talles?.[indice]?.stock && (
                        <p className="mt-1 text-xs text-destructive">{errors.talles[indice].stock.message}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-1"
                      aria-label={`Quitar el talle ${indice + 1}`}
                      onClick={() => remove(indice)}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
              {errors.talles?.root?.message || errors.talles?.message ? (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {errors.talles?.root?.message ?? errors.talles?.message}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => append({ talle: "", stock: 0 })}
              >
                <Plus aria-hidden />
                Agregar talle
              </Button>
            </div>
          ) : (
            <Campo id={`${id}-stock`} etiqueta="Stock inicial" error={errors.stockUnico?.message}>
              <Input
                id={`${id}-stock`}
                type="number"
                min={0}
                inputMode="numeric"
                className="h-10 w-32"
                aria-invalid={Boolean(errors.stockUnico)}
                {...register("stockUnico", { valueAsNumber: true })}
              />
            </Campo>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-5 lg:col-span-2">
          <Link href="/tienda/panel/productos" className={buttonVariants({ variant: "ghost", size: "lg" })}>
            Cancelar
          </Link>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden />}
            Crear producto
          </Button>
        </div>
      </form>
    </div>
  );
}
