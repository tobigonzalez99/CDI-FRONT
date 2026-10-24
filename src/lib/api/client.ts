import axios, { AxiosError, type AxiosInstance } from "axios";

import type { ApiError } from "@/types/api";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error(
    "Falta NEXT_PUBLIC_API_URL. Copiá .env.example a .env.local y apuntalo al backend.",
  );
}

/**
 * Cliente HTTP del backend.
 *
 * `withCredentials` es imprescindible: el JWT viaja en una cookie httpOnly que
 * el navegador solo envía si la petición declara que acepta credenciales.
 */
export const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

/** Error que no vino del backend (red caída, CORS, timeout). */
function errorDeRed(): ApiError {
  return {
    status: 0,
    code: "NETWORK_ERROR",
    message:
      "No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.",
  };
}

function esApiErrorBody(body: unknown): body is ApiError {
  if (typeof body !== "object" || body === null) return false;
  const candidato = body as Partial<ApiError>;
  return (
    typeof candidato.status === "number" &&
    typeof candidato.code === "string" &&
    typeof candidato.message === "string"
  );
}

/**
 * Normaliza cualquier fallo a `ApiError`, para que la UI nunca tenga que
 * mirar la forma cruda de axios ni distinguir entre tipos de error.
 */
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!(error instanceof AxiosError)) {
      return Promise.reject(errorDeRed());
    }

    const body: unknown = error.response?.data;
    if (esApiErrorBody(body)) {
      return Promise.reject(body);
    }

    // Hubo respuesta pero no respeta el contrato (proxy, 502, HTML de error…).
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        code: "INTERNAL_ERROR",
        message: "El servidor respondió de una forma inesperada.",
      } satisfies ApiError);
    }

    return Promise.reject(errorDeRed());
  },
);
