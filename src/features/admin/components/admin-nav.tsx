"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumn, LayoutDashboard, Receipt, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const SECCIONES = [
  { href: "/admin", label: "Panel", Icon: LayoutDashboard },
  { href: "/admin/socios", label: "Socios", Icon: Users },
  { href: "/admin/cobranzas", label: "Cobranzas", Icon: ChartColumn },
  { href: "/admin/cobros", label: "Registrar cobro", Icon: Receipt },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones de administración" className="border-b">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {SECCIONES.map(({ href, label, Icon }) => {
          // "/admin" solo está activo en su propia ruta, no en las hijas.
          const activo = href === "/admin" ? pathname === href : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  activo
                    ? "border-brand-red text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
