import type { Metadata } from "next";

import { ResultadoPago } from "@/features/mercadopago/components/resultado-pago";

export const metadata: Metadata = {
  title: "Resultado del pago",
  robots: { index: false, follow: false },
};

/**
 * Vuelta desde Mercado Pago. De todo lo que trae la URL se usa solo `ref`,
 * la referencia que generó el backend; los parámetros que agrega Mercado
 * Pago se ignoran porque cualquiera los puede escribir a mano.
 */
export default async function ResultadoPagoPage({
  searchParams,
}: PageProps<"/pagos/resultado">) {
  const { ref } = await searchParams;
  const referencia = typeof ref === "string" && ref.trim() ? ref.trim() : null;

  return (
    <div className="flex items-center justify-center px-4 py-12 sm:py-20">
      <ResultadoPago referencia={referencia} />
    </div>
  );
}
