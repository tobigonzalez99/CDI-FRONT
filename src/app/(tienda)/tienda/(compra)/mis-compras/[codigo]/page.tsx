import type { Metadata } from "next";

import { MiCompra } from "@/features/tienda/components/mis-compras";

export const metadata: Metadata = { title: "Mi compra" };

export default async function MiCompraPage({ params }: PageProps<"/tienda/mis-compras/[codigo]">) {
  const { codigo } = await params;
  return <MiCompra codigo={decodeURIComponent(codigo)} />;
}
