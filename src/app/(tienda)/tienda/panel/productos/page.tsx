import type { Metadata } from "next";
import { ImagePlus, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IlustracionProducto } from "@/features/tienda/components/ilustracion-producto";
import { PRODUCTOS, categoriaPorSlug, stockTotal } from "@/features/tienda/maqueta/datos";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Productos" };

const CAMISETA = PRODUCTOS[0];

/** Lista de productos y, abajo, cómo se vería el formulario para editar uno. */
export default function PanelProductosPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Cargá productos, sus fotos y el stock de cada talle. Un producto sin stock sigue a
            la vista en la tienda, marcado como agotado.
          </p>
        </div>
        <Button size="lg" className="h-10">
          <Plus aria-hidden />
          Nuevo producto
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12"><span className="sr-only">Editar</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PRODUCTOS.map((producto) => {
              const stock = stockTotal(producto);
              return (
                <TableRow key={producto.slug}>
                  <TableCell>
                    <IlustracionProducto ilustracion={producto.ilustraciones[0]} className="w-11 rounded-md" />
                  </TableCell>
                  <TableCell className="font-medium">{producto.nombre}</TableCell>
                  <TableCell>{categoriaPorSlug(producto.categoria)?.nombre}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatearMonto(producto.precio)}</TableCell>
                  <TableCell>
                    {producto.talles.length > 0 ? (
                      <span className="flex flex-wrap gap-1">
                        {producto.talles.map((talle) => (
                          <span
                            key={talle.talle}
                            className={cn(
                              "rounded px-1.5 py-0.5 text-xs tabular-nums",
                              talle.stock === 0 ? "bg-destructive/10 text-destructive line-through" : "bg-muted",
                            )}
                          >
                            {talle.talle} {talle.stock}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className={cn("tabular-nums", stock === 0 && "text-destructive")}>{stock} u.</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        stock === 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-100 text-emerald-900",
                      )}
                    >
                      {stock === 0 ? "Agotado" : "Publicado"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-sm" aria-label={`Editar ${producto.nombre}`}>
                      <Pencil aria-hidden />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Vista previa del formulario de edición, con la camiseta titular. */}
      <section className="rounded-2xl border p-5 md:p-8">
        <h2 className="font-heading text-xl font-bold">Editar: {CAMISETA.nombre}</h2>
        <p className="text-sm text-muted-foreground">Así se vería el formulario al tocar el lápiz.</p>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="p-nombre">Nombre</Label>
              <Input id="p-nombre" defaultValue={CAMISETA.nombre} className="h-10" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="p-precio">Precio final</Label>
                <Input id="p-precio" defaultValue="54000" inputMode="numeric" className="h-10" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-categoria">Categoría</Label>
                <select id="p-categoria" className="h-10 rounded-lg border bg-background px-2 text-sm">
                  <option>Camisetas</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-desc">Descripción</Label>
              <textarea id="p-desc" rows={3} defaultValue={CAMISETA.descripcion} className="rounded-lg border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="size-4 accent-brand-red" /> Destacado en el inicio</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="size-4 accent-brand-red" /> Marcar como nuevo</label>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div>
              <p className="text-sm font-medium">Fotos</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {CAMISETA.ilustraciones.map((ilustracion, indice) => (
                  <IlustracionProducto key={indice} ilustracion={ilustracion} toma={indice} className="w-20 rounded-lg" />
                ))}
                <button type="button" className="flex aspect-square w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs text-muted-foreground">
                  <ImagePlus className="size-5" aria-hidden />
                  Agregar
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">La primera es la de la tarjeta. Cuadradas, de 1000 px o más.</p>
            </div>

            <div>
              <p className="text-sm font-medium">Stock por talle</p>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {CAMISETA.talles.map((talle) => (
                  <div key={talle.talle} className="grid gap-1 text-center">
                    <Label htmlFor={`t-${talle.talle}`} className="justify-center">{talle.talle}</Label>
                    <Input id={`t-${talle.talle}`} defaultValue={talle.stock} inputMode="numeric" className="h-10 text-center" />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Vasos, mates y accesorios llevan un solo campo de stock, sin talles.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-2 border-t pt-5">
          <Button variant="ghost">Cancelar</Button>
          <Button>Guardar cambios</Button>
        </div>
      </section>
    </div>
  );
}
