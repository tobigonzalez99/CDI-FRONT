"use client";

import { useEffect, useState } from "react";

/**
 * Retrasa un valor hasta que deja de cambiar por `demoraMs`.
 * Se usa en la búsqueda del padrón: sin esto, cada tecla dispararía una
 * consulta al backend.
 */
export function useDebounce<T>(valor: T, demoraMs = 350): T {
  const [retrasado, setRetrasado] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setRetrasado(valor), demoraMs);
    return () => clearTimeout(temporizador);
  }, [valor, demoraMs]);

  return retrasado;
}
