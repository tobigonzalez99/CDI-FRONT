import type { Metadata } from "next";

import { SeguimientoPedido } from "@/features/tienda/components/seguimiento-pedido";

export const metadata: Metadata = { title: "Tu pedido" };

export default function PedidoPage() {
  return <SeguimientoPedido />;
}
