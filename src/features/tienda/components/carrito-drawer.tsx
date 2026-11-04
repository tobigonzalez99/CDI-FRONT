"use client";

import Link from "next/link";
import { LoaderCircle, Minus, Plus, ShoppingBag, Trash2, TriangleAlert } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FotoProducto } from "@/features/tienda/components/foto-producto";
import { Retiro } from "@/features/tienda/components/retiro";
import { useCarrito } from "@/features/tienda/carrito/carrito-context";
import { useCotizacion } from "@/features/tienda/hooks/use-tienda";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";
import { MAXIMO_UNIDADES_POR_PRODUCTO, type LineaCotizada } from "@/types/tienda";

/** Qué le pasa a una línea, en palabras del comprador. */
export function textoProblema(linea: LineaCotizada): string | null {
  if (linea.problema === "NO_DISPONIBLE") return "Ya no está a la venta. Quitalo para seguir.";
  if (linea.problema === "STOCK_INSUFICIENTE") {
    return linea.disponibles
      ? `Solo quedan ${linea.disponibles}. Bajá la cantidad para seguir.`
      : "Se quedó sin stock. Quitalo para seguir.";
  }
  return null;
}

/**
 * Carrito lateral. Se abre solo al agregar un producto, así el comprador ve
 * que entró sin perder la página en la que estaba.
 *
 * Al abrirse pide la cotización a la API: precio, descuento y stock salen de
 * ahí, no de lo que guardó el navegador. Lo que cambió se avisa en la línea.
 */
export function CarritoDrawer() {
  const { items, itemsParaApi, abierto, setAbierto, cambiarCantidad, quitar } = useCarrito();
  const { data: cotizacion, isFetching } = useCotizacion(itemsParaApi, abierto);

  const lineaDe = (varianteId: string) =>
    cotizacion?.lineas.find((linea) => linea.varianteId === varianteId);

  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag className="size-5" aria-hidden />
            Tu carrito
            {isFetching && (
              <LoaderCircle className="size-4 animate-spin text-muted-foreground" aria-label="Actualizando precios" />
            )}
          </SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Todavía no agregaste nada."
              : "Los precios son finales, con impuestos incluidos."}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Elegí la camiseta, un mate o lo que quieras llevarte del club.
            </p>
            <Link
              href="/tienda/productos"
              onClick={() => setAbierto(false)}
              className={buttonVariants({ variant: "outline" })}
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <ul className="flex-1 divide-y overflow-y-auto px-4">
            {items.map((item) => {
              const linea = lineaDe(item.varianteId);
              const problema = linea ? textoProblema(linea) : null;
              const conDescuento = linea && linea.precioFinal < linea.precioUnitario;

              return (
                <li key={item.varianteId} className="flex gap-3 py-4">
                  <FotoProducto
                    imagen={item.imagenUrl ? { id: item.varianteId, url: item.imagenUrl, ancho: 1, alto: 1 } : null}
                    alt=""
                    sizes="80px"
                    className={cn("w-20 shrink-0 rounded-lg", linea?.problema === "NO_DISPONIBLE" && "opacity-50 grayscale")}
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/tienda/productos/${item.slug}`}
                      onClick={() => setAbierto(false)}
                      className="text-sm leading-snug font-medium hover:underline"
                    >
                      {linea?.productoNombre ?? item.nombre}
                    </Link>
                    {item.talle && <p className="text-xs text-muted-foreground">Talle {item.talle}</p>}

                    {problema && (
                      <p className="mt-1 flex items-start gap-1 text-xs font-medium text-destructive">
                        <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
                        {problema}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between gap-2">
                      {linea?.problema === "NO_DISPONIBLE" ? (
                        <span />
                      ) : (
                        <div className="flex items-center rounded-lg border">
                          <button
                            type="button"
                            aria-label="Restar uno"
                            disabled={item.cantidad === 1}
                            onClick={() => cambiarCantidad(item.varianteId, item.cantidad - 1)}
                            className="flex size-8 items-center justify-center disabled:opacity-40"
                          >
                            <Minus className="size-3.5" aria-hidden />
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums">{item.cantidad}</span>
                          <button
                            type="button"
                            aria-label="Sumar uno"
                            disabled={
                              item.cantidad >= MAXIMO_UNIDADES_POR_PRODUCTO ||
                              (linea?.disponibles !== null &&
                                linea?.disponibles !== undefined &&
                                item.cantidad >= linea.disponibles)
                            }
                            onClick={() => cambiarCantidad(item.varianteId, item.cantidad + 1)}
                            className="flex size-8 items-center justify-center disabled:opacity-40"
                          >
                            <Plus className="size-3.5" aria-hidden />
                          </button>
                        </div>
                      )}
                      <div className="text-right">
                        {conDescuento && (
                          <p className="text-xs text-muted-foreground line-through tabular-nums">
                            {formatearMonto(linea.precioUnitario * linea.cantidad)}
                          </p>
                        )}
                        <p className="text-sm font-semibold tabular-nums">
                          {linea ? formatearMonto(linea.subtotal) : formatearMonto(item.precio * item.cantidad)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Quitar ${item.nombre}`}
                    onClick={() => quitar(item.varianteId)}
                    className="self-start p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {items.length > 0 && (
          <SheetFooter className="gap-3 border-t">
            <Retiro className="rounded-lg bg-muted p-3 text-xs text-muted-foreground" />

            {cotizacion && cotizacion.descuentoMonto > 0 && (
              <p className="flex justify-between text-sm text-brand-red">
                <span>Descuento de socio ({cotizacion.descuentoPorcentaje}%)</span>
                <span className="font-medium tabular-nums">− {formatearMonto(cotizacion.descuentoMonto)}</span>
              </p>
            )}

            <p className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-heading text-2xl font-bold tabular-nums">
                {cotizacion ? formatearMonto(cotizacion.total) : "…"}
              </span>
            </p>

            {cotizacion && !cotizacion.valida ? (
              <p className="rounded-lg bg-destructive/10 p-3 text-center text-sm font-medium text-destructive">
                Corregí lo marcado en rojo para seguir con la compra.
              </p>
            ) : (
              <Link
                href="/tienda/checkout"
                onClick={() => setAbierto(false)}
                aria-disabled={!cotizacion}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 text-base",
                  !cotizacion && "pointer-events-none opacity-50",
                )}
              >
                Finalizar compra
              </Link>
            )}
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              Seguir comprando
            </button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
