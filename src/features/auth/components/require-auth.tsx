"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { useSession } from "@/features/auth/hooks/use-session";
import { ROUTES } from "@/lib/routes";
import type { UserRole } from "@/types/auth";

interface RequireAuthProps {
  children: ReactNode;
  /** Si se indica, además de sesión se exige uno de estos roles. */
  roles?: ReadonlyArray<UserRole>;
  /**
   * HU-03: la pantalla de cambio de clave inicial es la única accesible
   * mientras `mustChangePassword` siga en true.
   */
  permitirPasswordPendiente?: boolean;
}

/**
 * Guard de cliente. La autorización real la hace el backend en cada request;
 * esto evita mostrar pantallas que el usuario no va a poder usar.
 */
export function RequireAuth({
  children,
  roles,
  permitirPasswordPendiente = false,
}: RequireAuthProps) {
  const router = useRouter();
  const { user, isPending } = useSession();

  const sinSesion = !isPending && !user;
  const debeCambiarPassword =
    !permitirPasswordPendiente && user?.mustChangePassword === true;
  const rolInsuficiente = user && roles ? !roles.includes(user.rol) : false;

  useEffect(() => {
    if (sinSesion) {
      router.replace(ROUTES.login);
      return;
    }
    if (debeCambiarPassword) {
      router.replace(ROUTES.cambiarPassword);
      return;
    }
    if (rolInsuficiente && user) {
      // No es su sección: se lo manda a la suya en vez de dejarlo en un 403.
      router.replace(user.rol === "ADMIN" ? ROUTES.admin : ROUTES.perfil);
    }
  }, [sinSesion, debeCambiarPassword, rolInsuficiente, user, router]);

  if (isPending || sinSesion || debeCambiarPassword || rolInsuficiente) {
    return (
      <div
        className="flex flex-1 items-center justify-center py-20"
        role="status"
        aria-live="polite"
      >
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">Verificando tu sesión…</span>
      </div>
    );
  }

  return <>{children}</>;
}
