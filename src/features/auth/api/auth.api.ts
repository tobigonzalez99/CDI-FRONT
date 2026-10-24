import { api } from "@/lib/api/client";
import type {
  ChangePasswordInput,
  ForcedChangePasswordInput,
  LoginCredentials,
  LoginResponse,
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
