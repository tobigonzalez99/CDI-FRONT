import type { Metadata } from "next";

import { BarraMaqueta } from "@/features/tienda/maqueta/barra-maqueta";
import { MaquetaProvider } from "@/features/tienda/maqueta/maqueta-context";

/**
 * Maqueta de la tienda online (tarea 0): propuesta visual con datos fijos,
 * sin API. En producción se va a servir en tienda.cdindependencia.com.ar.
 */
export const metadata: Metadata = {
  title: { default: "Tienda oficial", template: "%s | Tienda oficial CDI" },
  robots: { index: false, follow: false },
};

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <MaquetaProvider>
      <BarraMaqueta />
      {children}
    </MaquetaProvider>
  );
}
