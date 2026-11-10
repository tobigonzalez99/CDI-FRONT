"use client";

import { useId } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ExternalLink, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { Campo, CLASES_SELECT, CLASES_TEXTAREA } from "@/features/tienda/components/panel/campo";
import { EstadoProducto } from "@/features/tienda/components/panel/estado-producto";
import { FotosProducto } from "@/features/tienda/components/panel/fotos-producto";
import { HistorialStock } from "@/features/tienda/components/panel/historial-stock";
import { PreventaDeProducto } from "@/features/tienda/components/panel/preventa-producto";
import { TallesYStock } from "@/features/tienda/components/panel/talles-y-stock";
import {
  useActualizarProducto,
  useCategoriasAdmin,
  useProductoAdmin,
} from "@/features/tienda/hooks/use-tienda-admin";
import { aplicarFieldErrors, mensajeDeError } from "@/lib/api/errors";
import { datosProductoSchema, type DatosProductoFormValues } from "@/lib/validators/tienda";
import type { ProductoAdmin } from "@/types/tienda";

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border p-5 md:p-6">
      <h2 className="font-heading text-lg font-bold">{titulo}</h2>
      {descripcion && <p className="mt-0.5 text-sm text-muted-foreground">{descripcion}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DatosProducto({ producto }: { producto: ProductoAdmin }) {
  const id = useId();
  const { data: categorias = [] } = useCategoriasAdmin();
  const { mutateAsync: actualizar } = useActualizarProducto();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DatosProductoFormValues>({
    resolver: zodResolver(datosProductoSchema),
    values: {
      nombre: producto.nombre,
      categoriaId: producto.categoria.id,
      precio: producto.precio,
      descripcion: producto.descripcion,
      destacado: producto.destacado,
      activo: producto.activo,
    },
  });

  const onSubmit: SubmitHandler<DatosProductoFormValues> = async (valores) => {
    try {
      const actualizado = await actualizar({ id: producto.id, input: valores });
      reset(undefined, { keepValues: true });
      toast.success(
        actualizado.activo === producto.activo
          ? "Cambios guardados"
          : actualizado.activo
            ? "Producto publicado en la tienda"
            : "Producto desactivado: ya no se ve en la tienda",
      );
    } catch (error) {
      if (!aplicarFieldErrors(error, setError, ["nombre", "categoriaId", "precio", "descripcion"])) {
        toast.error("No pudimos guardar los cambios", { description: mensajeDeError(error) });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <Campo id={`${id}-nombre`} etiqueta="Nombre" error={errors.nombre?.message}>
        <Input id={`${id}-nombre`} className="h-10" aria-invalid={Boolean(errors.nombre)} {...register("nombre")} />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id={`${id}-categoria`} etiqueta="Categoría" error={errors.categoriaId?.message}>
          <select id={`${id}-categoria`} className={CLASES_SELECT} {...register("categoriaId")}>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id} disabled={!categoria.activa}>
                {categoria.nombre}
                {!categoria.activa && " (inactiva)"}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id={`${id}-precio`} etiqueta="Precio final" ayuda="Con impuestos." error={errors.precio?.message}>
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
        ayuda="Podés usar **negrita** y listas con guiones."
        error={errors.descripcion?.message}
      >
        <textarea id={`${id}-descripcion`} rows={5} className={CLASES_TEXTAREA} {...register("descripcion")} />
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden />}
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}

/** Todo lo de un producto en una pantalla: datos, fotos, talles, stock e historial. */
export function EditorProducto({ id }: { id: string }) {
  const { data: producto, isPending, isError, error, refetch } = useProductoAdmin(id);

  if (isPending) return <Cargando etiqueta="Cargando el producto…" />;
  if (isError) return <ErrorConsulta error={error} onReintentar={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/tienda/panel/productos"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Productos
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-bold">{producto.nombre}</h1>
            <EstadoProducto producto={producto} />
          </div>
        </div>
        {producto.activo && (
          <Link
            href={`/tienda/productos/${producto.slug}`}
            target="_blank"
            className={buttonVariants({ variant: "outline" })}
          >
            Ver en la tienda
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Seccion titulo="Datos">
            <DatosProducto producto={producto} />
          </Seccion>
          <Seccion
            titulo="Fotos"
            descripcion="La primera es la que se ve en la grilla. Cuadradas y de 600 px o más; hasta 10."
          >
            <FotosProducto producto={producto} />
          </Seccion>
        </div>

        <div className="space-y-6">
          <Seccion
            titulo={producto.tieneTalles ? "Talles y stock" : "Stock"}
            descripcion="Cargá el stock que tiene que quedar. Cada cambio queda en el historial con quién lo hizo."
          >
            <TallesYStock producto={producto} />
          </Seccion>
          {(producto.puedePreventa || producto.preventa?.activa) && (
            <Seccion
              titulo="Preventa"
              descripcion="Por un tiempo limitado, el producto se vende a pedido y el club encarga lo que se pidió."
            >
              <PreventaDeProducto producto={producto} />
            </Seccion>
          )}
          <Seccion titulo="Historial de stock">
            <HistorialStock productoId={producto.id} />
          </Seccion>
        </div>
      </div>
    </div>
  );
}
