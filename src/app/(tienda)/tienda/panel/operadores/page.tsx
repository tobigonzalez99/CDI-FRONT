import type { Metadata } from "next";

import { OperadoresTienda } from "@/features/tienda/components/panel/operadores-tienda";

export const metadata: Metadata = { title: "Usuarios" };

export default function PanelOperadoresPage() {
  return <OperadoresTienda />;
}
