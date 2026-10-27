import type { Metadata } from "next";

import { SolicitudesPendientes } from "@/features/solicitudes/components/solicitudes-pendientes";

export const metadata: Metadata = { title: "Panel de administración" };

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Solicitudes de alta</h1>
        <p className="text-sm text-muted-foreground">
          Postulaciones recibidas desde el sitio, de la más antigua a la más reciente.
        </p>
      </div>

      <SolicitudesPendientes />
    </div>
  );
}
