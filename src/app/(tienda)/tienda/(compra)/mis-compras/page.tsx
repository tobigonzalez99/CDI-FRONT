import type { Metadata } from "next";

import { MisCompras } from "@/features/tienda/components/mis-compras";

export const metadata: Metadata = { title: "Mis compras" };

export default function MisComprasPage() {
  return <MisCompras />;
}
