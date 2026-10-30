import type { Metadata } from "next";

import { ElegirPasswordConEnlace } from "@/features/auth/components/elegir-password-con-enlace";

/**
 * Llega con un token personal en la URL: nada que indexar. El encabezado
 * `Referrer-Policy: no-referrer` de esta ruta está en `next.config.ts`.
 */
export const metadata: Metadata = {
  title: "Elegir contraseña",
  robots: { index: false, follow: false },
};

export default function ElegirPasswordPage() {
  return <ElegirPasswordConEnlace />;
}
