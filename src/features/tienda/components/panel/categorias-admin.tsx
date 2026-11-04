"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, LoaderCircle, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import {
  useActualizarCategoria,
  useCategoriasAdmin,
  useCrearCategoria,
} from "@/features/tienda/hooks/use-tienda-admin";
import { mensajeDeError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { CategoriaTienda } from "@/types/tienda";

function FilaCategoria({
  categoria,
  anterior,
  siguiente,
}: {
  categoria: CategoriaTienda;
  anterior?: CategoriaTienda;
  siguiente?: CategoriaTienda;
}) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(categoria.nombre);
  const actualizar = useActualizarCategoria();

  async function guardar(cambios: Parameters<typeof actualizar.mutateAsync>[0], aviso: string) {
    try {
      await actualizar.mutateAsync(cambios);
      toast.success(aviso);
      return true;
    } catch (error) {
      toast.error("No pudimos guardar el cambio", { description: mensajeDeError(error) });
      return false;
    }
  }

  // Para mover, intercambia el orden con la vecina.
  async function mover(vecina: CategoriaTienda) {
    await guardar({ id: categoria.id, orden: vecina.orden }, "Orden actualizado");
    await actualizar.mutateAsync({ id: vecina.id, orden: categoria.orden }).catch(() => undefined);
  }

  return (
    <li className={cn("flex flex-wrap items-center gap-3 px-4 py-3", !categoria.activa && "bg-muted/50")}>
      <div className="flex flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Subir ${categoria.nombre}`}
          disabled={!anterior || actualizar.isPending}
          onClick={() => anterior && void mover(anterior)}
        >
          <ArrowUp aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Bajar ${categoria.nombre}`}
          disabled={!siguiente || actualizar.isPending}
          onClick={() => siguiente && void mover(siguiente)}
        >
          <ArrowDown aria-hidden />
        </Button>
      </div>

      <div className="min-w-0 flex-1">
        {editando ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(evento) => {
              evento.preventDefault();
              void guardar({ id: categoria.id, nombre: nombre.trim() }, "Nombre actualizado").then(
                (ok) => ok && setEditando(false),
              );
            }}
          >
            <Input
              aria-label="Nombre de la categoría"
              value={nombre}
              autoFocus
              onChange={(evento) => setNombre(evento.target.value)}
              className="h-9"
            />
            <Button type="submit" size="icon-sm" aria-label="Guardar el nombre" disabled={nombre.trim().length < 2}>
              <Check aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Cancelar"
              onClick={() => {
                setNombre(categoria.nombre);
                setEditando(false);
              }}
            >
              <X aria-hidden />
            </Button>
          </form>
        ) : (
          <>
            <p className="font-medium">
              {categoria.nombre}
              {!categoria.activa && <span className="ml-2 text-xs font-normal text-muted-foreground">Desactivada</span>}
            </p>
            <p className="text-xs text-muted-foreground">/{categoria.slug}</p>
          </>
        )}
      </div>

      {!editando && (
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditando(true)}>
            <Pencil aria-hidden />
            Renombrar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={actualizar.isPending}
            onClick={() =>
              void guardar(
                { id: categoria.id, activa: !categoria.activa },
                categoria.activa
                  ? `${categoria.nombre} desactivada: sus productos dejan de verse`
                  : `${categoria.nombre} activada`,
              )
            }
          >
            {categoria.activa ? "Desactivar" : "Activar"}
          </Button>
        </div>
      )}
    </li>
  );
}

/**
 * Categorías de la tienda: el menú de arriba, en este orden. No se borran: al
 * desactivar una, sus productos dejan de verse con ella.
 */
export function CategoriasAdmin() {
  const [nombre, setNombre] = useState("");
  const { data, isPending, isError, error, refetch } = useCategoriasAdmin();
  const crear = useCrearCategoria();

  async function alCrear(evento: React.FormEvent) {
    evento.preventDefault();
    try {
      const ultima = data?.at(-1);
      await crear.mutateAsync({ nombre: nombre.trim(), orden: (ultima?.orden ?? 0) + 1 });
      toast.success(`Categoría «${nombre.trim()}» creada`);
      setNombre("");
    } catch (problema) {
      toast.error("No pudimos crear la categoría", { description: mensajeDeError(problema) });
    }
  }

  const ordenadas = [...(data ?? [])].sort((a, b) => a.orden - b.orden);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Categorías</h1>
        <p className="text-sm text-muted-foreground">
          Son las del menú de la tienda, en este orden. Al desactivar una, sus productos dejan
          de verse.
        </p>
      </div>

      <form onSubmit={(evento) => void alCrear(evento)} className="flex max-w-md gap-2">
        <Input
          aria-label="Nombre de la categoría nueva"
          placeholder="Nueva categoría"
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          className="h-10"
        />
        <Button type="submit" size="lg" className="h-10" disabled={nombre.trim().length < 2 || crear.isPending}>
          {crear.isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : <Plus aria-hidden />}
          Crear
        </Button>
      </form>

      {isPending ? (
        <Cargando etiqueta="Cargando las categorías…" />
      ) : isError ? (
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      ) : ordenadas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay categorías.</p>
      ) : (
        <ul className="max-w-2xl divide-y rounded-xl border">
          {ordenadas.map((categoria, indice) => (
            <FilaCategoria
              key={categoria.id}
              categoria={categoria}
              anterior={ordenadas[indice - 1]}
              siguiente={ordenadas[indice + 1]}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
