import type { Metadata } from "next";

import { AjustesTienda } from "@/features/tienda/components/panel/ajustes-tienda";

export const metadata: Metadata = { title: "Ajustes" };

export default function PanelAjustesPage() {
  return <AjustesTienda />;
}
