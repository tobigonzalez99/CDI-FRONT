import type { Metadata } from "next";

import { PanelCobranzas } from "@/features/admin/components/panel-cobranzas";

export const metadata: Metadata = { title: "Cobranzas" };

export default function AdminCobranzasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Estadísticas de cobranza</h1>
        <p className="text-sm text-muted-foreground">
          Lo recaudado, su evolución mes a mes y el desglose por medio de pago y cuenta.
        </p>
      </div>

      <PanelCobranzas />
    </div>
  );
}
