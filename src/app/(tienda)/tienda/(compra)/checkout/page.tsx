import type { Metadata } from "next";

import { Checkout } from "@/features/tienda/components/checkout";

export const metadata: Metadata = { title: "Finalizar compra" };

export default function CheckoutPage() {
  return <Checkout />;
}
