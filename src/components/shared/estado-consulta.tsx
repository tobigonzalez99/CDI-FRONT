import { LoaderCircle, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { mensajeDeError } from "@/lib/api/errors";

export function Cargando({ etiqueta = "Cargando…" }: { etiqueta?: string }) {
  return (
    <div className="flex justify-center py-12" role="status" aria-live="polite">
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-hidden />
      <span className="sr-only">{etiqueta}</span>
    </div>
  );
}

/**
 * Error de una consulta, con reintento.
 * El mensaje sale del backend (ya normalizado por el interceptor), así que el
 * usuario ve la causa real y no un texto genérico.
 */
export function ErrorConsulta({
  error,
  onReintentar,
}: {
  error: unknown;
  onReintentar?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
      <TriangleAlert className="size-7 text-muted-foreground" aria-hidden />
      <p className="max-w-sm text-sm text-muted-foreground">{mensajeDeError(error)}</p>
      {onReintentar && (
        <Button type="button" variant="outline" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
