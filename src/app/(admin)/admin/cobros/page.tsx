import type { Metadata } from "next";

import { AnularCobros } from "@/features/pagos/components/anular-cobros";
import { FormularioCobro } from "@/features/pagos/components/formulario-cobro";

export const metadata: Metadata = { title: "Registrar cobro" };

export default function AdminCobrosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Cobros</h1>
        <p className="text-sm text-muted-foreground">
          Registrá el pago de una cuota o anulá un cobro mal cargado.
        </p>
      </div>

      <FormularioCobro />
      <AnularCobros />
    </div>
  );
}
