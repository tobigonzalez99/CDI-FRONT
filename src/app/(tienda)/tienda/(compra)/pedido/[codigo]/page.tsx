import type { Metadata } from "next";

import { SeguimientoPedido } from "@/features/tienda/components/seguimiento-pedido";

export const metadata: Metadata = { title: "Tu pedido" };

export default async function PedidoPage({ params, searchParams }: PageProps<"/tienda/pedido/[codigo]">) {
  const { codigo } = await params;
  const { nuevo } = await searchParams;
  return <SeguimientoPedido codigo={codigo} nuevo={nuevo === "1"} />;
}
