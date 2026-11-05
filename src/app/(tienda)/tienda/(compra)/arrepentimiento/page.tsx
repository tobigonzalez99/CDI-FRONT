import type { Metadata } from "next";

import { FormularioArrepentimiento } from "@/features/tienda/components/formulario-arrepentimiento";

export const metadata: Metadata = { title: "Botón de arrepentimiento" };

/** `?pedido=` llega desde el detalle de una compra: el código no es secreto. */
export default async function ArrepentimientoPage({ searchParams }: PageProps<"/tienda/arrepentimiento">) {
  const { pedido } = await searchParams;
  return <FormularioArrepentimiento codigoInicial={typeof pedido === "string" ? pedido : ""} />;
}
