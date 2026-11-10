"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, PackageX, ShoppingBag } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { ContenidoMarkdown } from "@/features/paginas/components/contenido-markdown";
import { FotoProducto } from "@/features/tienda/components/foto-producto";
import { AvisoStock, Precio } from "@/features/tienda/components/precio";
import { AvisoPreventa, EtiquetaPreventa } from "@/features/tienda/components/preventa";
import { Retiro } from "@/features/tienda/components/retiro";
import { TarjetaProducto } from "@/features/tienda/components/tarjeta-producto";
import { useCarrito } from "@/features/tienda/carrito/carrito-context";
import { useProductosTienda, useProductoTienda } from "@/features/tienda/hooks/use-tienda";
import { esApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { ProductoDetalle } from "@/types/tienda";

function Relacionados({ producto }: { producto: ProductoDetalle }) {
  const { data } = useProductosTienda({ categoria: producto.categoria.slug, pageSize: 5 });
  const otros = (data?.data ?? [])
    .filter((item) => item.id !== producto.id && item.disponibilidad !== "SIN_STOCK")
    .slice(0, 4);

  if (otros.length === 0) return null;

  return (
    <section className="container mx-auto mt-6 px-4">
      <h2 className="font-heading text-2xl font-bold tracking-tight">También te puede gustar</h2>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {otros.map((item) => (
          <TarjetaProducto key={item.id} producto={item} />
        ))}
      </div>
    </section>
  );
}

function Ficha({ producto }: { producto: ProductoDetalle }) {
  const { agregar } = useCarrito();
  const [foto, setFoto] = useState(0);
  const [varianteId, setVarianteId] = useState<string | null>(null);
  const [faltaTalle, setFaltaTalle] = useState(false);

  const agotado = producto.disponibilidad === "SIN_STOCK";
  const imagenes = producto.imagenes;
  const elegida = producto.variantes.find((variante) => variante.id === varianteId);

  function alAgregar() {
    // Sin talles hay una sola variante y se compra directo.
    const variante = producto.tieneTalles ? elegida : producto.variantes[0];
    if (!variante) {
      setFaltaTalle(true);
      return;
    }
    agregar({
      varianteId: variante.id,
      slug: producto.slug,
      nombre: producto.nombre,
      talle: variante.talle,
      precio: producto.precio,
      imagenUrl: imagenes[0]?.url ?? null,
    });
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <nav aria-label="Migas de pan" className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/tienda" className="hover:text-foreground">
          Tienda
        </Link>
        <ChevronRight className="size-3" aria-hidden />
        <Link
          href={`/tienda/productos?categoria=${producto.categoria.slug}`}
          className="hover:text-foreground"
        >
          {producto.categoria.nombre}
        </Link>
        <ChevronRight className="size-3" aria-hidden />
        <span className="truncate text-foreground">{producto.nombre}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Galería: la foto grande y, abajo, las miniaturas para cambiarla. */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl">
            <FotoProducto
              imagen={imagenes[foto] ?? null}
              alt={producto.nombre}
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className={cn(agotado && "opacity-50 grayscale")}
            />
            {producto.preventa ? (
              <EtiquetaPreventa className="absolute top-3 left-3" />
            ) : (
              <AvisoStock disponibilidad={producto.disponibilidad} className="absolute top-3 left-3" />
            )}
          </div>

          {imagenes.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {imagenes.map((imagen, indice) => (
                <button
                  key={imagen.id}
                  type="button"
                  aria-label={`Ver la foto ${indice + 1}`}
                  aria-pressed={foto === indice}
                  onClick={() => setFoto(indice)}
                  className={cn(
                    "w-20 overflow-hidden rounded-lg ring-offset-2 transition",
                    foto === indice ? "ring-2 ring-brand-black" : "opacity-70 hover:opacity-100",
                  )}
                >
                  <FotoProducto imagen={imagen} alt="" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:pt-4">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {producto.nombre}
          </h1>

          <div className="mt-4">
            <Precio producto={producto} grande />
            <p className="mt-1 text-xs text-muted-foreground">Precio final, con impuestos incluidos.</p>
          </div>

          {producto.preventa && <AvisoPreventa preventa={producto.preventa} className="mt-6" />}

          {producto.tieneTalles && !agotado && (
            <fieldset className="mt-8">
              <legend className="text-sm font-semibold">
                Talle
                {elegida && <span className="font-normal text-muted-foreground"> · {elegida.talle}</span>}
              </legend>

              <div className="mt-3 flex flex-wrap gap-2">
                {producto.variantes.map((variante) => {
                  const sinStock = variante.disponibilidad === "SIN_STOCK";
                  return (
                    <button
                      key={variante.id}
                      type="button"
                      disabled={sinStock}
                      aria-pressed={varianteId === variante.id}
                      aria-label={sinStock ? `Talle ${variante.talle}, sin stock` : `Talle ${variante.talle}`}
                      onClick={() => {
                        setVarianteId(variante.id);
                        setFaltaTalle(false);
                      }}
                      className={cn(
                        "h-12 min-w-14 rounded-lg border px-3 text-sm font-semibold transition-colors",
                        varianteId === variante.id
                          ? "border-brand-black bg-brand-black text-white"
                          : "hover:border-foreground/50",
                        sinStock &&
                          "cursor-not-allowed border-dashed bg-muted text-muted-foreground line-through",
                      )}
                    >
                      {variante.talle}
                    </button>
                  );
                })}
              </div>

              <p
                className={cn(
                  "mt-2 min-h-5 text-sm",
                  faltaTalle ? "font-medium text-destructive" : "text-amber-700",
                )}
                role={faltaTalle ? "alert" : undefined}
              >
                {faltaTalle
                  ? "Elegí un talle para agregarlo al carrito."
                  : elegida?.disponibilidad === "ULTIMAS_UNIDADES"
                    ? `Últimas unidades en talle ${elegida.talle}.`
                    : ""}
              </p>
            </fieldset>
          )}

          <div className="mt-6">
            {agotado ? (
              <div className="rounded-xl border border-dashed p-4 text-center">
                <p className="font-semibold">Sin stock</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Este producto se agotó. Mirá los demás de {producto.categoria.nombre.toLowerCase()}.
                </p>
              </div>
            ) : (
              <Button size="lg" className="h-12 w-full text-base" onClick={alAgregar}>
                <ShoppingBag className="size-5" aria-hidden />
                Agregar al carrito
              </Button>
            )}
          </div>

          <Retiro className="mt-4 rounded-lg bg-muted p-3 text-muted-foreground" />

          {producto.descripcion.trim() && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-sm font-semibold">Descripción</h2>
              <ContenidoMarkdown
                texto={producto.descripcion}
                className="mx-0 mt-2 max-w-none space-y-3 text-sm text-muted-foreground"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FichaProducto({ slug }: { slug: string }) {
  const { data, isPending, isError, error, refetch } = useProductoTienda(slug);

  if (isPending) return <Cargando etiqueta="Cargando el producto…" />;

  if (isError) {
    if (esApiError(error) && error.status === 404) {
      return (
        <div className="container mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
          <PackageX className="size-10 text-muted-foreground" aria-hidden />
          <h1 className="font-heading text-2xl font-bold">Este producto ya no está</h1>
          <p className="text-sm text-muted-foreground">
            Puede que se haya dejado de vender. Mirá los demás productos de la tienda.
          </p>
          <Link href="/tienda/productos" className={buttonVariants({ size: "lg" })}>
            Ver todos los productos
          </Link>
        </div>
      );
    }
    return (
      <div className="container mx-auto px-4 py-10">
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="pb-16">
      <Ficha producto={data} />
      <Relacionados producto={data} />
    </div>
  );
}
