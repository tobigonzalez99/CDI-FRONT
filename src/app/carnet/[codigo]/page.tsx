import type { Metadata } from "next";

import { ControlAcceso } from "@/features/carnet/components/control-acceso";

/**
 * Cada dirección identifica a un socio: no tiene nada que hacer en un
 * buscador. `noindex` evita que termine indexada si alguien comparte el
 * enlace por error.
 */
export const metadata: Metadata = {
  title: "Control de acceso",
  robots: { index: false, follow: false },
};

/** Pantalla que abre el celular al escanear el QR de un carnet de socio. */
export default async function CarnetPage({ params }: PageProps<"/carnet/[codigo]">) {
  const { codigo } = await params;

  return <ControlAcceso codigo={codigo} />;
}
