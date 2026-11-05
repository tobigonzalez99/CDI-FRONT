"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumn, FolderTree, Package, Settings, ShoppingCart, Undo2, UsersRound } from "lucide-react";

import { useSession } from "@/features/auth/hooks/use-session";
import { useArrepentimientos } from "@/features/tienda/hooks/use-tienda-admin";
import { cn } from "@/lib/utils";

const SECCIONES = [
  { href: "/tienda/panel", label: "Ventas", Icon: ChartColumn },
  { href: "/tienda/panel/pedidos", label: "Pedidos", Icon: ShoppingCart },
  { href: "/tienda/panel/arrepentimientos", label: "Arrepentimientos", Icon: Undo2 },
  { href: "/tienda/panel/productos", label: "Productos", Icon: Package },
  { href: "/tienda/panel/categorias", label: "Categorías", Icon: FolderTree },
  { href: "/tienda/panel/ajustes", label: "Ajustes", Icon: Settings },
  { href: "/tienda/panel/operadores", label: "Usuarios", Icon: UsersRound, soloAdmin: true },
] as const;

/**
 * Menú del panel de la tienda, con el mismo estilo que el del club. El
 * operador (rol TIENDA) ve solo esto: nada de socios ni de cuotas. Los
 * usuarios de la tienda los maneja únicamente el administrador.
 */
export function PanelTiendaNav() {
  const pathname = usePathname();
  const { user } = useSession();
  const { data: arrepentimientos } = useArrepentimientos({ page: 1, pageSize: 1, estado: "PENDIENTE" });

  return (
    <nav aria-label="Secciones de la tienda" className="border-b">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {SECCIONES.filter((seccion) => !("soloAdmin" in seccion) || user?.rol === "ADMIN").map(
          (seccion) => {
            const activo =
              seccion.href === "/tienda/panel"
                ? pathname === seccion.href
                : pathname.startsWith(seccion.href);
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
                  {seccion.href === "/tienda/panel/arrepentimientos" && Boolean(arrepentimientos?.pendientes) && (
                    <span className="rounded-full bg-brand-red px-1.5 text-xs font-semibold text-white tabular-nums">
                      {arrepentimientos?.pendientes}
                    </span>
                  )}
                </Link>
              </li>
            );
          },
        )}
      </ul>
    </nav>
  );
}
