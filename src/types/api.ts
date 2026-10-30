/** Fecha en formato ISO 8601 tal como la serializa la API (ej: "2026-09-16" o "2026-09-16T12:00:00Z"). */
export type ISODateString = string;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** Forma normalizada de los errores que devuelve la API. */
export interface ApiError<TCode extends string = string> {
  status: number;
  code: TCode;
  message: string;
  /** Errores por campo, para mapear a React Hook Form con setError. */
  fieldErrors?: Record<string, string[]>;
}

/**
 * Códigos de error que devuelve la API. Son estables: el frontend decide
 * según `code`, nunca según el texto del mensaje.
 */
export const API_ERROR_CODES = [
  "VALIDATION_ERROR",
  "BAD_REQUEST",
  "INVALID_CREDENTIALS",
  "ACCOUNT_DISABLED",
  "PASSWORD_CHANGE_REQUIRED",
  "WEAK_PASSWORD",
  "SESSION_EXPIRED",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "PAYLOAD_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
  "TOO_MANY_REQUESTS",
  "PASSWORD_CHANGE_LIMIT",
  /** Enlace de contraseña inexistente, ya usado o vencido. */
  "INVALID_TOKEN",
  "INTERNAL_ERROR",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];
