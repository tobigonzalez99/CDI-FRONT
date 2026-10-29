"use client";

import { Check, LoaderCircle, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/** Fila de solo lectura de la ficha. */
export function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm break-words">{valor}</dd>
    </div>
  );
}

interface CampoProps {
  id: string;
  etiqueta: string;
  /** Aclaración bajo el campo, antes del error. Para avisos, no para repetir la etiqueta. */
  ayuda?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

/**
 * Campo de formulario con su etiqueta, su ayuda y su error.
 *
 * El control lo pasa quien lo usa (texto, fecha, desplegable), pero tiene que
 * llevar el `id` y el `aria-describedby` que se arman acá.
 */
export function Campo({ id, etiqueta, ayuda, error, children }: CampoProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {ayuda && (
        <p id={`${id}-ayuda`} className="text-xs text-muted-foreground">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** `aria-describedby` del campo: apunta al error si lo hay, y si no a la ayuda. */
export function descripcionDe(id: string, hayError: boolean, hayAyuda = false) {
  if (hayError) return `${id}-error`;
  return hayAyuda ? `${id}-ayuda` : undefined;
}

interface BloqueEditableProps {
  titulo: string;
  /** Vista de solo lectura, que es como arranca el bloque. */
  lectura: React.ReactNode;
  /** Campos del formulario; reemplazan a la lectura mientras se edita. */
  edicion: React.ReactNode;
  editando: boolean;
  guardando: boolean;
  onEditar: () => void;
  onCancelar: () => void;
  /** Ya envuelto en el `handleSubmit` del formulario. */
  onGuardar: React.FormEventHandler<HTMLFormElement>;
}

/**
 * Un tramo de la ficha que se puede editar por separado.
 *
 * Cada bloque tiene su propio botón y se guarda solo, en lugar de un único
 * formulario con toda la ficha: el administrador entra a corregir un dato
 * puntual, y así toca nada más que esa parte. Los bloques son independientes
 * entre sí, de modo que abrir uno nunca descarta lo que se escribió en otro.
 */
export function BloqueEditable({
  titulo,
  lectura,
  edicion,
  editando,
  guardando,
  onEditar,
  onCancelar,
  onGuardar,
}: BloqueEditableProps) {
  return (
    <section className="border-t pt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-base font-bold">{titulo}</h3>

        {!editando && (
          <Button variant="outline" size="sm" onClick={onEditar}>
            <Pencil aria-hidden />
            Editar
          </Button>
        )}
      </div>

      {editando ? (
        <form onSubmit={onGuardar} noValidate className="mt-4 grid gap-4">
          {edicion}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onCancelar}
              disabled={guardando}
            >
              Cancelar
            </Button>

            <Button type="submit" size="lg" disabled={guardando}>
              {guardando ? (
                <LoaderCircle className="animate-spin" aria-hidden />
              ) : (
                <Check aria-hidden />
              )}
              Guardar cambios
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4">{lectura}</div>
      )}
    </section>
  );
}
