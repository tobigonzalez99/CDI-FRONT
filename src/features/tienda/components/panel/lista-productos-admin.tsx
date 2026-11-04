"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { FotoProducto } from "@/features/tienda/components/foto-producto";
import { EstadoProducto, StockPorTalle } from "@/features/tienda/components/panel/estado-producto";
import { useCategoriasAdmin, useProductosAdmin } from "@/features/tienda/hooks/use-tienda-admin";
import { useDebounce } from "@/hooks/use-debounce";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";

const CLASES_SELECT = "h-9 rounded-lg border bg-background px-2 text-sm";

type VistaEstado = "activos" | "inactivos" | "todos";

/** Productos del panel, con el stock exacto de cada talle. */
export function ListaProductosAdmin() {
  const [texto, setTexto] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [estado, setEstado] = useState<VistaEstado>("activos");
  const [stockBajo, setStockBajo] = useState(false);
  const [pagina, setPagina] = useState(1);
  const buscar = useDebounce(texto.trim());

  const { data: categorias = [] } = useCategoriasAdmin();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProductosAdmin({
    page: pagina,
    pageSize: 20,
    buscar: buscar || undefined,
    categoriaId: categoriaId || undefined,
    activo: estado === "todos" ? undefined : estado === "activos",
    stockBajo: stockBajo || undefined,
  });

  // Cualquier filtro nuevo vuelve a la primera página.
  function filtrar<T>(setter: (valor: T) => void) {
    return (valor: T) => {
      setter(valor);
      setPagina(1);
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Cargá productos, sus fotos y el stock de cada talle. Nada se borra: un producto
            que ya no se vende se desactiva y deja de verse en la tienda.
          </p>
        </div>
        <Link href="/tienda/panel/productos/nuevo" className={cn(buttonVariants({ size: "lg" }), "h-10")}>
          <Plus className="size-4" aria-hidden />
          Nuevo producto
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            aria-label="Buscar productos"
            placeholder="Buscar por nombre"
            value={texto}
            onChange={(evento) => filtrar(setTexto)(evento.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <select
          aria-label="Categoría"
          value={categoriaId}
          onChange={(evento) => filtrar(setCategoriaId)(evento.target.value)}
          className={CLASES_SELECT}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
              {!categoria.activa && " (inactiva)"}
            </option>
          ))}
        </select>
        <select
          aria-label="Estado"
          value={estado}
          onChange={(evento) => filtrar(setEstado)(evento.target.value as VistaEstado)}
          className={CLASES_SELECT}
        >
          <option value="activos">Activos</option>
          <option value="inactivos">Desactivados</option>
          <option value="todos">Todos</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={stockBajo}
            onChange={(evento) => filtrar(setStockBajo)(evento.target.checked)}
            className="size-4 accent-brand-red"
          />
          Solo con poco stock
        </label>
      </div>

      {isPending ? (
        <Cargando etiqueta="Cargando los productos…" />
      ) : isError ? (
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      ) : data.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">
          {buscar || categoriaId || stockBajo || estado !== "activos"
            ? "Ningún producto coincide con esos filtros."
            : "Todavía no hay productos. Cargá el primero con «Nuevo producto»."}
        </div>
      ) : (
        <>
          <div className={cn("overflow-x-auto rounded-xl border", isPlaceholderData && "opacity-60")}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Editar</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell>
                      <FotoProducto
                        imagen={producto.imagenes[0] ?? null}
                        alt=""
                        sizes="44px"
                        className="w-11 rounded-md"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/tienda/panel/productos/${producto.id}`} className="hover:underline">
                        {producto.nombre}
                      </Link>
                    </TableCell>
                    <TableCell>{producto.categoria.nombre}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatearMonto(producto.precio)}
                    </TableCell>
                    <TableCell>
                      <StockPorTalle producto={producto} />
                    </TableCell>
                    <TableCell>
                      <EstadoProducto producto={producto} />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/tienda/panel/productos/${producto.id}`}
                        aria-label={`Editar ${producto.nombre}`}
                        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                      >
                        <Pencil aria-hidden />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {data.total} productos · página {data.page} de {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>
                  <ChevronLeft className="size-4" aria-hidden />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagina >= data.totalPages}
                  onClick={() => setPagina(pagina + 1)}
                >
                  Siguiente
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
