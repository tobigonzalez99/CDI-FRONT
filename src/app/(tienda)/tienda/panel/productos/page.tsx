import type { Metadata } from "next";

import { ListaProductosAdmin } from "@/features/tienda/components/panel/lista-productos-admin";

export const metadata: Metadata = { title: "Productos" };

export default function PanelProductosPage() {
  return <ListaProductosAdmin />;
}
