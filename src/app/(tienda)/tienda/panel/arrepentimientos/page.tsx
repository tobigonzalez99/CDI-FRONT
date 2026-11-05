import type { Metadata } from "next";

import { ArrepentimientosAdmin } from "@/features/tienda/components/panel/arrepentimientos-admin";

export const metadata: Metadata = { title: "Arrepentimientos" };

export default function PanelArrepentimientosPage() {
  return <ArrepentimientosAdmin />;
}
