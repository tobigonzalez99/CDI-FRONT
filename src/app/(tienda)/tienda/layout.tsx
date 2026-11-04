import type { Metadata } from "next";

import { CarritoProvider } from "@/features/tienda/carrito/carrito-context";
import { BarraMaqueta } from "@/features/tienda/maqueta/barra-maqueta";

/**
 * Tienda online. En producción se va a servir en tienda.cdindependencia.com.ar;
 * mientras se arma no se indexa.
 */
export const metadata: Metadata = {
  title: { default: "Tienda oficial", template: "%s | Tienda oficial CDI" },
  robots: { index: false, follow: false },
};

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <CarritoProvider>
      <BarraMaqueta />
      {children}
    </CarritoProvider>
  );
}
