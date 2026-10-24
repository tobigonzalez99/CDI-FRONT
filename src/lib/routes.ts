import type { AuthUser } from "@/types/auth";

export const ROUTES = {
  home: "/",
  login: "/login",
  cambiarPassword: "/cambiar-password",
  perfil: "/perfil",
  admin: "/admin",
  adminSocios: "/admin/socios",
} as const;

/**
 * A dónde mandar al usuario después de autenticarse.
 * HU-03: mientras conserve la contraseña generada, su único destino posible
 * es la pantalla de cambio de clave (el backend bloquea todo lo demás).
 */
export function destinoTrasLogin(user: AuthUser): string {
  if (user.mustChangePassword) return ROUTES.cambiarPassword;
  return user.rol === "ADMIN" ? ROUTES.admin : ROUTES.perfil;
}
