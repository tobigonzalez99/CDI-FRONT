import type { ApiError, ISODateString } from "./api";

export const USER_ROLES = ["SOCIO", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** HU-02: credenciales de acceso (DNI + contraseña). */
export interface LoginCredentials {
  dni: string;
  password: string;
}

/** Usuario autenticado. No incluye datos sensibles ni el token. */
export interface AuthUser {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  /** Socio asociado. `null` para administradores sin ficha de socio. */
  socioId: string | null;
  /**
   * HU-03: `true` mientras el usuario conserve la contraseña generada automáticamente.
   * El proxy y el guard de cliente redirigen a /cambiar-password hasta que sea `false`.
   */
  mustChangePassword: boolean;
}

/**
 * Respuesta de POST /auth/login.
 * El token viaja en una cookie httpOnly seteada por el backend; nunca se expone a JS.
 */
export interface LoginResponse {
  user: AuthUser;
  expiresAt: ISODateString;
}

export interface Session {
  user: AuthUser;
  expiresAt: ISODateString;
}

/** HU-03: cambio obligatorio en el primer ingreso (no se pide la clave actual: acaba de ingresarla). */
export interface ForcedChangePasswordInput {
  newPassword: string;
  confirmPassword: string;
}

/** HU-05: cambio voluntario desde "Mi Perfil". */
export interface ChangePasswordInput extends ForcedChangePasswordInput {
  currentPassword: string;
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_DISABLED"
  | "PASSWORD_CHANGE_REQUIRED"
  | "WEAK_PASSWORD"
  | "SESSION_EXPIRED"
  | "FORBIDDEN"
  | "INVALID_TOKEN"
  | "TOO_MANY_REQUESTS";

export type AuthError = ApiError<AuthErrorCode>;

/** Pedido de recuperación: siempre responde lo mismo, exista o no el correo. */
export interface ForgotPasswordInput {
  email: string;
}

/** El token que llega en el enlace de los correos. */
export interface PasswordLinkInput {
  token: string;
}

/**
 * Para qué es el enlace. La bienvenida la manda el alta del socio (dura 7
 * días); la recuperación, el pedido de "olvidé mi contraseña" (dura 1 hora).
 */
export const TIPOS_ENLACE_PASSWORD = ["BIENVENIDA", "RECUPERACION"] as const;
export type TipoEnlacePassword = (typeof TIPOS_ENLACE_PASSWORD)[number];

export interface PasswordLinkInfo {
  tipo: TipoEnlacePassword;
  nombre: string;
}

/** Elegir la contraseña desde el enlace. Misma política que el cambio forzado. */
export interface ResetPasswordInput extends ForcedChangePasswordInput {
  token: string;
}
