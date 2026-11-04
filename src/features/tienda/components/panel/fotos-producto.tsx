"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmarDialog } from "@/components/shared/confirmar-dialog";
import { FotoProducto } from "@/features/tienda/components/foto-producto";
import {
  useBorrarImagen,
  useOrdenarImagenes,
  useSubirImagenes,
} from "@/features/tienda/hooks/use-tienda-admin";
import { esApiError, mensajeDeError } from "@/lib/api/errors";
import type { ImagenProducto, ProductoAdmin } from "@/types/tienda";

const MAXIMO_FOTOS = 10;
const MAXIMO_BYTES = 8 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

/**
 * Fotos de un producto: subir varias a la vez, ordenarlas con las flechas y
 * quitarlas. La API las re-codifica y valida el tamaño mínimo; acá se frena
 * antes lo que seguro va a rechazar, para no hacer esperar la subida.
 */
export function FotosProducto({ producto }: { producto: ProductoAdmin }) {
  const input = useRef<HTMLInputElement>(null);
  const [aQuitar, setAQuitar] = useState<ImagenProducto | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  const subir = useSubirImagenes();
  const ordenar = useOrdenarImagenes();
  const borrar = useBorrarImagen();

  const imagenes = producto.imagenes;
  const lugar = MAXIMO_FOTOS - imagenes.length;

  async function alElegir(archivos: FileList | null) {
    if (!archivos || archivos.length === 0) return;
    const lista = Array.from(archivos);
    if (input.current) input.current.value = "";

    const problemas: string[] = [];
    if (lista.length > lugar) {
      problemas.push(`Entran ${lugar} fotos más: el máximo es ${MAXIMO_FOTOS} por producto.`);
    }
    lista.forEach((archivo) => {
      if (!TIPOS.includes(archivo.type)) problemas.push(`${archivo.name}: tiene que ser JPG, PNG o WebP.`);
      else if (archivo.size > MAXIMO_BYTES) problemas.push(`${archivo.name}: pesa más de 8 MB.`);
    });
    setErrores(problemas);
    if (problemas.length > 0) return;

    try {
      await subir.mutateAsync({ productoId: producto.id, archivos: lista });
      toast.success(lista.length === 1 ? "Foto agregada" : `${lista.length} fotos agregadas`);
    } catch (error) {
      // La API dice cuál foto falló y por qué.
      if (esApiError(error) && error.fieldErrors?.imagenes) {
        setErrores(error.fieldErrors.imagenes);
      } else {
        toast.error("No pudimos subir las fotos", { description: mensajeDeError(error) });
      }
    }
  }

  async function mover(indice: number, hacia: -1 | 1) {
    const ids = imagenes.map((imagen) => imagen.id);
    [ids[indice], ids[indice + hacia]] = [ids[indice + hacia], ids[indice]];
    try {
      await ordenar.mutateAsync({ productoId: producto.id, ids });
    } catch (error) {
      toast.error("No pudimos cambiar el orden", { description: mensajeDeError(error) });
    }
  }

  async function quitar() {
    if (!aQuitar) return;
    try {
      await borrar.mutateAsync(aQuitar.id);
      toast.success("Foto quitada");
      setAQuitar(null);
    } catch (error) {
      toast.error("No pudimos quitar la foto", { description: mensajeDeError(error) });
    }
  }

  const ocupado = subir.isPending || ordenar.isPending || borrar.isPending;

  return (
    <div className="space-y-4">
      {imagenes.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          Todavía no tiene fotos: en la tienda se ve un recuadro gris.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {imagenes.map((imagen, indice) => (
            <li key={imagen.id} className="space-y-1.5">
              <div className="relative">
                <FotoProducto imagen={imagen} alt={`Foto ${indice + 1}`} sizes="120px" className="rounded-lg" />
                {indice === 0 && (
                  <span className="absolute top-1 left-1 rounded bg-brand-black px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Principal
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Mover la foto ${indice + 1} antes`}
                  disabled={indice === 0 || ocupado}
                  onClick={() => void mover(indice, -1)}
                >
                  <ArrowLeft aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Quitar la foto ${indice + 1}`}
                  className="text-destructive hover:text-destructive"
                  disabled={ocupado}
                  onClick={() => setAQuitar(imagen)}
                >
                  <Trash2 aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Mover la foto ${indice + 1} después`}
                  disabled={indice === imagenes.length - 1 || ocupado}
                  onClick={() => void mover(indice, 1)}
                >
                  <ArrowRight aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {errores.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {errores.map((mensaje) => (
            <li key={mensaje}>{mensaje}</li>
          ))}
        </ul>
      )}

      <input
        ref={input}
        type="file"
        accept={TIPOS.join(",")}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(evento) => void alElegir(evento.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        disabled={lugar <= 0 || ocupado}
        onClick={() => input.current?.click()}
      >
        {subir.isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : <ImagePlus aria-hidden />}
        {subir.isPending ? "Subiendo…" : lugar <= 0 ? "Ya tiene 10 fotos" : "Agregar fotos"}
      </Button>

      <ConfirmarDialog
        open={Boolean(aQuitar)}
        onOpenChange={(abierto) => !abierto && setAQuitar(null)}
        titulo="¿Quitar esta foto?"
        descripcion="Se borra del producto y de la tienda. Si la necesitás de nuevo, la tenés que volver a subir."
        textoConfirmar="Quitar la foto"
        ejecutando={borrar.isPending}
        onConfirmar={() => void quitar()}
      />
    </div>
  );
}
