"use client";

import { usePathname } from "next/navigation";

/**
 * Aviso en las pantallas que todavía son maqueta, con datos fijos: el
 * arrepentimiento.
 */
const PANTALLAS_DE_MAQUETA: { coincide: (ruta: string) => boolean; texto: string }[] = [
  { coincide: (ruta) => ruta.startsWith("/tienda/arrepentimiento"), texto: "Formulario de ejemplo: se conecta con los pedidos." },
];

export function BarraMaqueta() {
  const ruta = usePathname();
  const pantalla = PANTALLAS_DE_MAQUETA.find((item) => item.coincide(ruta));

  if (!pantalla) return null;

  return (
    <div className="bg-amber-300 text-amber-950">
      <p className="container mx-auto px-4 py-1.5 text-xs font-medium">{pantalla.texto}</p>
    </div>
  );
}
