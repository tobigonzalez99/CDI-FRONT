import type { Metadata } from "next";

import { CheckoutMaqueta } from "@/features/tienda/components/checkout-maqueta";

export const metadata: Metadata = { title: "Finalizar compra" };

export default function CheckoutPage() {
  return <CheckoutMaqueta />;
}
