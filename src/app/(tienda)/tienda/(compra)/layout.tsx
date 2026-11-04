import { CarritoDrawer } from "@/features/tienda/components/carrito-drawer";
import { TiendaFooter } from "@/features/tienda/components/tienda-footer";
import { TiendaHeader } from "@/features/tienda/components/tienda-header";

export default function CompraLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TiendaHeader />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <TiendaFooter />
      <CarritoDrawer />
    </>
  );
}
