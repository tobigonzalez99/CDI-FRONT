import type { Metadata } from "next";

import { BajasPendientes } from "@/features/solicitudes/components/bajas-pendientes";

export const metadata: Metadata = { title: "Solicitudes de baja" };

export default function AdminBajasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Solicitudes de baja</h1>
        <p className="text-sm text-muted-foreground">
          Socios que pidieron dejar de serlo, del pedido más antiguo al más reciente.
          Dar de baja no borra nada: el socio se puede reactivar desde su ficha.
        </p>
      </div>

      <BajasPendientes />
    </div>
  );
}
