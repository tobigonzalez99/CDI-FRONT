"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumn, Package, Settings, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";

const SECCIONES = [
  { href: "/tienda/panel", label: "Ventas", Icon: ChartColumn },
  { href: "/tienda/panel/pedidos", label: "Pedidos", Icon: ShoppingCart, pendientes: 2 },
  { href: "/tienda/panel/productos", label: "Productos", Icon: Package },
  { href: "/tienda/panel/ajustes", label: "Ajustes", Icon: Settings },
] as const;

/**
 * Menú del panel de la tienda, con el mismo estilo que el del club. El usuario
 * con rol TIENDA ve solo esto: nada de socios ni de cuotas.
 */
export function PanelTiendaNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones de la tienda" className="border-b">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {SECCIONES.map((seccion) => {
          const activo =
            seccion.href === "/tienda/panel" ? pathname === seccion.href : pathname.startsWith(seccion.href);
          return (
            <li key={seccion.href}>
              <Link
                href={seccion.href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                  activo
                    ? "border-brand-red text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <seccion.Icon className="size-4" aria-hidden />
                {seccion.label}
                {"pendientes" in seccion && (
                  <span className="rounded-full bg-brand-red px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white">
                    {seccion.pendientes}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
