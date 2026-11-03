import type { Metadata } from "next";

import { DevolucionesPendientes } from "@/features/pagos/components/devoluciones-pendientes";

export const metadata: Metadata = { title: "Devoluciones" };

export default function AdminDevolucionesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Devoluciones y contracargos</h1>
        <p className="text-sm text-muted-foreground">
          Cobros online que se devolvieron desde Mercado Pago o que el pagador desconoció
          ante su tarjeta. El sistema los detecta solo y anula el pago cuando corresponde:
          acá revisás cada caso y lo marcás como visto.
        </p>
      </div>

      <DevolucionesPendientes />
    </div>
  );
}
