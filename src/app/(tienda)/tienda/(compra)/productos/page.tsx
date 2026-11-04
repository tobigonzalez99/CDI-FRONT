import { Suspense } from "react";
import type { Metadata } from "next";

import { Catalogo } from "@/features/tienda/components/catalogo";

export const metadata: Metadata = { title: "Productos" };

export default function ProductosPage() {
  return (
    // Los filtros viven en la URL: useSearchParams pide un Suspense alrededor.
    <Suspense>
      <Catalogo />
    </Suspense>
  );
}
