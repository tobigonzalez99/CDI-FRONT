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
