import type { Metadata } from "next";

import { PanelVentas } from "@/features/tienda/components/panel/panel-ventas";

export const metadata: Metadata = { title: "Ventas" };

export default function PanelVentasPage() {
  return <PanelVentas />;
}
