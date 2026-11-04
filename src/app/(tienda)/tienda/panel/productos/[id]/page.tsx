import type { Metadata } from "next";

import { EditorProducto } from "@/features/tienda/components/panel/editor-producto";

export const metadata: Metadata = { title: "Producto" };

export default async function EditarProductoPage({ params }: PageProps<"/tienda/panel/productos/[id]">) {
  const { id } = await params;
  return <EditorProducto id={id} />;
}
