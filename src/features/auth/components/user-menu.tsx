"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks/use-auth-mutations";
import { ROUTES } from "@/lib/routes";
import type { AuthUser } from "@/types/auth";

function iniciales(user: AuthUser): string {
  return `${user.nombre.at(0) ?? ""}${user.apellido.at(0) ?? ""}`.toUpperCase();
}

/** Menú de la sesión activa en la navbar. */
export function UserMenu({ user }: { user: AuthUser }) {
  const { mutate: cerrarSesion, isPending } = useLogout();
  const esAdmin = user.rol === "ADMIN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
          >
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white"
            >
              {iniciales(user)}
            </span>
            <span className="hidden max-w-32 truncate lg:block">{user.nombre}</span>
          </button>
        }
      />

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium">
            {user.nombre} {user.apellido}
          </p>
          <p className="text-xs text-muted-foreground">
            {esAdmin ? "Administración" : `DNI ${user.dni}`}
          </p>
        </div>

        <DropdownMenuSeparator />

        {esAdmin ? (
          <DropdownMenuItem
            render={
              <Link href={ROUTES.admin}>
                <LayoutDashboard className="size-4" aria-hidden />
                Panel de administración
              </Link>
            }
          />
        ) : (
          <DropdownMenuItem
            render={
              <Link href={ROUTES.perfil}>
                <User className="size-4" aria-hidden />
                Mi perfil
              </Link>
            }
          />
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isPending}
          onClick={() => cerrarSesion()}
          className="text-destructive"
        >
          <LogOut className="size-4" aria-hidden />
          {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

