import type { Metadata } from "next";

import { PedidosAdmin } from "@/features/tienda/components/panel/pedidos-admin";

export const metadata: Metadata = { title: "Pedidos" };

export default function PanelPedidosPage() {
  return <PedidosAdmin />;
}
