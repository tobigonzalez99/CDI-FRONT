import type { Metadata } from "next";

import { PedidosAdmin } from "@/features/tienda/components/panel/pedidos-admin";

export const metadata: Metadata = { title: "Pedidos" };

/** `?preventa=1` llega desde la vista de preventas. */
export default async function PanelPedidosPage({ searchParams }: PageProps<"/tienda/panel/pedidos">) {
  const { preventa } = await searchParams;
  return <PedidosAdmin soloPreventaInicial={preventa === "1"} />;
}
