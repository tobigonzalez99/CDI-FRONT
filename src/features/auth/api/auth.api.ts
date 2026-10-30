import { api } from "@/lib/api/client";
import type {
  ChangePasswordInput,
  ForcedChangePasswordInput,
  ForgotPasswordInput,
  LoginCredentials,
  LoginResponse,
  PasswordLinkInfo,
  PasswordLinkInput,
  ResetPasswordInput,
  Session,
} from "@/types/auth";

/** HU-02. El backend setea la cookie httpOnly; acá solo vuelve el usuario. */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", credentials);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

/** Sesión actual. Es la fuente de verdad: el backend revalida token, rol y estado. */
export async function obtenerSesion(): Promise<Session> {
  const { data } = await api.get<Session>("/auth/me");
  return data;
}

/** HU-03: primer ingreso. No pide la contraseña actual. */
export async function cambiarPasswordInicial(
  input: ForcedChangePasswordInput,
): Promise<Session> {
  const { data } = await api.post<Session>("/auth/change-initial-password", input);
  return data;
}

/** HU-05: cambio voluntario desde "Mi Perfil". */
export async function cambiarPassword(input: ChangePasswordInput): Promise<Session> {
  const { data } = await api.post<Session>("/auth/change-password", input);
  return data;
}

/**
 * "Olvidé mi contraseña". Responde 204 **siempre**, sea o no el correo de un
 * socio: si contestara distinto, el formulario serviría para averiguar quién
 * es socio del club.
 */
export async function pedirRecuperacion(input: ForgotPasswordInput): Promise<void> {
  await api.post("/auth/forgot-password", input);
}

/** Qué enlace es y a nombre de quién, para saludar. No lo consume. */
export async function validarEnlacePassword(
  input: PasswordLinkInput,
): Promise<PasswordLinkInfo> {
  const { data } = await api.post<PasswordLinkInfo>("/auth/password-link/validate", input);
  return data;
}

/**
 * Elige la contraseña con el enlace del correo y deja la sesión iniciada.
 * Un error de validación no gasta el enlace: se puede reintentar.
 */
export async function elegirPasswordConEnlace(input: ResetPasswordInput): Promise<Session> {
  const { data } = await api.post<Session>("/auth/reset-password", input);
  return data;
}
