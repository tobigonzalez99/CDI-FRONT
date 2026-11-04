import type { Metadata } from "next";

import { FormularioNuevoProducto } from "@/features/tienda/components/panel/formulario-nuevo-producto";

export const metadata: Metadata = { title: "Nuevo producto" };

export default function NuevoProductoPage() {
  return <FormularioNuevoProducto />;
}
