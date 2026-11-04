import type { Metadata } from "next";

import { RequireAuth } from "@/features/auth/components/require-auth";
import { PanelTiendaHeader } from "@/features/tienda/components/panel/panel-tienda-header";
import { PanelTiendaNav } from "@/features/tienda/components/panel/panel-tienda-nav";

export const metadata: Metadata = { title: { default: "Panel", template: "%s · Panel | Tienda CDI" } };

/**
 * Panel de la tienda. Lo usan el ADMIN y el operador (rol TIENDA), que entra
 * con su DNI y su contraseña como cualquiera y ve solo estas secciones.
 */
export default function PanelTiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PanelTiendaHeader />
      <main className="container mx-auto flex-1 px-4 py-8">
        <RequireAuth roles={["ADMIN", "TIENDA"]}>
          <div className="space-y-6">
            <PanelTiendaNav />
            {children}
          </div>
        </RequireAuth>
      </main>
    </>
  );
}
