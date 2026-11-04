"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Store, Trash2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IlustracionProducto } from "@/features/tienda/components/ilustracion-producto";
import { useMaqueta } from "@/features/tienda/maqueta/maqueta-context";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";

/**
 * Carrito lateral. Se abre solo al agregar un producto, así el comprador ve
 * que entró sin perder la página en la que estaba.
 */
export function CarritoDrawer() {
  const {
    items,
    carritoAbierto,
    setCarritoAbierto,
    cambiarCantidad,
    quitar,
    precioDe,
    subtotal,
    total,
    visitante,
  } = useMaqueta();

  const ahorro = subtotal - total;

  return (
    <Sheet open={carritoAbierto} onOpenChange={setCarritoAbierto}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag className="size-5" aria-hidden />
            Tu carrito
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
              onClick={() => setCarritoAbierto(false)}
              className={buttonVariants({ variant: "outline" })}
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <ul className="flex-1 divide-y overflow-y-auto px-4">
            {items.map((item, indice) => (
              <li key={`${item.producto.slug}-${item.talle ?? ""}`} className="flex gap-3 py-4">
                <IlustracionProducto
                  ilustracion={item.producto.ilustraciones[0]}
                  className="w-20 shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug font-medium">{item.producto.nombre}</p>
                  {item.talle && (
                    <p className="text-xs text-muted-foreground">Talle {item.talle}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center rounded-lg border">
                      <button
                        type="button"
                        aria-label="Restar uno"
                        disabled={item.cantidad === 1}
                        onClick={() => cambiarCantidad(indice, item.cantidad - 1)}
                        className="flex size-8 items-center justify-center disabled:opacity-40"
                      >
                        <Minus className="size-3.5" aria-hidden />
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums">{item.cantidad}</span>
                      <button
                        type="button"
                        aria-label="Sumar uno"
                        onClick={() => cambiarCantidad(indice, item.cantidad + 1)}
                        className="flex size-8 items-center justify-center"
                      >
                        <Plus className="size-3.5" aria-hidden />
                      </button>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatearMonto(precioDe(item.producto) * item.cantidad)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Quitar ${item.producto.nombre}`}
                  onClick={() => quitar(indice)}
                  className="self-start p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <SheetFooter className="gap-3 border-t">
            <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <Store className="mt-px size-4 shrink-0" aria-hidden />
              Retirás tu pedido en la sede del club. Te avisamos por correo cuando esté listo.
            </p>

            {visitante === "socio" && ahorro > 0 && (
              <p className="flex justify-between text-sm text-brand-red">
                <span>Descuento de socio</span>
                <span className="font-medium tabular-nums">− {formatearMonto(ahorro)}</span>
              </p>
            )}

            <p className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-heading text-2xl font-bold tabular-nums">
                {formatearMonto(total)}
              </span>
            </p>

            <Link
              href="/tienda/checkout"
              onClick={() => setCarritoAbierto(false)}
              className={cn(buttonVariants({ size: "lg" }), "h-12 text-base")}
            >
              Finalizar compra
            </Link>
            <button
              type="button"
              onClick={() => setCarritoAbierto(false)}
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
