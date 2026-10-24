import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import type { ApiError } from "@/types/api";

/**
 * Todo error que sale del cliente HTTP ya pasó por el interceptor,
 * así que tiene esta forma. El type guard es para TypeScript, que en los
 * `catch` solo ve `unknown`.
 */
export function esApiError(error: unknown): error is ApiError {
  if (typeof error !== "object" || error === null) return false;
  const candidato = error as Partial<ApiError>;
  return (
    typeof candidato.status === "number" &&
    typeof candidato.code === "string" &&
    typeof candidato.message === "string"
  );
}

export function mensajeDeError(
  error: unknown,
  porDefecto = "Ocurrió un error inesperado. Intentá nuevamente.",
): string {
  return esApiError(error) ? error.message : porDefecto;
}

/**
 * Vuelca los `fieldErrors` del backend en el formulario.
 * Las claves usan notación de puntos (`vigencia.hasta`), que es exactamente
 * lo que react-hook-form espera para campos anidados.
 *
 * Devuelve `true` si pudo asignar al menos un campo; si no, quien llama
 * debería mostrar el mensaje general (si no, el error pasaría inadvertido).
 */
export function aplicarFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  camposDelFormulario?: ReadonlyArray<Path<T>>,
): boolean {
  if (!esApiError(error) || !error.fieldErrors) return false;

  let asignado = false;

  for (const [campo, mensajes] of Object.entries(error.fieldErrors)) {
    const [primerMensaje] = mensajes;
    if (!primerMensaje) continue;

    // Un campo que el formulario no tiene nunca se mostraría.
    if (camposDelFormulario && !camposDelFormulario.includes(campo as Path<T>)) {
      continue;
    }

    setError(campo as Path<T>, { type: "server", message: primerMensaje });
    asignado = true;
  }

  return asignado;
}
