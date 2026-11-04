import type { Metadata } from "next";

import { CategoriasAdmin } from "@/features/tienda/components/panel/categorias-admin";

export const metadata: Metadata = { title: "Categorías" };

export default function PanelCategoriasPage() {
  return <CategoriasAdmin />;
}
