"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Ruler, ShoppingBag, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IlustracionProducto } from "@/features/tienda/components/ilustracion-producto";
import { AvisoStock, Precio } from "@/features/tienda/components/precio";
import { useMaqueta } from "@/features/tienda/maqueta/maqueta-context";
import {
  POCAS_UNIDADES,
  RETIRO,
  categoriaPorSlug,
  stockTotal,
  type ProductoTienda,
} from "@/features/tienda/maqueta/datos";
import { cn } from "@/lib/utils";

const MEDIDAS = [
  { talle: "S", pecho: "96", largo: "70" },
  { talle: "M", pecho: "102", largo: "72" },
  { talle: "L", pecho: "108", largo: "74" },
  { talle: "XL", pecho: "114", largo: "76" },
  { talle: "XXL", pecho: "120", largo: "78" },
];

function GuiaTalles({ open, onOpenChange }: { open: boolean; onOpenChange: (abierto: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Guía de talles</DialogTitle>
          <DialogDescription>
            Medidas de la prenda en centímetros, tomadas con la prenda apoyada. Si estás
            entre dos talles, elegí el más grande.
          </DialogDescription>
        </DialogHeader>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 font-medium">Talle</th>
              <th className="py-2 font-medium">Ancho de pecho</th>
              <th className="py-2 font-medium">Largo</th>
            </tr>
          </thead>
          <tbody>
            {MEDIDAS.map((medida) => (
              <tr key={medida.talle} className="border-b last:border-0">
                <td className="py-2 font-semibold">{medida.talle}</td>
                <td className="py-2 tabular-nums">{medida.pecho} cm</td>
                <td className="py-2 tabular-nums">{medida.largo} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  );
}

export function FichaProducto({ producto }: { producto: ProductoTienda }) {
  const { agregar } = useMaqueta();
  const [foto, setFoto] = useState(0);
  const [talle, setTalle] = useState<string | null>(null);
  const [guiaAbierta, setGuiaAbierta] = useState(false);
  const [faltaTalle, setFaltaTalle] = useState(false);

  const conTalle = producto.talles.length > 0;
  const agotado = stockTotal(producto) === 0;
  const talleElegido = producto.talles.find((item) => item.talle === talle);
  const categoria = categoriaPorSlug(producto.categoria);

  function alAgregar() {
    if (conTalle && !talle) {
      setFaltaTalle(true);
      return;
    }
    agregar(producto, talle ?? undefined);
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <nav aria-label="Migas de pan" className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/tienda" className="hover:text-foreground">Tienda</Link>
        <ChevronRight className="size-3" aria-hidden />
        {categoria && (
          <>
            <Link href={`/tienda/productos?categoria=${categoria.slug}`} className="hover:text-foreground">
              {categoria.nombre}
            </Link>
            <ChevronRight className="size-3" aria-hidden />
          </>
        )}
        <span className="truncate text-foreground">{producto.nombre}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Galería: la foto grande y, abajo, las miniaturas para cambiarla. */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl">
            <IlustracionProducto
              ilustracion={producto.ilustraciones[foto]}
              toma={foto}
              className={cn(agotado && "opacity-50 grayscale")}
            />
            <AvisoStock producto={producto} className="absolute top-3 left-3" />
          </div>

          {producto.ilustraciones.length > 1 && (
            <div className="flex gap-3">
              {producto.ilustraciones.map((ilustracion, indice) => (
                <button
                  key={indice}
                  type="button"
                  aria-label={`Ver la foto ${indice + 1}`}
                  aria-pressed={foto === indice}
                  onClick={() => setFoto(indice)}
                  className={cn(
                    "w-20 overflow-hidden rounded-lg ring-offset-2 transition",
                    foto === indice ? "ring-2 ring-brand-black" : "opacity-70 hover:opacity-100",
                  )}
                >
                  <IlustracionProducto ilustracion={ilustracion} toma={indice} />
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

          {conTalle && (
            <fieldset className="mt-8">
              <div className="flex items-center justify-between">
                <legend className="text-sm font-semibold">
                  Talle{talle && <span className="font-normal text-muted-foreground"> · {talle}</span>}
                </legend>
                <button
                  type="button"
                  onClick={() => setGuiaAbierta(true)}
                  className="flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                >
                  <Ruler className="size-4" aria-hidden />
                  Guía de talles
                </button>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-2">
                {producto.talles.map((item) => {
                  const sinStock = item.stock === 0;
                  return (
                    <button
                      key={item.talle}
                      type="button"
                      disabled={sinStock}
                      aria-pressed={talle === item.talle}
                      aria-label={sinStock ? `Talle ${item.talle}, sin stock` : `Talle ${item.talle}`}
                      onClick={() => {
                        setTalle(item.talle);
                        setFaltaTalle(false);
                      }}
                      className={cn(
                        "h-12 rounded-lg border text-sm font-semibold transition-colors",
                        talle === item.talle
                          ? "border-brand-black bg-brand-black text-white"
                          : "hover:border-foreground/50",
                        sinStock && "cursor-not-allowed border-dashed bg-muted text-muted-foreground line-through",
                      )}
                    >
                      {item.talle}
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
                  : talleElegido && talleElegido.stock <= POCAS_UNIDADES
                    ? `Quedan ${talleElegido.stock} en talle ${talleElegido.talle}.`
                    : ""}
              </p>
            </fieldset>
          )}

          <div className="mt-6">
            {agotado ? (
              <div className="rounded-xl border border-dashed p-4 text-center">
                <p className="font-semibold">Sin stock</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Este producto se agotó. Mirá los demás de {categoria?.nombre.toLowerCase()}.
                </p>
              </div>
            ) : (
              <Button size="lg" className="h-12 w-full text-base" onClick={alAgregar}>
                <ShoppingBag className="size-5" aria-hidden />
                Agregar al carrito
              </Button>
            )}
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <Store className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Retiro en {RETIRO.lugar.toLowerCase()}, {RETIRO.direccion}. {RETIRO.horarios}.
            </span>
          </p>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-sm font-semibold">Descripción</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{producto.descripcion}</p>
          </div>
        </div>
      </div>

      <GuiaTalles open={guiaAbierta} onOpenChange={setGuiaAbierta} />
    </div>
  );
}
