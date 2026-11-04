import { cn } from "@/lib/utils";
import type { ProductoAdmin } from "@/types/tienda";

/** Cómo está el producto en la tienda, en una etiqueta. */
export function EstadoProducto({ producto }: { producto: ProductoAdmin }) {
  if (!producto.activo) {
    return <Etiqueta className="bg-muted text-muted-foreground">Desactivado</Etiqueta>;
  }
  if (producto.stockTotal === 0) {
    return <Etiqueta className="bg-destructive/10 text-destructive">Sin stock</Etiqueta>;
  }
  if (producto.stockBajo) {
    return <Etiqueta className="bg-amber-100 text-amber-900">Poco stock</Etiqueta>;
  }
  return <Etiqueta className="bg-emerald-100 text-emerald-900">Publicado</Etiqueta>;
}

function Etiqueta({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", className)}>
      {children}
    </span>
  );
}

/** El stock exacto: por talle en la indumentaria, uno solo en el resto. */
export function StockPorTalle({ producto }: { producto: ProductoAdmin }) {
  if (!producto.tieneTalles) {
    return (
      <span className={cn("tabular-nums", producto.stockTotal === 0 && "text-destructive")}>
        {producto.stockTotal} u.
      </span>
    );
  }

  return (
    <span className="flex flex-wrap gap-1">
      {producto.variantes
        .filter((variante) => variante.activa)
        .map((variante) => (
          <span
            key={variante.id}
            className={cn(
              "rounded px-1.5 py-0.5 text-xs tabular-nums",
              variante.stock === 0 ? "bg-destructive/10 text-destructive line-through" : "bg-muted",
            )}
          >
            {variante.talle} {variante.stock}
          </span>
        ))}
    </span>
  );
}
