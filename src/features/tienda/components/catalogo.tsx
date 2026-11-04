"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TarjetaProducto } from "@/features/tienda/components/tarjeta-producto";
import { CATEGORIAS, PRODUCTOS, categoriaPorSlug, stockTotal } from "@/features/tienda/maqueta/datos";
import { cn } from "@/lib/utils";

const TALLES = ["S", "M", "L", "XL", "XXL"];

const RANGOS = [
  { valor: "hasta-20", etiqueta: "Hasta $ 20.000", desde: 0, hasta: 20000 },
  { valor: "20-50", etiqueta: "$ 20.000 a $ 50.000", desde: 20000, hasta: 50000 },
  { valor: "mas-50", etiqueta: "Más de $ 50.000", desde: 50000, hasta: Infinity },
];

const ORDENES = [
  { valor: "destacados", etiqueta: "Destacados" },
  { valor: "menor", etiqueta: "Menor precio" },
  { valor: "mayor", etiqueta: "Mayor precio" },
];

function Chip({
  activo,
  onClick,
  children,
  tachado = false,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tachado?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        activo
          ? "border-brand-black bg-brand-black text-white"
          : "hover:border-foreground/40",
        tachado && "line-through",
      )}
    >
      {children}
    </button>
  );
}

/** Filtros por categoría, talle y precio. En la URL, para poder compartir el enlace. */
export function Catalogo() {
  const router = useRouter();
  const params = useSearchParams();
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const categoria = params.get("categoria");
  const talle = params.get("talle");
  const rango = params.get("precio");
  const orden = params.get("orden") ?? "destacados";

  function cambiar(clave: string, valor: string | null) {
    const nuevos = new URLSearchParams(params);
    if (valor === null || nuevos.get(clave) === valor) nuevos.delete(clave);
    else nuevos.set(clave, valor);
    router.replace(`/tienda/productos?${nuevos.toString()}`, { scroll: false });
  }

  const rangoElegido = RANGOS.find((item) => item.valor === rango);

  const productos = PRODUCTOS.filter((producto) => !categoria || producto.categoria === categoria)
    .filter(
      (producto) =>
        !talle || producto.talles.some((item) => item.talle === talle && item.stock > 0),
    )
    .filter(
      (producto) =>
        !rangoElegido ||
        (producto.precio >= rangoElegido.desde && producto.precio < rangoElegido.hasta),
    )
    .sort((a, b) => {
      // Lo agotado siempre al final: está para que se vea, no para tapar lo que hay.
      const agotado = Number(stockTotal(a) === 0) - Number(stockTotal(b) === 0);
      if (agotado !== 0) return agotado;
      if (orden === "menor") return a.precio - b.precio;
      if (orden === "mayor") return b.precio - a.precio;
      return Number(Boolean(b.destacado)) - Number(Boolean(a.destacado));
    });

  const cantidadFiltros = [categoria, talle, rango].filter(Boolean).length;

  const filtros = (
    <div className="space-y-7">
      <fieldset>
        <legend className="text-sm font-semibold">Categoría</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIAS.map((item) => (
            <Chip
              key={item.slug}
              activo={categoria === item.slug}
              onClick={() => cambiar("categoria", item.slug)}
            >
              {item.nombre}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Talle</legend>
        <p className="mt-1 text-xs text-muted-foreground">Solo camisetas e indumentaria.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TALLES.map((item) => (
            <Chip key={item} activo={talle === item} onClick={() => cambiar("talle", item)}>
              {item}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Precio</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {RANGOS.map((item) => (
            <Chip
              key={item.valor}
              activo={rango === item.valor}
              onClick={() => cambiar("precio", item.valor)}
            >
              {item.etiqueta}
            </Chip>
          ))}
        </div>
      </fieldset>
    </div>
  );

  const titulo = categoria ? (categoriaPorSlug(categoria)?.nombre ?? "Productos") : "Todos los productos";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">{titulo}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {productos.length} {productos.length === 1 ? "producto" : "productos"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9 lg:hidden"
            onClick={() => setFiltrosAbiertos(true)}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filtrar
            {cantidadFiltros > 0 && (
              <span className="rounded-full bg-brand-red px-1.5 text-[11px] font-bold text-white">
                {cantidadFiltros}
              </span>
            )}
          </Button>

          <label className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">Ordenar</span>
            <select
              value={orden}
              onChange={(evento) => cambiar("orden", evento.target.value)}
              className="h-9 rounded-lg border bg-background px-2 text-sm"
            >
              {ORDENES.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          {filtros}
          {cantidadFiltros > 0 && (
            <button
              type="button"
              onClick={() => router.replace("/tienda/productos", { scroll: false })}
              className="mt-6 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
              Limpiar filtros
            </button>
          )}
        </aside>

        {productos.length === 0 ? (
          <div className="rounded-2xl border border-dashed py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No hay productos con esos filtros.
            </p>
            <Button
              variant="link"
              onClick={() => router.replace("/tienda/productos", { scroll: false })}
            >
              Ver todos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
            {productos.map((producto) => (
              <TarjetaProducto key={producto.slug} producto={producto} />
            ))}
          </div>
        )}
      </div>

      <Sheet open={filtrosAbiertos} onOpenChange={setFiltrosAbiertos}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold">Filtrar</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto px-4">{filtros}</div>
          <SheetFooter className="flex-row border-t">
            <Button
              variant="outline"
              className="h-11 flex-1"
              onClick={() => router.replace("/tienda/productos", { scroll: false })}
            >
              Limpiar
            </Button>
            <Button className="h-11 flex-1" onClick={() => setFiltrosAbiertos(false)}>
              Ver {productos.length} {productos.length === 1 ? "producto" : "productos"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
