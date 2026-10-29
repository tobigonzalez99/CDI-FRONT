"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartColumn,
  LayoutDashboard,
  Receipt,
  UserMinus,
  Users,
} from "lucide-react";

import { useBajasPendientes } from "@/features/solicitudes/hooks/use-bajas";
import { useSolicitudesPendientes } from "@/features/solicitudes/hooks/use-solicitudes";
import { cn } from "@/lib/utils";

const SECCIONES = [
  { href: "/admin", label: "Altas", Icon: LayoutDashboard },
  { href: "/admin/bajas", label: "Bajas", Icon: UserMinus },
  { href: "/admin/socios", label: "Socios", Icon: Users },
  { href: "/admin/cobranzas", label: "Cobranzas", Icon: ChartColumn },
  { href: "/admin/cobros", label: "Registrar cobro", Icon: Receipt },
] as const;

/** Cuántos pedidos esperan respuesta, al lado del nombre de la sección. */
function Pendientes({ cantidad }: { cantidad: number | undefined }) {
  if (!cantidad) return null;

  return (
    <span
      className="rounded-full bg-brand-red px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white"
      aria-label={`${cantidad} pendientes`}
    >
      {cantidad}
    </span>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  const { data: altas } = useSolicitudesPendientes();
  const { data: bajas } = useBajasPendientes();

  const pendientesPorRuta: Record<string, number | undefined> = {
    "/admin": altas,
    "/admin/bajas": bajas,
  };

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
                <Pendientes cantidad={pendientesPorRuta[href]} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
