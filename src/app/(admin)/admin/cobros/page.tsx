import type { Metadata } from "next";

import { FormularioCobro } from "@/features/pagos/components/formulario-cobro";
import { PagosRecientes } from "@/features/pagos/components/pagos-recientes";

export const metadata: Metadata = { title: "Registrar cobro" };

export default function AdminCobrosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Cobros</h1>
        <p className="text-sm text-muted-foreground">
          Registrá el pago de una cuota y consultá los últimos movimientos.
        </p>
      </div>

      <FormularioCobro />
      <PagosRecientes />
    </div>
  );
}
