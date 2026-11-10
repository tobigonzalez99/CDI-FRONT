import type { Metadata } from "next";

import { PreventasAdmin } from "@/features/tienda/components/panel/preventas-admin";

export const metadata: Metadata = { title: "Preventas" };

export default function PanelPreventasPage() {
  return <PreventasAdmin />;
}
