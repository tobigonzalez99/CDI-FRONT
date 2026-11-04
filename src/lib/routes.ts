import type { AuthUser } from "@/types/auth";

export const ROUTES = {
  home: "/",
  login: "/login",
  cambiarPassword: "/cambiar-password",
  perfil: "/perfil",
  admin: "/admin",
  adminSocios: "/admin/socios",
  tienda: "/tienda",
  tiendaPanel: "/tienda/panel",
  misCompras: "/tienda/mis-compras",
} as const;

/**
 * A dónde mandar al usuario después de autenticarse.
 * HU-03: mientras conserve la contraseña generada, su único destino posible
 * es la pantalla de cambio de clave (el backend bloquea todo lo demás).
 */
export function destinoTrasLogin(user: AuthUser): string {
  if (user.mustChangePassword) return ROUTES.cambiarPassword;
  return inicioDelRol(user.rol);
}

/** La sección propia de cada rol: adonde va al entrar o si cae en una ajena. */
export function inicioDelRol(rol: AuthUser["rol"]): string {
  if (rol === "ADMIN") return ROUTES.admin;
  if (rol === "TIENDA") return ROUTES.tiendaPanel;
  return ROUTES.perfil;
}

/**
 * Al entrar desde la tienda el comprador se queda donde estaba, con su
 * precio de socio a la vista. Solo se lo mueve si tiene que cambiar la clave
 * o si es un operador, que va a su panel. `null`: no moverse.
 */
export function destinoTrasLoginEnTienda(user: AuthUser): string | null {
  if (user.mustChangePassword) return ROUTES.cambiarPassword;
  if (user.rol === "TIENDA") return ROUTES.tiendaPanel;
  return null;
}
