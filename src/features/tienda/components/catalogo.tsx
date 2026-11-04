"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ErrorConsulta } from "@/components/shared/estado-consulta";
import {
  TarjetaProducto,
  TarjetaProductoCargando,
} from "@/features/tienda/components/tarjeta-producto";
import { useCategoriasTienda, useProductosTienda } from "@/features/tienda/hooks/use-tienda";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { ORDENES_CATALOGO, type OrdenCatalogo } from "@/types/tienda";

const POR_PAGINA = 24;

/** Los talles de indumentaria más comunes; la API filtra los que tienen stock. */
const TALLES = ["XS", "S", "M", "L", "XL", "XXL"];

const RANGOS = [
  { valor: "hasta-20", etiqueta: "Hasta $ 20.000", precioMax: 20000 },
  { valor: "20-50", etiqueta: "$ 20.000 a $ 50.000", precioMin: 20000, precioMax: 50000 },
  { valor: "mas-50", etiqueta: "Más de $ 50.000", precioMin: 50000 },
] as const;

const ETIQUETAS_ORDEN: Record<OrdenCatalogo, string> = {
  relevancia: "Destacados",
  nuevos: "Más nuevos",
  "precio-asc": "Menor precio",
  "precio-desc": "Mayor precio",
};

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        activo ? "border-brand-black bg-brand-black text-white" : "hover:border-foreground/40",
      )}
    >
      {children}
    </button>
  );
}

/** Grilla con filtros. Viven en la URL, para poder compartir el enlace. */
export function Catalogo() {
  const router = useRouter();
  const params = useSearchParams();
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [texto, setTexto] = useState(params.get("buscar") ?? "");
  const buscar = useDebounce(texto.trim());

  const categoria = params.get("categoria");
  const talle = params.get("talle");
  const rango = RANGOS.find((item) => item.valor === params.get("precio"));
  const ordenParam = params.get("orden");
  const orden: OrdenCatalogo = ORDENES_CATALOGO.includes(ordenParam as OrdenCatalogo)
    ? (ordenParam as OrdenCatalogo)
    : "relevancia";
  const pagina = Math.max(1, Number(params.get("pagina")) || 1);

  const { data: categorias = [] } = useCategoriasTienda();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProductosTienda({
    page: pagina,
    pageSize: POR_PAGINA,
    categoria: categoria ?? undefined,
    talle: talle ?? undefined,
    precioMin: rango && "precioMin" in rango ? rango.precioMin : undefined,
    precioMax: rango && "precioMax" in rango ? rango.precioMax : undefined,
    buscar: buscar || undefined,
    orden,
  });

  function cambiar(clave: string, valor: string | null) {
    const nuevos = new URLSearchParams(params);
    if (valor === null || nuevos.get(clave) === valor) nuevos.delete(clave);
    else nuevos.set(clave, valor);
    // Cualquier cambio de filtro vuelve a la primera página.
    if (clave !== "pagina") nuevos.delete("pagina");
    router.replace(`/tienda/productos?${nuevos.toString()}`, { scroll: clave === "pagina" });
  }

  function verTodos() {
    setTexto("");
    router.replace("/tienda/productos", { scroll: false });
  }

  const cantidadFiltros = [categoria, talle, rango].filter(Boolean).length;
  const hayFiltros = cantidadFiltros > 0 || Boolean(buscar);
  const titulo = categoria
    ? (categorias.find((item) => item.slug === categoria)?.nombre ?? "Productos")
    : buscar
      ? `Resultados para "${buscar}"`
      : "Todos los productos";

  const filtros = (
    <div className="space-y-7">
      <fieldset>
        <legend className="text-sm font-semibold">Categoría</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {categorias.map((item) => (
            <Chip
              key={item.id}
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
        <p className="mt-1 text-xs text-muted-foreground">
          Muestra lo que tiene ese talle disponible.
        </p>
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
              activo={rango?.valor === item.valor}
              onClick={() => cambiar("precio", item.valor)}
            >
              {item.etiqueta}
            </Chip>
          ))}
        </div>
      </fieldset>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-3">
          {/*
            Los filtros van en un menú que se abre desde la izquierda y se
            esconde: la grilla aprovecha todo el ancho y los productos se ven
            más grandes.
          */}
          <Button
            variant="outline"
            className="relative h-10 gap-2 px-3"
            aria-label={cantidadFiltros > 0 ? `Filtros, ${cantidadFiltros} aplicados` : "Filtros"}
            onClick={() => setFiltrosAbiertos(true)}
          >
            <Menu className="size-5" aria-hidden />
            <span className="hidden sm:inline">Filtros</span>
            {cantidadFiltros > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-brand-red text-[11px] font-bold text-white">
                {cantidadFiltros}
              </span>
            )}
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">{titulo}</h1>
            <p className="mt-1 min-h-5 text-sm text-muted-foreground">
              {data && `${data.total} ${data.total === 1 ? "producto" : "productos"}`}
              {hayFiltros && (
                <>
                  {" · "}
                  <Link
                    href="/tienda/productos"
                    onClick={() => setTexto("")}
                    className="font-medium text-brand-red hover:underline"
                  >
                    Ver todos los productos
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-56 sm:flex-none">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              aria-label="Buscar productos"
              placeholder="Buscar"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              className="h-9 pl-9"
            />
          </div>

          <select
            value={orden}
            aria-label="Ordenar"
            onChange={(evento) =>
              cambiar("orden", evento.target.value === "relevancia" ? null : evento.target.value)
            }
            className="h-9 rounded-lg border bg-background px-2 text-sm"
          >
            {ORDENES_CATALOGO.map((item) => (
              <option key={item} value={item}>
                {ETIQUETAS_ORDEN[item]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorConsulta error={error} onReintentar={() => void refetch()} />
        ) : isPending ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, indice) => (
              <TarjetaProductoCargando key={indice} />
            ))}
          </div>
        ) : data.data.length === 0 ? (
          <div className="rounded-2xl border border-dashed py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {hayFiltros
                ? "No hay productos con esos filtros."
                : "Todavía no hay productos publicados."}
            </p>
            {hayFiltros && (
              <Button variant="link" onClick={verTodos}>
                Ver todos
              </Button>
            )}
          </div>
        ) : (
          <>
            <div
              className={cn(
                "grid grid-cols-2 gap-x-4 gap-y-8 transition-opacity md:grid-cols-3 lg:grid-cols-4",
                isPlaceholderData && "opacity-60",
              )}
            >
              {data.data.map((producto) => (
                <TarjetaProducto key={producto.id} producto={producto} />
              ))}
            </div>

            {data.totalPages > 1 && (
              <nav aria-label="Páginas" className="mt-10 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  disabled={pagina <= 1}
                  onClick={() => cambiar("pagina", String(pagina - 1))}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {data.page} de {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagina >= data.totalPages}
                  onClick={() => cambiar("pagina", String(pagina + 1))}
                >
                  Siguiente
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </nav>
            )}
          </>
        )}
      </div>

      <Sheet open={filtrosAbiertos} onOpenChange={setFiltrosAbiertos}>
        <SheetContent side="left" className="w-[85%] gap-0 sm:max-w-sm">
          <SheetHeader className="border-b">
            <SheetTitle className="text-lg font-bold">Filtros</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">{filtros}</div>
          <SheetFooter className="flex-row border-t">
            {/* Se cierra con la X o tocando afuera: la grilla se actualiza al instante. */}
            <Button
              variant="outline"
              className="h-11 flex-1"
              disabled={cantidadFiltros === 0}
              onClick={verTodos}
            >
              Limpiar filtros
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
